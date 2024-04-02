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

// This will be a POST request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that create Expense
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	expense_id := request.QueryStringParameters["expense_id"]
	_, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	comments, err := dynamo.GetComments(expense_id)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       model.StringifyComments(comments),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
