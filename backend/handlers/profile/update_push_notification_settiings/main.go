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
		PushNotifyExpenseAdded     bool `json:"PushNotifyExpenseAdded"`
		PushNotifyCommentAdded     bool `json:"PushNotifyCommentAdded"`
		PushNotifyExpenseUpdated   bool `json:"PushNotifyExpenseUpdated"`
		PushNotifyAddedAsFriend    bool `json:"PushNotifyAddedAsFriend"`
		PushNotifyFriendUpdated    bool `json:"PushNotifyFriendUpdated"`
		PushNotifyAddedToGroup     bool `json:"PushNotifyAddedToGroup"`
		PushNotifyGroupUpdated     bool `json:"PushNotifyGroupUpdated"`
		PushNotifyRemovedFromGroup bool `json:"PushNotifyRemovedFromGroup"`
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

	// Now update push notification settings
	err = dynamo.UpdatePushNotificationSettings(userInfo.Email, body.PushNotifyExpenseAdded, body.PushNotifyCommentAdded, body.PushNotifyExpenseUpdated, body.PushNotifyAddedAsFriend, body.PushNotifyFriendUpdated, body.PushNotifyAddedToGroup, body.PushNotifyGroupUpdated, body.PushNotifyRemovedFromGroup)
	if err != nil {
		return events.APIGatewayProxyResponse{
			StatusCode: 500,
		}, nil
	}

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
