package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/jsii-runtime-go"
	// Add imports for JWT and Momento if you implement those sections
	// "github.com/golang-jwt/jwt/v5"
	// "github.com/momentohq/client-sdk-go/auth"
	// "github.com/momentohq/client-sdk-go/config"
	// "github.com/momentohq/client-sdk-go/momento"
)

// Configuration loaded from environment variables
type AppConfig struct {
	GitHubClientID      string
	GitHubClientSecret  string
	DynamoDBTableName   string
	FrontendRedirectURL string // URL to redirect back to the mobile app (e.g., deeplink)
	// Add JWTSecret and MomentoAuthToken if used
}

// Struct to hold user data from GitHub API
type GitHubUser struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"` // May be null if private
	AvatarURL string `json:"avatar_url"`
}

// Struct to store in DynamoDB
type UserRecord struct {
	GitHubID  string    `dynamodbav:"githubId"` // Partition Key
	Username  string    `dynamodbav:"username"`
	Name      string    `dynamodbav:"name"`
	Email     string    `dynamodbav:"email,omitempty"` // Store email if available
	AvatarURL string    `dynamodbav:"avatarUrl"`
	LastLogin time.Time `dynamodbav:"lastLogin"`
	CreatedAt time.Time `dynamodbav:"createdAt,omitempty"` // Only set on first creation
	// Add other fields as needed
}

// Struct for GitHub token exchange response
type GitHubTokenResponse struct {
	AccessToken string `json:"access_token"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
}

var (
	appConfig    AppConfig
	dynamoClient *dynamodb.Client
	httpClient   = &http.Client{Timeout: 10 * time.Second}
	// momentoClient momento.CacheClient // Uncomment if using Momento
)

// Initialize AWS SDK clients and load config
func init() {
	// Load configuration from environment variables
	appConfig = AppConfig{
		GitHubClientID:      os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret:  os.Getenv("GITHUB_CLIENT_SECRET"),
		DynamoDBTableName:   os.Getenv("DYNAMODB_TABLE_NAME"),
		FrontendRedirectURL: os.Getenv("FRONTEND_REDIRECT_URL"), // Get redirect URL from env
		// Load other env vars (JWT_SECRET, MOMENTO_AUTH_TOKEN) here
	}

	if appConfig.GitHubClientID == "" || appConfig.GitHubClientSecret == "" || appConfig.DynamoDBTableName == "" || appConfig.FrontendRedirectURL == "" {
		log.Fatal("Missing required environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DYNAMODB_TABLE_NAME, FRONTEND_REDIRECT_URL)")
	}

	// Initialize DynamoDB client
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Unable to load SDK config, %v", err)
	}
	dynamoClient = dynamodb.NewFromConfig(cfg)

	// Initialize Momento Client (Uncomment if using)
	/*
		momentoAuthToken := os.Getenv("MOMENTO_AUTH_TOKEN")
		if momentoAuthToken == "" {
			log.Fatal("Missing MOMENTO_AUTH_TOKEN environment variable")
		}
		credProvider, err := auth.FromString(momentoAuthToken)
		if err != nil {
			log.Fatalf("Error creating Momento credential provider: %v", err)
		}
		momentoCfg := config.LaptopLatest() // Or use InRegion appropriate for your Lambda
		client, err := momento.NewCacheClient(momentoCfg, credProvider, 60*time.Second) // Default TTL
		if err != nil {
			log.Fatalf("Error creating Momento client: %v", err)
		}
		momentoClient = client
		// Ensure cache exists (replace 'splitbucks-sessions' with your cache name)
		// _, err = momentoClient.CreateCache(context.Background(), &momento.CreateCacheRequest{CacheName: "splitbucks-sessions"})
		// if err != nil {
		//   // Handle potential cache already exists error gracefully if needed
		//   log.Printf("Could not create cache (may already exist): %v", err)
		// }
	*/
}

// Lambda handler function
func HandleRequest(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	code := request.QueryStringParameters["code"]
	state := request.QueryStringParameters["state"] // Optional: Validate state if you used one

	if code == "" {
		log.Println("Error: No 'code' parameter found in request")
		return errorResponse(http.StatusBadRequest, "Authorization code missing"), nil
	}

	// --- 1. Exchange code for access token ---
	accessToken, err := exchangeCodeForToken(code, state)
	if err != nil {
		log.Printf("Error exchanging code for token: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to exchange authorization code"), nil
	}

	// --- 2. Fetch user data from GitHub ---
	githubUser, err := fetchGitHubUser(accessToken)
	if err != nil {
		log.Printf("Error fetching GitHub user data: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to fetch user data from GitHub"), nil
	}

	// --- 3. Upsert user data into DynamoDB ---
	// (Check Momento cache first if implemented)
	userRecord, err := upsertUser(ctx, githubUser)
	if err != nil {
		log.Printf("Error saving user to DynamoDB: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to save user data"), nil
	}

	// --- 4. Generate Session Token (e.g., JWT) ---
	// Implement JWT generation here using userRecord.GitHubID or other details
	// Store session in Momento if implemented
	sessionToken := "dummy-session-token-" + userRecord.GitHubID // Replace with real JWT

	// --- 5. Redirect back to Frontend ---
	// Append the session token (and potentially user info) to the redirect URL
	redirectURL := fmt.Sprintf("%s?token=%s&username=%s", appConfig.FrontendRedirectURL, url.QueryEscape(sessionToken), url.QueryEscape(userRecord.Username))

	log.Printf("Successfully authenticated user %s (%s). Redirecting.", userRecord.Username, userRecord.GitHubID)

	// Return a redirect response
	return events.APIGatewayV2HTTPResponse{
		StatusCode: http.StatusFound, // 302 Found for redirect
		Headers: map[string]string{
			"Location": redirectURL,
		},
	}, nil
}

// Exchanges the GitHub OAuth code for an access token
func exchangeCodeForToken(code, state string) (string, error) {
	tokenURL := "https://github.com/login/oauth/access_token"

	data := url.Values{}
	data.Set("client_id", appConfig.GitHubClientID)
	data.Set("client_secret", appConfig.GitHubClientSecret)
	data.Set("code", code)
	// data.Set("redirect_uri", "YOUR_CONFIGURED_REDIRECT_URI") // Optional but recommended
	// data.Set("state", state) // Include if you used state

	req, err := http.NewRequest("POST", tokenURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return "", fmt.Errorf("failed to create token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json") // Important: Ask for JSON response

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send token request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read token response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("github token exchange failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp GitHubTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("failed to parse token response JSON: %w", err)
	}

	if tokenResp.AccessToken == "" {
		return "", fmt.Errorf("access token not found in GitHub response: %s", string(body))
	}

	return tokenResp.AccessToken, nil
}

// Fetches user details from GitHub API using the access token
func fetchGitHubUser(accessToken string) (*GitHubUser, error) {
	userURL := "https://api.github.com/user"

	req, err := http.NewRequest("GET", userURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create user request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json") // Use appropriate API version

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send user request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github user fetch failed with status %d: %s", resp.StatusCode, string(body))
	}

	var githubUser GitHubUser
	if err := json.Unmarshal(body, &githubUser); err != nil {
		// Try to unmarshal as error response for better debugging
		var errResp map[string]interface{}
		_ = json.Unmarshal(body, &errResp)
		return nil, fmt.Errorf("failed to parse user response JSON: %w. Response: %v", err, errResp)
	}

	if githubUser.ID == 0 {
		return nil, fmt.Errorf("invalid user data received from GitHub: ID is zero")
	}

	return &githubUser, nil
}

// Saves or updates user data in DynamoDB
func upsertUser(ctx context.Context, user *GitHubUser) (*UserRecord, error) {
	now := time.Now()
	githubIDStr := strconv.Itoa(user.ID) // DynamoDB key is String

	// Use UpdateItem with an UpdateExpression for upsert logic
	updateExpression := "SET username = :un, #nm = :n, email = :e, avatarUrl = :a, lastLogin = :ll, #ca = if_not_exists(#ca, :ca_val)"
	expressionAttributeNames := map[string]string{
		"#nm": "name", // 'name' is a reserved keyword in DynamoDB
		"#ca": "createdAt",
	}
	expressionAttributeValues := map[string]types.AttributeValue{
		":un":     &types.AttributeValueMemberS{Value: user.Login},
		":n":      &types.AttributeValueMemberS{Value: user.Name},
		":a":      &types.AttributeValueMemberS{Value: user.AvatarURL},
		":ll":     &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)}, // Store as ISO 8601 string
		":ca_val": &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)}, // Value for createdAt if it doesn't exist
	}
	// Only set email if it's not empty from GitHub
	if user.Email != "" {
		expressionAttributeValues[":e"] = &types.AttributeValueMemberS{Value: user.Email}
	} else {
		// If email is empty, remove it or set to null if needed. Using REMOVE is safer.
		// Update expression needs adjustment to handle removal conditionally.
		// Simpler: Just don't set it if empty and rely on `omitempty` on struct for reads.
		// Or use specific logic if email removal is important.
		updateExpression = "SET username = :un, #nm = :n, avatarUrl = :a, lastLogin = :ll, #ca = if_not_exists(#ca, :ca_val) REMOVE email"
		// Note: This simplified REMOVE removes email every time if not provided by GitHub.
		// A more complex expression could check if :e is null before removing.
		delete(expressionAttributeValues, ":e") // Don't need the value if removing
	}

	updateInput := &dynamodb.UpdateItemInput{
		TableName:                 jsii.String(appConfig.DynamoDBTableName),
		Key:                       map[string]types.AttributeValue{"githubId": &types.AttributeValueMemberS{Value: githubIDStr}},
		UpdateExpression:          jsii.String(updateExpression),
		ExpressionAttributeNames:  expressionAttributeNames,
		ExpressionAttributeValues: expressionAttributeValues,
		ReturnValues:              types.ReturnValueAllNew, // Return the updated item
	}

	result, err := dynamoClient.UpdateItem(ctx, updateInput)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert user %s into DynamoDB: %w", githubIDStr, err)
	}

	// Unmarshal the updated item back into our struct
	var updatedRecord UserRecord
	err = attributevalue.UnmarshalMap(result.Attributes, &updatedRecord)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal updated DynamoDB item: %w", err)
	}

	// Store user data in Momento Cache (Uncomment if using)
	/*
		cacheKey := fmt.Sprintf("user:%s", githubIDStr)
		userDataJson, err := json.Marshal(updatedRecord)
		if err == nil {
			_, err = momentoClient.Set(ctx, &momento.SetRequest{
				CacheName: "splitbucks-sessions", // Use your cache name
				Key:       momento.String(cacheKey),
				Value:     momento.String(userDataJson),
				Ttl:       24 * time.Hour, // Example TTL
			})
			if err != nil {
				log.Printf("WARN: Failed to cache user data for %s in Momento: %v", githubIDStr, err)
				// Continue execution even if caching fails
			} else {
				log.Printf("Cached user data for %s in Momento", githubIDStr)
			}
		} else {
			log.Printf("WARN: Failed to marshal user data for caching: %v", err)
		}
	*/

	return &updatedRecord, nil
}

// Helper to create standardized error responses for API Gateway
func errorResponse(statusCode int, message string) events.APIGatewayV2HTTPResponse {
	body, _ := json.Marshal(map[string]string{"error": message})
	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       string(body),
	}
}

// Entry point for Lambda execution
func main() {
	lambda.Start(HandleRequest)
}

package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/aws/jsii-runtime-go"
	// Add imports for JWT and Momento if you implement those sections
	// "github.com/golang-jwt/jwt/v5"
	// "github.com/momentohq/client-sdk-go/auth"
	// "github.com/momentohq/client-sdk-go/config"
	// "github.com/momentohq/client-sdk-go/momento"
)

// Configuration loaded from environment variables
type AppConfig struct {
	GitHubClientID      string
	GitHubClientSecret  string
	DynamoDBTableName   string
	FrontendRedirectURL string // URL to redirect back to the mobile app (e.g., deeplink)
	// Add JWTSecret and MomentoAuthToken if used
}

// Struct to hold user data from GitHub API
type GitHubUser struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"` // May be null if private
	AvatarURL string `json:"avatar_url"`
}

// Struct to store in DynamoDB
type UserRecord struct {
	GitHubID  string    `dynamodbav:"githubId"` // Partition Key
	Username  string    `dynamodbav:"username"`
	Name      string    `dynamodbav:"name"`
	Email     string    `dynamodbav:"email,omitempty"` // Store email if available
	AvatarURL string    `dynamodbav:"avatarUrl"`
	LastLogin time.Time `dynamodbav:"lastLogin"`
	CreatedAt time.Time `dynamodbav:"createdAt,omitempty"` // Only set on first creation
	// Add other fields as needed
}

// Struct for GitHub token exchange response
type GitHubTokenResponse struct {
	AccessToken string `json:"access_token"`
	Scope       string `json:"scope"`
	TokenType   string `json:"token_type"`
}

var (
	appConfig    AppConfig
	dynamoClient *dynamodb.Client
	httpClient   = &http.Client{Timeout: 10 * time.Second}
	// momentoClient momento.CacheClient // Uncomment if using Momento
)

// Initialize AWS SDK clients and load config
func init() {
	// Load configuration from environment variables
	appConfig = AppConfig{
		GitHubClientID:      os.Getenv("GITHUB_CLIENT_ID"),
		GitHubClientSecret:  os.Getenv("GITHUB_CLIENT_SECRET"),
		DynamoDBTableName:   os.Getenv("DYNAMODB_TABLE_NAME"),
		FrontendRedirectURL: os.Getenv("FRONTEND_REDIRECT_URL"), // Get redirect URL from env
		// Load other env vars (JWT_SECRET, MOMENTO_AUTH_TOKEN) here
	}

	if appConfig.GitHubClientID == "" || appConfig.GitHubClientSecret == "" || appConfig.DynamoDBTableName == "" || appConfig.FrontendRedirectURL == "" {
		log.Fatal("Missing required environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, DYNAMODB_TABLE_NAME, FRONTEND_REDIRECT_URL)")
	}

	// Initialize DynamoDB client
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Unable to load SDK config, %v", err)
	}
	dynamoClient = dynamodb.NewFromConfig(cfg)

	// Initialize Momento Client (Uncomment if using)
	/*
		momentoAuthToken := os.Getenv("MOMENTO_AUTH_TOKEN")
		if momentoAuthToken == "" {
			log.Fatal("Missing MOMENTO_AUTH_TOKEN environment variable")
		}
		credProvider, err := auth.FromString(momentoAuthToken)
		if err != nil {
			log.Fatalf("Error creating Momento credential provider: %v", err)
		}
		momentoCfg := config.LaptopLatest() // Or use InRegion appropriate for your Lambda
		client, err := momento.NewCacheClient(momentoCfg, credProvider, 60*time.Second) // Default TTL
		if err != nil {
			log.Fatalf("Error creating Momento client: %v", err)
		}
		momentoClient = client
		// Ensure cache exists (replace 'splitbucks-sessions' with your cache name)
		// _, err = momentoClient.CreateCache(context.Background(), &momento.CreateCacheRequest{CacheName: "splitbucks-sessions"})
		// if err != nil {
		//   // Handle potential cache already exists error gracefully if needed
		//   log.Printf("Could not create cache (may already exist): %v", err)
		// }
	*/
}

// Lambda handler function
func HandleRequest(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	code := request.QueryStringParameters["code"]
	state := request.QueryStringParameters["state"] // Optional: Validate state if you used one

	if code == "" {
		log.Println("Error: No 'code' parameter found in request")
		return errorResponse(http.StatusBadRequest, "Authorization code missing"), nil
	}

	// --- 1. Exchange code for access token ---
	accessToken, err := exchangeCodeForToken(code, state)
	if err != nil {
		log.Printf("Error exchanging code for token: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to exchange authorization code"), nil
	}

	// --- 2. Fetch user data from GitHub ---
	githubUser, err := fetchGitHubUser(accessToken)
	if err != nil {
		log.Printf("Error fetching GitHub user data: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to fetch user data from GitHub"), nil
	}

	// --- 3. Upsert user data into DynamoDB ---
	// (Check Momento cache first if implemented)
	userRecord, err := upsertUser(ctx, githubUser)
	if err != nil {
		log.Printf("Error saving user to DynamoDB: %v", err)
		return errorResponse(http.StatusInternalServerError, "Failed to save user data"), nil
	}

	// --- 4. Generate Session Token (e.g., JWT) ---
	// Implement JWT generation here using userRecord.GitHubID or other details
	// Store session in Momento if implemented
	sessionToken := "dummy-session-token-" + userRecord.GitHubID // Replace with real JWT

	// --- 5. Redirect back to Frontend ---
	// Append the session token (and potentially user info) to the redirect URL
	redirectURL := fmt.Sprintf("%s?token=%s&username=%s", appConfig.FrontendRedirectURL, url.QueryEscape(sessionToken), url.QueryEscape(userRecord.Username))

	log.Printf("Successfully authenticated user %s (%s). Redirecting.", userRecord.Username, userRecord.GitHubID)

	// Return a redirect response
	return events.APIGatewayV2HTTPResponse{
		StatusCode: http.StatusFound, // 302 Found for redirect
		Headers: map[string]string{
			"Location": redirectURL,
		},
	}, nil
}

// Exchanges the GitHub OAuth code for an access token
func exchangeCodeForToken(code, state string) (string, error) {
	tokenURL := "https://github.com/login/oauth/access_token"

	data := url.Values{}
	data.Set("client_id", appConfig.GitHubClientID)
	data.Set("client_secret", appConfig.GitHubClientSecret)
	data.Set("code", code)
	// data.Set("redirect_uri", "YOUR_CONFIGURED_REDIRECT_URI") // Optional but recommended
	// data.Set("state", state) // Include if you used state

	req, err := http.NewRequest("POST", tokenURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return "", fmt.Errorf("failed to create token request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json") // Important: Ask for JSON response

	resp, err := httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send token request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read token response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("github token exchange failed with status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp GitHubTokenResponse
	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("failed to parse token response JSON: %w", err)
	}

	if tokenResp.AccessToken == "" {
		return "", fmt.Errorf("access token not found in GitHub response: %s", string(body))
	}

	return tokenResp.AccessToken, nil
}

// Fetches user details from GitHub API using the access token
func fetchGitHubUser(accessToken string) (*GitHubUser, error) {
	userURL := "https://api.github.com/user"

	req, err := http.NewRequest("GET", userURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create user request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json") // Use appropriate API version

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send user request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read user response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("github user fetch failed with status %d: %s", resp.StatusCode, string(body))
	}

	var githubUser GitHubUser
	if err := json.Unmarshal(body, &githubUser); err != nil {
		// Try to unmarshal as error response for better debugging
		var errResp map[string]interface{}
		_ = json.Unmarshal(body, &errResp)
		return nil, fmt.Errorf("failed to parse user response JSON: %w. Response: %v", err, errResp)
	}

	if githubUser.ID == 0 {
		return nil, fmt.Errorf("invalid user data received from GitHub: ID is zero")
	}

	return &githubUser, nil
}

// Saves or updates user data in DynamoDB
func upsertUser(ctx context.Context, user *GitHubUser) (*UserRecord, error) {
	now := time.Now()
	githubIDStr := strconv.Itoa(user.ID) // DynamoDB key is String

	// Use UpdateItem with an UpdateExpression for upsert logic
	updateExpression := "SET username = :un, #nm = :n, email = :e, avatarUrl = :a, lastLogin = :ll, #ca = if_not_exists(#ca, :ca_val)"
	expressionAttributeNames := map[string]string{
		"#nm": "name", // 'name' is a reserved keyword in DynamoDB
		"#ca": "createdAt",
	}
	expressionAttributeValues := map[string]types.AttributeValue{
		":un":     &types.AttributeValueMemberS{Value: user.Login},
		":n":      &types.AttributeValueMemberS{Value: user.Name},
		":a":      &types.AttributeValueMemberS{Value: user.AvatarURL},
		":ll":     &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)}, // Store as ISO 8601 string
		":ca_val": &types.AttributeValueMemberS{Value: now.Format(time.RFC3339)}, // Value for createdAt if it doesn't exist
	}
	// Only set email if it's not empty from GitHub
	if user.Email != "" {
		expressionAttributeValues[":e"] = &types.AttributeValueMemberS{Value: user.Email}
	} else {
		// If email is empty, remove it or set to null if needed. Using REMOVE is safer.
		// Update expression needs adjustment to handle removal conditionally.
		// Simpler: Just don't set it if empty and rely on `omitempty` on struct for reads.
		// Or use specific logic if email removal is important.
		updateExpression = "SET username = :un, #nm = :n, avatarUrl = :a, lastLogin = :ll, #ca = if_not_exists(#ca, :ca_val) REMOVE email"
		// Note: This simplified REMOVE removes email every time if not provided by GitHub.
		// A more complex expression could check if :e is null before removing.
		delete(expressionAttributeValues, ":e") // Don't need the value if removing
	}

	updateInput := &dynamodb.UpdateItemInput{
		TableName:                 jsii.String(appConfig.DynamoDBTableName),
		Key:                       map[string]types.AttributeValue{"githubId": &types.AttributeValueMemberS{Value: githubIDStr}},
		UpdateExpression:          jsii.String(updateExpression),
		ExpressionAttributeNames:  expressionAttributeNames,
		ExpressionAttributeValues: expressionAttributeValues,
		ReturnValues:              types.ReturnValueAllNew, // Return the updated item
	}

	result, err := dynamoClient.UpdateItem(ctx, updateInput)
	if err != nil {
		return nil, fmt.Errorf("failed to upsert user %s into DynamoDB: %w", githubIDStr, err)
	}

	// Unmarshal the updated item back into our struct
	var updatedRecord UserRecord
	err = attributevalue.UnmarshalMap(result.Attributes, &updatedRecord)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal updated DynamoDB item: %w", err)
	}

	// Store user data in Momento Cache (Uncomment if using)
	/*
		cacheKey := fmt.Sprintf("user:%s", githubIDStr)
		userDataJson, err := json.Marshal(updatedRecord)
		if err == nil {
			_, err = momentoClient.Set(ctx, &momento.SetRequest{
				CacheName: "splitbucks-sessions", // Use your cache name
				Key:       momento.String(cacheKey),
				Value:     momento.String(userDataJson),
				Ttl:       24 * time.Hour, // Example TTL
			})
			if err != nil {
				log.Printf("WARN: Failed to cache user data for %s in Momento: %v", githubIDStr, err)
				// Continue execution even if caching fails
			} else {
				log.Printf("Cached user data for %s in Momento", githubIDStr)
			}
		} else {
			log.Printf("WARN: Failed to marshal user data for caching: %v", err)
		}
	*/

	return &updatedRecord, nil
}

// Helper to create standardized error responses for API Gateway
func errorResponse(statusCode int, message string) events.APIGatewayV2HTTPResponse {
	body, _ := json.Marshal(map[string]string{"error": message})
	return events.APIGatewayV2HTTPResponse{
		StatusCode: statusCode,
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       string(body),
	}
}

// Entry point for Lambda execution
func main() {
	lambda.Start(HandleRequest)
}
