package main

import (
	"backend/db"
	"backend/db/model"
	"backend/utils"
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var dynamo *db.Dynamo

// This will be a GET request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that get friends
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	userInfo, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	friends, err := dynamo.GetFriends(userInfo.Email)
	if err != nil {
		log.Fatalf(err.Error())
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       model.StringifyUsers(friends),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
