package db

import (
	"backend/db/model"
	"fmt"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
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

const (
	Sender  = "kaustubhapplied@gmail.com"
	CharSet = "UTF-8"
)

func (sesClient *SES) NotifyAddedToGroup(memberEmail, memberName, adderName, adderEmail, groupName string) error {
	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: []*string{},
			ToAddresses: []*string{
				aws.String(memberEmail),
			},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(fmt.Sprintf("Hey %s! %s (%s) just added you to the group '%s' on Splitbucks.", memberName, adderName, adderEmail, groupName)),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(CharSet),
				Data:    aws.String(fmt.Sprintf("Added to the group %s", groupName)),
			},
		},
		Source: aws.String(Sender),
	}

	// Attempt to send the email.
	_, err := sesClient.Client.SendEmail(input)

	// Display error messages if they occur.
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				fmt.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				fmt.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				fmt.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}

		return err
	}

	return nil
}

func (mailer *SES) NotifyAddedAsFriend(
	friendEmail,
	friendName,
	userName,
	userEmail string,
) error {
	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: []*string{},
			ToAddresses: []*string{
				aws.String(friendEmail),
			},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(fmt.Sprintf("Hey %s! %s (%s) just added you as friend on Splitbucks.", friendName, userName, userEmail)),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(CharSet),
				Data:    aws.String(fmt.Sprintf("%s added you as friend on Splitbucks.", friendName)),
			},
		},
		Source: aws.String(Sender),
	}

	// Attempt to send the email.
	_, err := mailer.Client.SendEmail(input)

	// Display error messages if they occur.
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				fmt.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				fmt.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				fmt.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}

		return err
	}

	return nil
}

func (mailer *SES) NotifyExpenseAdded(
	description,
	addedByEmail,
	addedByName,
	groupName string,
	splitMembers []*model.User,
	amount float32,
) error {
	// First batch get all the splitmembers and get their NotifyOnExpenseAdded setting, if true then only send email
	toAddresses := []*string{}
	for _, v := range splitMembers {
		if v.NotifyOnExpenseAdded {
			toAddresses = append(toAddresses, aws.String(v.PK[5:]))
		}
	}
	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: []*string{},
			ToAddresses: toAddresses,
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(fmt.Sprintf("Hey! %s just added expense '%s' to the group '%s'.", addedByName, description, groupName)),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(CharSet),
				Data:    aws.String(fmt.Sprintf("'%s' (%f) expense added by %s.", description, amount, addedByName)),
			},
		},
		Source: aws.String(Sender),
	}

	// Attempt to send the email.
	_, err := mailer.Client.SendEmail(input)

	// Display error messages if they occur.
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				fmt.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				fmt.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				fmt.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}

		return err
	}

	return nil
}

func (mailer *SES) NotifyOnComment(
	expenseDescription,
	addedByEmail,
	addedByName string,
	splitMembers []*model.User,
) error {
	// First batch get all the splitmembers and get their NotifyOnComment setting, if true then only send email
	toAddresses := []*string{}
	for _, v := range splitMembers {
		if v.NotifyOnComment {
			toAddresses = append(toAddresses, aws.String(v.PK[5:]))
		}
	}
	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: []*string{},
			ToAddresses: toAddresses,
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Charset: aws.String(CharSet),
					Data:    aws.String(fmt.Sprintf("Hey! %s just added a comment on expense '%s'.", addedByName, expenseDescription)),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(CharSet),
				Data:    aws.String(fmt.Sprintf("Comment added in %s by %s.", expenseDescription, addedByName)),
			},
		},
		Source: aws.String(Sender),
	}

	// Attempt to send the email.
	_, err := mailer.Client.SendEmail(input)

	// Display error messages if they occur.
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				fmt.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				fmt.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				fmt.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				fmt.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			fmt.Println(err.Error())
		}

		return err
	}

	return nil
}
