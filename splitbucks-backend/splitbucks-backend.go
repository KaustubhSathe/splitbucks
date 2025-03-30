package main

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"

	// Use HttpApi for simpler/cheaper API Gateway setup
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsapigatewayv2integrations"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type SplitbucksBackendStackProps struct {
	awscdk.StackProps
}

func NewSplitbucksBackendStack(scope constructs.Construct, id string, props *SplitbucksBackendStackProps) awscdk.Stack {
	var sprops awscdk.StackProps
	if props != nil {
		sprops = props.StackProps
	}
	stack := awscdk.NewStack(scope, &id, &sprops)

	// --- DynamoDB Table for Users ---
	// Using GitHub user ID as the primary key (partition key).
	// Make sure it's a string, as GitHub IDs can be large numbers sometimes represented as strings.
	userTable := awsdynamodb.NewTable(stack, jsii.String("UserTable"), &awsdynamodb.TableProps{
		PartitionKey: &awsdynamodb.Attribute{
			Name: jsii.String("githubId"), // Name of the primary key attribute
			Type: awsdynamodb.AttributeType_STRING,
		},
		TableName: jsii.String("SplitbucksUsers"), // Optional: specify a table name
		// Use PAY_PER_REQUEST for serverless applications, good for unpredictable traffic
		BillingMode: awsdynamodb.BillingMode_PAY_PER_REQUEST,
		// Ensure the table is destroyed when the stack is deleted (useful for development)
		// For production, consider RemovalPolicy_RETAIN or RemovalPolicy_SNAPSHOT
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})

	// --- Lambda Function for GitHub Auth Callback ---
	// IMPORTANT: You need to build your Go Lambda function code separately.
	// The `Code: awslambda.Code_FromAsset(...)` assumes you have a compiled Go binary
	// (e.g., 'main' or 'handler') inside a 'lambda/auth-callback' directory.
	// Example build command (run in lambda source dir): GOOS=linux GOARCH=amd64 go build -o main .
	githubAuthHandler := awslambda.NewFunction(stack, jsii.String("GitHubAuthCallbackHandler"), &awslambda.FunctionProps{
		Runtime: awslambda.Runtime_GO_1_X(),                                         // Specify Go runtime
		Code:    awslambda.Code_FromAsset(jsii.String("lambda/auth-callback"), nil), // Path to the directory containing your compiled Go binary
		Handler: jsii.String("main"),                                                // The name of your compiled executable (or the handler function if using a different setup)
		// Environment variables needed by the Lambda function
		// WARNING: Storing secrets directly is NOT recommended for production. Use AWS Secrets Manager.
		Environment: &map[string]*string{
			"DYNAMODB_TABLE_NAME":  userTable.TableName(),
			"GITHUB_CLIENT_ID":     jsii.String("YOUR_GITHUB_CLIENT_ID"),     // Replace with your actual Client ID
			"GITHUB_CLIENT_SECRET": jsii.String("YOUR_GITHUB_CLIENT_SECRET"), // Replace with your actual Client Secret
			// "MOMENTO_AUTH_TOKEN": jsii.String("YOUR_MOMENTO_AUTH_TOKEN"), // Add Momento token (Consider Secrets Manager)
			// "JWT_SECRET": jsii.String("YOUR_SUPER_SECRET_JWT_KEY"),  // For signing session tokens (Consider Secrets Manager)
		},
		FunctionName: jsii.String("SplitbucksGitHubAuthCallback"),
		Timeout:      awscdk.Duration_Seconds(jsii.Number(15)), // Increased timeout slightly for external calls
	})

	// --- Grant Permissions ---
	// Allow the Lambda function to write data (PutItem, UpdateItem) to the DynamoDB table
	userTable.GrantWriteData(githubAuthHandler)
	// If using Secrets Manager, grant read access here:
	// secret.GrantRead(githubAuthHandler)

	// --- API Gateway (HTTP API) ---
	// Create an HTTP API to trigger the Lambda function
	httpApi := awsapigatewayv2.NewHttpApi(stack, jsii.String("GitHubAuthApi"), &awsapigatewayv2.HttpApiProps{
		ApiName: jsii.String("SplitbucksAuthService"),
		// Configure CORS if your frontend (running in a browser) needs to call this directly
		CorsPreflight: &awsapigatewayv2.CorsPreflightOptions{
			AllowOrigins: &[]*string{jsii.String("*")}, // Be more specific in production! e.g., your frontend domain
			AllowMethods: &[]awsapigatewayv2.CorsHttpMethod{awsapigatewayv2.CorsHttpMethod_GET, awsapigatewayv2.CorsHttpMethod_OPTIONS},
			AllowHeaders: &[]*string{jsii.String("Content-Type"), jsii.String("Authorization")}, // Add others if needed
		},
	})

	// --- API Gateway Integration ---
	// Create an integration between the API route and the Lambda function
	githubAuthIntegration := awsapigatewayv2integrations.NewHttpLambdaIntegration(jsii.String("GitHubAuthIntegration"), githubAuthHandler, &awsapigatewayv2integrations.HttpLambdaIntegrationProps{})

	// --- API Gateway Route ---
	// Define the route (e.g., /auth/github/callback) that triggers the integration
	httpApi.AddRoutes(&awsapigatewayv2.AddRoutesOptions{
		Path:        jsii.String("/auth/github/callback"),
		Methods:     &[]awsapigatewayv2.HttpMethod{awsapigatewayv2.HttpMethod_GET}, // GitHub callback uses GET
		Integration: githubAuthIntegration,
	})

	// --- Output the API endpoint URL ---
	awscdk.NewCfnOutput(stack, jsii.String("GitHubAuthApiEndpoint"), &awscdk.CfnOutputProps{
		Value:       httpApi.Url(),
		Description: jsii.String("API Gateway endpoint URL for GitHub Auth"),
	})
	awscdk.NewCfnOutput(stack, jsii.String("CallbackUrl"), &awscdk.CfnOutputProps{
		Value:       jsii.String(*httpApi.Url() + "auth/github/callback"),
		Description: jsii.String("Full callback URL to configure in GitHub OAuth App"),
	})

	return stack
}

func main() {
	defer jsii.Close()

	app := awscdk.NewApp(nil)

	NewSplitbucksBackendStack(app, "SplitbucksBackendStack", &SplitbucksBackendStackProps{
		// Configure your AWS account and region here, or rely on AWS CLI/environment variables
		// Env: env(),
	})

	app.Synth(nil)
}

// Helper function to configure environment (optional)
/*
func env() *awscdk.Environment {
	return &awscdk.Environment{
		 Account: jsii.String(os.Getenv("CDK_DEFAULT_ACCOUNT")),
		 Region:  jsii.String(os.Getenv("CDK_DEFAULT_REGION")),
	}
}
*/
