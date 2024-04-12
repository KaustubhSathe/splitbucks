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
var mailer *db.SES

// This will be a POST request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that add as friend
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	userInfo, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	// Now parse body
	body := struct {
		EmailID             string `json:"EmailID"`
		PetName             string `json:"PetName"`
		NotifyOnAddAsFriend bool   `json:"NotifyOnAddAsFriend"`
	}{}
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now save the friend relationship in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	err = dynamo.AddFriend(userInfo.Email, body.EmailID, body.PetName)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// First fetch the user config of friend and send email if NotifyOnAddAsFriend is true
	member, err := dynamo.GetUsers([]string{dynamo.UserPK(body.EmailID)})
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now also send email to member to notify
	if member[0].NotifyOnAddAsFriend {
		if mailer == nil {
			mailer, err = db.NewSES()
			if err != nil {
				return events.APIGatewayProxyResponse{
					StatusCode: 500,
				}, nil
			}
		}
		err = mailer.NotifyAddedAsFriend(body.EmailID, body.PetName, userInfo.Name, userInfo.Email)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
			}, nil
		}
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       "{}",
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
