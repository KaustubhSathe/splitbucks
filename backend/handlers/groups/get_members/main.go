package main

import (
	"backend/db"
	"backend/db/model"
	"backend/utils"
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var dynamo *db.Dynamo

// This will be a GET request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that get user groups
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	group_id := request.QueryStringParameters["group_id"]
	_, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	// Now save the group in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	members, err := dynamo.GetMembers(group_id)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       model.StringifyUsers(members),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
