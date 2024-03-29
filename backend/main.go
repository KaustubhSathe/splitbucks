package main

import (
	"log"
	"os"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/aws-cdk-go/awscdk/v2/awsiam"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/aws-cdk-go/awscdkapigatewayv2alpha/v2"
	"github.com/aws/aws-cdk-go/awscdkapigatewayv2integrationsalpha/v2"
	"github.com/aws/aws-cdk-go/awscdklambdagoalpha/v2"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
	"github.com/joho/godotenv"
)

type Lambdas struct {
	LoginHandler                    awscdklambdagoalpha.GoFunction
	UpdateEmailSettingsHandler      awscdklambdagoalpha.GoFunction
	PushNotificationSettingsHandler awscdklambdagoalpha.GoFunction
	AddFriendHandler                awscdklambdagoalpha.GoFunction
	GetFriendsHandler               awscdklambdagoalpha.GoFunction
	CreateGroupHandler              awscdklambdagoalpha.GoFunction
	GetUserGroupsHandler            awscdklambdagoalpha.GoFunction
	GetMembersHandler               awscdklambdagoalpha.GoFunction
	AddMemberHandler                awscdklambdagoalpha.GoFunction
	RemoveMemberHandler             awscdklambdagoalpha.GoFunction
	AddExpenseHandler               awscdklambdagoalpha.GoFunction
	GetGroupExpensesHandler         awscdklambdagoalpha.GoFunction
}

func CreateDynamoTable(stack awscdk.Stack) {
	awsdynamodb.NewTable(stack, jsii.String("splitbucks_db"), &awsdynamodb.TableProps{
		BillingMode: awsdynamodb.BillingMode_PAY_PER_REQUEST,
		TableName:   jsii.String("splitbucks_db"),
		PartitionKey: &awsdynamodb.Attribute{
			Name: aws.String("PK"),
			Type: awsdynamodb.AttributeType_STRING,
		},
		SortKey: &awsdynamodb.Attribute{
			Name: aws.String("SK"),
			Type: awsdynamodb.AttributeType_STRING,
		},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
	})
}

func CreateLambdas(stack awscdk.Stack) *Lambdas {
	// First create required roles for lambda function, AmazonDynamoDBFullAccess and AWSLambdaBasicExecutionRole role
	requiredRoles := awsiam.NewRole(stack, aws.String("requiredRoles"), &awsiam.RoleProps{
		AssumedBy: awsiam.NewServicePrincipal(aws.String("lambda.amazonaws.com"), &awsiam.ServicePrincipalOpts{}),
		ManagedPolicies: &[]awsiam.IManagedPolicy{
			awsiam.ManagedPolicy_FromManagedPolicyArn(stack, aws.String("AmazonDynamoDBFullAccess"), aws.String("arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess")),
			awsiam.ManagedPolicy_FromManagedPolicyArn(stack, aws.String("AWSLambdaBasicExecutionRole"), aws.String("arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole")),
			awsiam.ManagedPolicy_FromManagedPolicyArn(stack, aws.String("AmazonS3FullAccess"), aws.String("arn:aws:iam::aws:policy/AmazonS3FullAccess")),
			awsiam.ManagedPolicy_FromManagedPolicyArn(stack, aws.String("AmazonSESFullAccess"), aws.String("arn:aws:iam::aws:policy/AmazonSESFullAccess")),
		},
	})

	envs := &map[string]*string{
		"CLIENT_ID": aws.String(os.Getenv("CLIENT_ID")),
	}

	loginHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("loginHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/profile/login"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	updateEmailSettingsHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("updateEmailSettingsHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/profile/update_email_settings"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	pushNotificationSettingsHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("pushNotificationSettingsHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/profile/update_push_notification_settiings"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	addFriendHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("addFriendHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/friends/add_friend"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	getFriendsHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("getFriendsHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/friends/get"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	createGroupHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("createGroupHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/groups/create"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	getUserGroupsHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("getUserGroupsHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/groups/get_user_groups"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	getMembersHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("getMembersHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/groups/get_members"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	addMemberHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("addMemberHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/groups/add_member"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	removeMemberHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("removeMemberHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/groups/remove_member"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	addExpenseHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("addExpenseHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/expense/create"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	getGroupExpensesHandler := awscdklambdagoalpha.NewGoFunction(stack, jsii.String("getGroupExpensesHandler"), &awscdklambdagoalpha.GoFunctionProps{
		Runtime: awslambda.Runtime_PROVIDED_AL2(),
		Entry:   jsii.String("./handlers/expense/get_group_expenses"),
		Bundling: &awscdklambdagoalpha.BundlingOptions{
			GoBuildFlags: jsii.Strings(`-ldflags "-s -w"`),
		},
		Role:         requiredRoles,
		Environment:  envs,
		Architecture: awslambda.Architecture_ARM_64(),
	})

	return &Lambdas{
		LoginHandler:                    loginHandler,
		UpdateEmailSettingsHandler:      updateEmailSettingsHandler,
		PushNotificationSettingsHandler: pushNotificationSettingsHandler,
		AddFriendHandler:                addFriendHandler,
		GetFriendsHandler:               getFriendsHandler,
		CreateGroupHandler:              createGroupHandler,
		GetUserGroupsHandler:            getUserGroupsHandler,
		GetMembersHandler:               getMembersHandler,
		AddMemberHandler:                addMemberHandler,
		RemoveMemberHandler:             removeMemberHandler,
		AddExpenseHandler:               addExpenseHandler,
		GetGroupExpensesHandler:         getGroupExpensesHandler,
	}
}

func CreateHTTPApi(stack awscdk.Stack, lambdas *Lambdas) awscdkapigatewayv2alpha.HttpApi {
	splitbucksApi := awscdkapigatewayv2alpha.NewHttpApi(stack, jsii.String("SplitbucksHTTPApi"), &awscdkapigatewayv2alpha.HttpApiProps{
		ApiName: jsii.String("SplitbucksHTTPApi"),
		CorsPreflight: &awscdkapigatewayv2alpha.CorsPreflightOptions{
			AllowCredentials: aws.Bool(true),
			AllowOrigins: &[]*string{
				aws.String("http://localhost:3000"),
			},
			MaxAge: awscdk.Duration_Minutes(aws.Float64(300)),
			AllowMethods: &[]awscdkapigatewayv2alpha.CorsHttpMethod{
				awscdkapigatewayv2alpha.CorsHttpMethod_DELETE,
				awscdkapigatewayv2alpha.CorsHttpMethod_GET,
				awscdkapigatewayv2alpha.CorsHttpMethod_PUT,
				awscdkapigatewayv2alpha.CorsHttpMethod_POST,
				awscdkapigatewayv2alpha.CorsHttpMethod_PATCH,
				awscdkapigatewayv2alpha.CorsHttpMethod_ANY,
				awscdkapigatewayv2alpha.CorsHttpMethod_OPTIONS,
			},
			AllowHeaders: &[]*string{
				aws.String("Authorization"),
				aws.String("*"),
				aws.String("splitbucks_id_token"),
			},
		},
	})

	// save profile API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/login"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.LoginHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// update email settings API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/email_settings"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.UpdateEmailSettingsHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// update pusn notification settings API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/push_notification_settings"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.PushNotificationSettingsHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// add as friend API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/friend"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.AddFriendHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// get friends Api
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/friend"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_GET},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.GetFriendsHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// create group POST API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/group"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.CreateGroupHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// get user groups
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/user_groups"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_GET},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.GetUserGroupsHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// get members of a group
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/get_members"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_GET},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.GetMembersHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// add member to group api
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/add_member"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.AddMemberHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// remove member from group api
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/remove_member"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.RemoveMemberHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// add expense api
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/add_expense"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.AddExpenseHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	// get group expenses API
	splitbucksApi.AddRoutes(&awscdkapigatewayv2alpha.AddRoutesOptions{
		Path:        jsii.String("/api/group_expenses"),
		Methods:     &[]awscdkapigatewayv2alpha.HttpMethod{awscdkapigatewayv2alpha.HttpMethod_POST},
		Integration: awscdkapigatewayv2integrationsalpha.NewHttpLambdaIntegration(jsii.String("SplitbucksHttpLambdaIntegration"), lambdas.GetGroupExpensesHandler, &awscdkapigatewayv2integrationsalpha.HttpLambdaIntegrationProps{}),
	})

	return splitbucksApi
}

func NewSplitbucksGoStack(scope constructs.Construct, id string, props *awscdk.StackProps) awscdk.Stack {
	stack := awscdk.NewStack(scope, &id, props)

	// Now create a DynamoDB table
	CreateDynamoTable(stack)

	// Now create all lambdas
	lambdas := CreateLambdas(stack)

	// Now create a HTTP API
	splitbucksApi := CreateHTTPApi(stack, lambdas)

	// log HTTP API endpoint
	awscdk.NewCfnOutput(stack, jsii.String("SplitbucksApiEndpoint"), &awscdk.CfnOutputProps{
		Value:       splitbucksApi.ApiEndpoint(),
		Description: jsii.String("HTTP API Endpoint"),
	})

	return stack
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	app := awscdk.NewApp(nil)

	NewSplitbucksGoStack(app, "SplitbucksGoStack", &awscdk.StackProps{
		Env:         env(),
		StackName:   aws.String("splitbucks-go-stack"),
		Description: aws.String("AWS go stack for splitbucks application."),
	})

	app.Synth(nil)
}

func env() *awscdk.Environment {
	return &awscdk.Environment{
		Account: aws.String("473539126755"),
		Region:  aws.String("ap-south-1"),
	}
}
