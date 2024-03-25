package db

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

type SES struct {
	Client *ses.SES
}

func NewSES() (*SES, error) {
	ses, err := initializeSES()
	if err != nil {
		return nil, err
	}
	return &SES{
		Client: ses,
	}, nil
}

func initializeSES() (*ses.SES, error) {
	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("ap-south-1")},
	)
	if err != nil {
		return nil, err
	}

	// Create an SES session.
	svc := ses.New(sess)

	return svc, nil
}
