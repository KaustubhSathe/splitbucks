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

const (
	// The subject line for the email.
	Subject = "Amazon SES Test (AWS SDK for Go)"

	// The HTML body for the email.
	HtmlBody = "<h1>Amazon SES Test Email (AWS SDK for Go)</h1><p>This email was sent with " +
		"<a href='https://aws.amazon.com/ses/'>Amazon SES</a> using the " +
		"<a href='https://aws.amazon.com/sdk-for-go/'>AWS SDK for Go</a>.</p>"

	//The email body for recipients with non-HTML email clients.
	TextBody = "This email was sent with Amazon SES using the AWS SDK for Go."

	// The character encoding for the email.
	CharSet = "UTF-8"
)

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
		EmailID string `json:"EmailID"`
		PetName string `json:"PetName"`
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

	// Now send invite to friend if profile does not exists, or just send info mail to frined if profile exists
	// if mailer == nil {
	// 	mailer, err = db.NewSES()
	// 	if err != nil {
	// 		return events.APIGatewayProxyResponse{
	// 			StatusCode: 500,
	// 		}, err
	// 	}
	// }
	// user2, err := dynamo.GetUser(body.EmailID)
	// if err != nil {
	// 	return events.APIGatewayProxyResponse{
	// 		StatusCode: 500,
	// 	}, nil
	// }
	// _, err = mailer.Client.SendEmail(&ses.SendEmailInput{
	// 	Destination: &ses.Destination{
	// 		ToAddresses: []*string{aws.String(body.EmailID)},
	// 	},
	// 	Message: &ses.Message{
	// 		Body: &ses.Body{
	// 			Html: &ses.Content{
	// 				Charset: aws.String(CharSet),
	// 				Data:    aws.String(HtmlBody),
	// 			},
	// 			Text: &ses.Content{
	// 				Charset: aws.String(CharSet),
	// 				Data:    aws.String("This email was sent with Amazon SES using the AWS SDK for Go."),
	// 			},
	// 		},
	// 		Subject: &ses.Content{
	// 			Charset: aws.String(CharSet),
	// 			Data:    aws.String("Invite from Splitbucks"),
	// 		},
	// 	},
	// 	Source: aws.String(userInfo.Email),
	// })
	// if err != nil {
	// 	log.Fatalf(err.Error())
	// 	return events.APIGatewayProxyResponse{
	// 		StatusCode: 500,
	// 	}, nil
	// }

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(handleRequest)
}
