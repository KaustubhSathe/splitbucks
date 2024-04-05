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
var mailer *db.SES

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
		Comment            string   `json:"Comment"`
		ExpenseID          string   `json:"ExpenseID"`
		SplitMembers       []string `json:"SplitMembers"`
		ExpenseDescription string   `json:"ExpenseDescription"`
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

	comment, err := dynamo.CreateComment(body.Comment, body.ExpenseID, dynamo.UserPK(userInfo.Email), userInfo.Name)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now notify splitmembers that comment is added
	splitMembers, err := dynamo.GetUsers(body.SplitMembers)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	if mailer == nil {
		mailer, err = db.NewSES()
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
			}, nil
		}
	}
	err = mailer.NotifyOnComment(
		body.ExpenseDescription,
		userInfo.Email, // added by email
		userInfo.Name,  // added by name
		splitMembers,
	)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       comment.Stringify(),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
