package main

import (
	"backend/db"
	"backend/utils"
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var dynamo *db.Dynamo

// This will be a POST request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that create SpreadSheet
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	userInfo, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	body := struct {
		NotifyOnAddToGroup    bool `json:"NotifyOnAddToGroup"`
		NotifyOnAddAsFriend   bool `json:"NotifyOnAddAsFriend"`
		NotifyOnExpenseAdded  bool `json:"NotifyOnExpenseAdded"`
		NotifyOnExpenseEdited bool `json:"NotifyOnExpenseEdited"`
		NotifyOnComment       bool `json:"NotifyOnComment"`
		NotifyWhenSomeonePays bool `json:"NotifyWhenSomeonePays"`
	}{}
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now save the user info in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	// Now update email settings
	err = dynamo.UpdateEmailSettings(userInfo.Email, body.NotifyOnAddToGroup, body.NotifyOnAddAsFriend, body.NotifyOnExpenseAdded, body.NotifyOnExpenseEdited, body.NotifyOnComment, body.NotifyWhenSomeonePays)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       "{}",
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
