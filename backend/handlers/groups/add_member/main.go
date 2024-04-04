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
var ses *db.SES

// This will be a POST request
func handleRequest(ctx context.Context, request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	// First authenticate the request only after that add member
	splitbucks_id_token := request.Headers["splitbucks_id_token"]
	userInfo, authenticated, err := utils.Authenticate(splitbucks_id_token)
	if err != nil || !authenticated {
		return events.APIGatewayProxyResponse{
			StatusCode: 401,
		}, nil
	}

	// Now parse body
	body := struct {
		MemberID           string `json:"MemberID"`
		MemberName         string `json:"MemberName"`
		GroupID            string `json:"GroupID"`
		GroupName          string `json:"GroupName"`
		NotifyOnAddToGroup bool   `json:"NotifyOnAddToGroup"`
	}{}
	err = json.Unmarshal([]byte(request.Body), &body)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now save the group in database
	if dynamo == nil {
		dynamo = db.NewDynamo()
	}

	group, err := dynamo.AddMember(body.GroupID, body.GroupName, body.MemberID, body.MemberName, dynamo.UserPK(userInfo.Email), userInfo.Name)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	// Now also send email to member to notify
	if body.NotifyOnAddToGroup {
		if ses == nil {
			ses, err = db.NewSES()
			if err != nil {
				return events.APIGatewayProxyResponse{
					StatusCode: 500,
				}, nil
			}
		}
		err = ses.NotifyAddedToGroup(body.MemberID[5:], body.MemberName, userInfo.Name, userInfo.Email, body.GroupName)
		if err != nil {
			return events.APIGatewayProxyResponse{
				StatusCode: 500,
			}, nil
		}
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       group.Stringify(),
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
