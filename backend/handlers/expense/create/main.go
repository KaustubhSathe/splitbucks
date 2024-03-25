package main

import (
	"backend/db"
	"backend/utils"
	"context"
	"encoding/json"
	"time"

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
		Description  string             `json:"Description"`
		Amount       float32            `json:"Amount"`
		Currency     string             `json:"Currency"`
		PaidBy       string             `json:"PaidBy"`    // userid of paid by user
		SplitType    string             `json:"SplitType"` // Split type: EQUALLY, UNEQUALLY, PERCENTAGES
		Split        map[string]float32 `json:"Split"`     // split is map of user-id to amount
		ExpenseDate  time.Time          `json:"ExpenseDate"`
		Note         string             `json:"Note"`
		SplitMembers []string           `json:"SplitMembers"`
		ExpenseType  string             `json:"ExpenseType"` // expense type - GROUP/NONGROUP
		GroupID      string             `json:"GroupID"`
	}{}
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now save the expense in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	expense, err := dynamo.CreateExpense(body.Description,
		body.Amount,
		body.Currency,
		body.PaidBy,
		dynamo.UserPK(userInfo.Email),
		body.SplitType,
		body.Split,
		body.ExpenseDate,
		body.Note,
		body.SplitMembers,
		body.ExpenseType,
		body.GroupID,
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
