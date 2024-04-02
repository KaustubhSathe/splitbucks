package main

import (
	"backend/db"
	"backend/utils"
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var dynamo *db.Dynamo

// This will be a POST request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that create Expense
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	userInfo, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	// Now parse body
	body := struct {
		GroupName string `json:"GroupName"`
	}{}
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		log.Fatalf("Error while unmarshalling JSON body: %s", err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now save the expense in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	comment, err := dynamo.CreateExpense(
		body.GroupName,
	)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       expense.Stringify(),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
