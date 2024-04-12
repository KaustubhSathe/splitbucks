package main

import (
	"backend/db"
	"backend/utils"
	"context"
	"encoding/json"
	"log"
	"time"

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
		Description  string             `json:"Description"`
		Amount       float32            `json:"Amount"`
		Currency     string             `json:"Currency"`
		PaidById     string             `json:"PaidById"` // userid of paid by user
		PaidByName   string             `json:"PaidByName"`
		SplitType    string             `json:"SplitType"` // Split type: EQUALLY, UNEQUALLY, PERCENTAGES
		Split        map[string]float32 `json:"Split"`     // split is map of user-id to amount
		ExpenseDate  time.Time          `json:"ExpenseDate"`
		Note         string             `json:"Note"`
		SplitMembers []string           `json:"SplitMembers"`
		ExpenseType  string             `json:"ExpenseType"` // expense type - GROUP/NONGROUP
		GroupID      string             `json:"GroupID"`
		GroupName    string             `json:"GroupName"`
		Settlement   bool               `json:"Settlement"`
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

	expense, err := dynamo.CreateExpense(
		body.Description,
		body.Amount,
		body.Currency,
		body.PaidById,
		body.PaidByName,
		dynamo.UserPK(userInfo.Email),
		userInfo.Name,
		body.SplitType,
		body.Split,
		body.ExpenseDate,
		body.Note,
		body.SplitMembers,
		body.ExpenseType,
		body.GroupID,
		body.GroupName,
		body.Settlement,
	)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now notify splitmembers that expense is added
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
	err = mailer.NotifyExpenseAdded(
		body.Description,
		userInfo.Email, // added by email
		userInfo.Name,  // added by name
		body.GroupName,
		splitMembers,
		body.Amount,
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
