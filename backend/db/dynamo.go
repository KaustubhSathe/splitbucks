package db

import (
	"backend/config"
	"backend/db/model"
	"fmt"
	"log"
	"slices"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"github.com/google/uuid"
	"robpike.io/filter"
)

type Dynamo struct {
	Client *dynamodb.DynamoDB
}

func NewDynamo() *Dynamo {
	return &Dynamo{
		Client: initializeDynamo(),
	}
}

func initializeDynamo() *dynamodb.DynamoDB {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		SharedConfigState: session.SharedConfigEnable,
	}))
	svc := dynamodb.New(sess)

	return svc
}

func (db *Dynamo) LoginUser(userInfo *model.UserInfo) (*model.User, error) {
	writeReqs := []*dynamodb.WriteRequest{}
	modelUser := model.User{
		Base: model.Base{
			PK:        db.UserPK(userInfo.Email),
			SK:        db.UserSK(userInfo.Email),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		EmailSettings: model.EmailSettings{
			NotifyOnAddToGroup:    true,
			NotifyOnAddAsFriend:   true,
			NotifyOnExpenseAdded:  true,
			NotifyOnExpenseEdited: true,
			NotifyOnComment:       true,
			NotifyWhenSomeonePays: true,
		},
		PushNotificationSettings: model.PushNotificationSettings{
			PushNotifyExpenseAdded:     true,
			PushNotifyCommentAdded:     true,
			PushNotifyExpenseUpdated:   true,
			PushNotifyAddedAsFriend:    true,
			PushNotifyFriendUpdated:    true,
			PushNotifyAddedToGroup:     true,
			PushNotifyGroupUpdated:     true,
			PushNotifyRemovedFromGroup: true,
		},
		Email:      userInfo.Email,
		Name:       userInfo.Name,
		Picture:    userInfo.Picture,
		GivenName:  userInfo.GivenName,
		FamilyName: userInfo.FamilyName,
	}
	// First get from DB is user already exists and return
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(db.UserPK(userInfo.Email)),
			},
			":sk": {
				S: aws.String(db.UserSK(userInfo.Email)),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items != nil && len(res.Items) > 0 {
		user := model.User{}
		err = dynamodbattribute.UnmarshalMap(res.Items[0], &user)
		if err != nil {
			log.Fatalf("Error while UnmarshalMap: %s", err.Error())
			return nil, err
		}
		return &user, nil
	}

	// If user not exists then create a new user in DB
	user, err := dynamodbattribute.MarshalMap(modelUser)
	if err != nil {
		log.Fatalf("Got error marshalling User: %s", err.Error())
		return nil, err
	}

	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: user}},
	)

	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Got error calling BatchWriteItem: %s", err.Error())
		return nil, err
	}

	return &modelUser, nil
}

func (db *Dynamo) GetUser(email string) (*model.User, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(db.UserPK(email)),
			},
			":sk": {
				S: aws.String(db.UserSK(email)),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Got error calling db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items != nil && len(res.Items) > 0 {
		user := model.User{}
		err = dynamodbattribute.UnmarshalMap(res.Items[0], &user)
		if err != nil {
			log.Fatalf("Error while unmarshalling User: %s", err.Error())
			return nil, err
		}
		return &user, nil
	}

	return nil, nil
}

func (db *Dynamo) AddFriend(emailID1, emailID2, petName string) error {
	var writeReqs []*dynamodb.WriteRequest
	friend1, err := dynamodbattribute.MarshalMap(&model.Friend{
		Base: model.Base{
			PK:        db.UserPK(emailID1),
			SK:        db.FriendSK(emailID2),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		PetName: petName,
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return err
	}
	friend2, err := dynamodbattribute.MarshalMap(&model.Friend{
		Base: model.Base{
			PK:        db.UserPK(emailID2),
			SK:        db.FriendSK(emailID1),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: friend1}},
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: friend2}},
	)

	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Got error calling BatchWriteItem: %s", err.Error())
		return err
	}

	return nil
}

func (db *Dynamo) GetFriends(emailID string) ([]*model.User, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND begins_with(#SK, :sk)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(db.UserPK(emailID)),
			},
			":sk": {
				S: aws.String(db.FriendSK("")),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Got error calling db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil {
		return nil, nil
	}
	getKeys := []map[string]*dynamodb.AttributeValue{}

	for i := 0; i < len(res.Items); i++ {
		friend := model.Friend{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &friend)
		if err != nil {
			log.Fatalf("Got error calling UnmarshalMap: %s", err.Error())
			return nil, err
		}
		friendPK := friend.SK[7:]
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(db.UserPK(friendPK)),
			},
			"SK": {
				S: aws.String(db.UserSK(friendPK)),
			},
		})
	}

	fns, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
		RequestItems: map[string]*dynamodb.KeysAndAttributes{
			config.SPLITBUCKS_TABLE: {
				Keys: getKeys,
			},
		},
	})
	if err != nil {
		log.Fatalf("Error while BatchGetItem: %s", err.Error())
		return nil, err
	}

	friends := []*model.User{}

	if len(fns.Responses) > 0 {
		for key, value := range fns.Responses {
			fmt.Printf("Items retrieved from table %s:\n", key)
			for _, item := range value {
				var friend model.User
				_ = dynamodbattribute.UnmarshalMap(item, &friend)
				friends = append(friends, &friend)
			}
		}
	}

	return friends, nil
}

func (db *Dynamo) UpdateEmailSettings(email string, notifyOnAddToGroup, notifyOnAddAsFriend, notifyOnExpenseAdded, notifyOnExpenseEdited, notifyOnComment, notifyWhenSomeonePays bool) error {
	_, err := db.Client.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String(config.SPLITBUCKS_TABLE),
		Key: map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(db.UserPK(email)),
			},
			"SK": {
				S: aws.String(db.UserSK(email)),
			},
		},
		UpdateExpression: aws.String("set NotifyOnAddToGroup = :notifyOnAddToGroup, NotifyOnAddAsFriend = :notifyOnAddAsFriend, NotifyOnExpenseAdded = :notifyOnExpenseAdded, NotifyOnExpenseEdited = :notifyOnExpenseEdited, NotifyOnComment = :notifyOnComment, NotifyWhenSomeonePays = :notifyWhenSomeonePays"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":notifyOnAddToGroup": {
				BOOL: aws.Bool(notifyOnAddToGroup),
			},
			":notifyOnAddAsFriend": {
				BOOL: aws.Bool(notifyOnAddAsFriend),
			},
			":notifyOnExpenseAdded": {
				BOOL: aws.Bool(notifyOnExpenseAdded),
			},
			":notifyOnExpenseEdited": {
				BOOL: aws.Bool(notifyOnExpenseEdited),
			},
			":notifyOnComment": {
				BOOL: aws.Bool(notifyOnComment),
			},
			":notifyWhenSomeonePays": {
				BOOL: aws.Bool(notifyWhenSomeonePays),
			},
		},
	})
	if err != nil {
		log.Fatalf("Error while UpdateItem: %s", err.Error())
		return err
	}

	return nil
}

func (db *Dynamo) UpdatePushNotificationSettings(email string, pushNotifyExpenseAdded, pushNotifyCommentAdded, pushNotifyExpenseUpdated, pushNotifyAddedAsFriend, pushNotifyFriendUpdated, pushNotifyAddedToGroup, pushNotifyGroupUpdated, pushNotifyRemovedFromGroup bool) error {
	_, err := db.Client.UpdateItem(&dynamodb.UpdateItemInput{
		TableName: aws.String(config.SPLITBUCKS_TABLE),
		Key: map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(db.UserPK(email)),
			},
			"SK": {
				S: aws.String(db.UserSK(email)),
			},
		},
		UpdateExpression: aws.String(`set PushNotifyExpenseAdded = :pushNotifyExpenseAdded,
		 	PushNotifyCommentAdded = :pushNotifyCommentAdded, 
		 	PushNotifyExpenseUpdated = :pushNotifyExpenseUpdated,
			PushNotifyAddedAsFriend = :pushNotifyAddedAsFriend,
			PushNotifyFriendUpdated = :pushNotifyFriendUpdated,
			PushNotifyAddedToGroup = :pushNotifyAddedToGroup,
			PushNotifyGroupUpdated = :pushNotifyGroupUpdated,
			PushNotifyRemovedFromGroup = :pushNotifyRemovedFromGroup`),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pushNotifyExpenseAdded": {
				BOOL: aws.Bool(pushNotifyExpenseAdded),
			},
			":pushNotifyCommentAdded": {
				BOOL: aws.Bool(pushNotifyCommentAdded),
			},
			":pushNotifyExpenseUpdated": {
				BOOL: aws.Bool(pushNotifyExpenseUpdated),
			},
			":pushNotifyAddedAsFriend": {
				BOOL: aws.Bool(pushNotifyAddedAsFriend),
			},
			":pushNotifyFriendUpdated": {
				BOOL: aws.Bool(pushNotifyFriendUpdated),
			},
			":pushNotifyAddedToGroup": {
				BOOL: aws.Bool(pushNotifyAddedToGroup),
			},
			":pushNotifyGroupUpdated": {
				BOOL: aws.Bool(pushNotifyGroupUpdated),
			},
			":pushNotifyRemovedFromGroup": {
				BOOL: aws.Bool(pushNotifyRemovedFromGroup),
			},
		},
	})
	if err != nil {
		log.Fatalf("Error while UpdateItem: %s", err.Error())
		return err
	}

	return nil
}

func (db *Dynamo) CreateGroup(admin, adminName, groupName string) (*model.Group, error) {
	groupID := uuid.New().String()
	var writeReqs []*dynamodb.WriteRequest
	entry1, err := dynamodbattribute.MarshalMap(&model.Group{
		Base: model.Base{
			PK:        db.GroupPK(groupID),
			SK:        db.GroupSK(groupID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Admin:     db.UserPK(admin),
		GroupName: groupName,
		Members:   []string{db.UserPK(admin)},
		Owes:      map[string]float32{},
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return nil, err
	}
	entry2, err := dynamodbattribute.MarshalMap(&model.Group{
		Base: model.Base{
			PK:        db.UserPK(admin),
			SK:        db.GroupPK(groupID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Admin:     db.UserPK(admin),
		GroupName: groupName,
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return nil, err
	}
	// Entry 3 for activity logging
	activityID := uuid.New().String()
	entry3, err := dynamodbattribute.MarshalMap(&model.Activity{
		Base: model.Base{
			PK:        db.GroupPK(groupID),
			SK:        db.ActivitySK(activityID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		CreatedByID:   admin,
		CreatedByName: adminName,
		GroupID:       db.GroupPK(groupID),
		GroupName:     groupName,
		ActivityType:  model.GROUP_CREATED,
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return nil, err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry1}},
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry2}},
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry3}},
	)

	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Got error calling PutItem: %s", err)
		return nil, err
	}

	return &model.Group{
		Base: model.Base{
			PK:        db.GroupPK(groupID),
			SK:        db.GroupSK(groupID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Admin:     db.UserPK(admin),
		GroupName: groupName,
		Members:   []string{db.UserPK(admin)},
	}, nil
}

func (db *Dynamo) AddMember(groupID, groupName, memberID, memberName, addedById, addedByName string) (*model.Group, error) {
	var writeReqs []*dynamodb.WriteRequest
	// First fetch the group entry PK: GROUP#<group_id>, SK: GROUP#<group_id>
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(groupID),
			},
			":sk": {
				S: aws.String(groupID),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil || len(res.Items) == 0 {
		return nil, nil
	}
	group := model.Group{}
	err = dynamodbattribute.UnmarshalMap(res.Items[0], &group)
	if err != nil {
		log.Fatalf("Error while UnmarshalMap: %s", err.Error())
		return nil, err
	}

	// Now add the new memberID in the members array and save the updated entry in database
	if !slices.Contains(group.Members, memberID) {
		group.Members = append(group.Members, memberID)
	}

	groupMarshal, err := dynamodbattribute.MarshalMap(group)
	if err != nil {
		log.Fatalf("Got error marshalling User: %s", err.Error())
		return nil, err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: groupMarshal}},
	)

	// Now also add an Activity entry of type MEMBER_ADDED
	// this activity will be associated with GROUP
	activityID := uuid.New().String()
	memberAddedActivity, err := dynamodbattribute.MarshalMap(&model.Activity{
		Base: model.Base{
			PK:        groupID,
			SK:        db.ActivitySK(activityID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		AddedByID:       addedById,
		AddedByName:     addedByName,
		AddedMemberID:   memberID,
		AddedMemberName: memberName,
		GroupName:       groupName,
		GroupID:         groupID,
		ActivityType:    model.MEMBER_ADDED,
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return nil, err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: memberAddedActivity}},
	)

	// Now save both the write requests
	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Error while BatchWriteItem: %s", err.Error())
		return nil, err
	}

	return &group, nil
}

func (db *Dynamo) RemoveMember(groupID, groupName, memberID, memberName, removedById, removedByName string) (*model.Group, error) {
	var writeReqs []*dynamodb.WriteRequest
	// First fetch the group entry PK: GROUP#<group_id>, SK: GROUP#<group_id>
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(groupID),
			},
			":sk": {
				S: aws.String(groupID),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil || len(res.Items) == 0 {
		return nil, nil
	}
	group := model.Group{}
	err = dynamodbattribute.UnmarshalMap(res.Items[0], &group)
	if err != nil {
		log.Fatalf("Error while UnmarshalMap: %s", err.Error())
		return nil, err
	}

	// Now remove the member_id from group.Members
	if slices.Contains(group.Members, memberID) {
		group.Members = filter.Choose(group.Members, func(a string) bool {
			return a == memberID
		}).([]string)
	}

	groupMarshal, err := dynamodbattribute.MarshalMap(group)
	if err != nil {
		log.Fatalf("Got error marshalling User: %s", err.Error())
		return nil, err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: groupMarshal}},
	)

	// Now also add an Activity entry of type MEMBER_REMOVED
	// this activity will be associated with GROUP
	activityID := uuid.New().String()
	memberRemovedActivity, err := dynamodbattribute.MarshalMap(&model.Activity{
		Base: model.Base{
			PK:        db.GroupPK(groupID),
			SK:        db.ActivitySK(activityID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		RemovedByID:       removedById,
		RemovedByName:     removedByName,
		RemovedMemberID:   memberID,
		RemovedMemberName: memberName,
		GroupID:           groupID,
		GroupName:         groupName,
		ActivityType:      model.MEMBER_REMOVED,
	})
	if err != nil {
		log.Fatalf("Got error marshalling Friend: %s", err.Error())
		return nil, err
	}
	writeReqs = append(
		writeReqs,
		&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: memberRemovedActivity}},
	)

	// Now save both the write requests
	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Error while BatchWriteItem: %s", err.Error())
		return nil, err
	}

	return &group, nil
}

func (db *Dynamo) CreateExpense(
	description string,
	amount float32,
	currency string,
	paidById string,
	paidByName string,
	addedById string,
	addedByName string,
	splitType string,
	split map[string]float32,
	expenseDate time.Time,
	note string,
	splitMembers []string, // splitmembers will contain paidById
	expenseType string,
	groupID string,
	groupName string,
) (*model.Expense, error) {
	expenseID := uuid.New().String()
	// two cases on basis of expense type either GROUP expense or NONGROUP expense
	if expenseType == "GROUP" {
		var writeReqs []*dynamodb.WriteRequest
		// First add an entry for PK: GROUP#<group_id>, SK: EXPENSE#<expense_id>
		expense := &model.Expense{
			Base: model.Base{
				PK:        groupID,
				SK:        db.ExpenseSK(expenseID),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Description:  description,
			Amount:       amount,
			Currency:     currency,
			AddedByID:    addedById,
			AddedByName:  addedByName,
			PaidById:     paidById,
			PaidByName:   paidByName,
			SplitType:    model.SplitTypesMap[splitType],
			Split:        split,
			ExpenseDate:  expenseDate,
			Note:         note,
			SplitMembers: splitMembers,
			ExpenseType:  model.ExpenseTypesMap[expenseType],
			GroupID:      groupID,
		}
		expenseMarshal, err := dynamodbattribute.MarshalMap(expense)
		if err != nil {
			log.Fatalf("Got error marshalling Expense: %s", err.Error())
			return nil, err
		}
		writeReqs = append(
			writeReqs,
			&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: expenseMarshal}},
		)

		// Then also add an entry for Activity
		activityID := uuid.New().String()
		expenseAddedActivity, err := dynamodbattribute.MarshalMap(&model.Activity{
			Base: model.Base{
				PK:        groupID,
				SK:        db.ActivityPK(activityID),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			AddedByID:          addedById,
			AddedByName:        addedByName,
			GroupName:          groupName,
			GroupID:            groupID,
			ExpenseID:          db.ExpensePK(expenseID),
			ExpenseDescription: description,
			ActivityType:       model.EXPENSE_ADDED,
		})
		if err != nil {
			log.Fatalf("Got error marshalling Activity: %s", err.Error())
			return nil, err
		}
		writeReqs = append(
			writeReqs,
			&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: expenseAddedActivity}},
		)

		// and also update the Owes mapping in PK: GROUP#<group_id> SK: GROUP#<group_id> entry
		// 1. First get the group entry
		res, err := db.Client.Query(&dynamodb.QueryInput{
			TableName:              aws.String(config.SPLITBUCKS_TABLE),
			KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
			ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
				":pk": {
					S: aws.String(groupID),
				},
				":sk": {
					S: aws.String(groupID),
				},
			},
			ExpressionAttributeNames: map[string]*string{
				"#PK": aws.String("PK"),
				"#SK": aws.String("SK"),
			},
		})
		if err != nil {
			log.Fatalf("Got error querying for Group entry: %s", err.Error())
			return nil, err
		}
		if res.Items == nil || len(res.Items) == 0 {
			return nil, nil
		}
		group := model.Group{}
		err = dynamodbattribute.UnmarshalMap(res.Items[0], &group)
		if err != nil {
			log.Fatalf("Got error unmarshalling Group: %s", err.Error())
			return nil, err
		}

		// 2. Now update the Owes mapping with new values
		if group.Owes == nil {
			group.Owes = make(map[string]float32)
		}
		for k, v := range split {
			group.Owes[k] += v
		}

		groupMarshal, err := dynamodbattribute.MarshalMap(group)
		if err != nil {
			log.Fatalf("Got error marshalling Group: %s", err.Error())
			return nil, err
		}
		writeReqs = append(
			writeReqs,
			&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: groupMarshal}},
		)

		input := &dynamodb.BatchWriteItemInput{
			RequestItems: map[string][]*dynamodb.WriteRequest{
				config.SPLITBUCKS_TABLE: writeReqs,
			},
		}

		_, err = db.Client.BatchWriteItem(input)
		if err != nil {
			log.Fatalf("Got error calling BatchWriteItem: %s", err)
			return nil, err
		}

		return expense, nil
	}
	// First add an entry for PK: USER#<user_id>, SK: EXPENSE#<expense_id> for every member id and also for paidby member
	// splitmembers will have the paidBy member present in it
	var writeReqs []*dynamodb.WriteRequest
	for i := 0; i < len(splitMembers); i++ {
		entry, err := dynamodbattribute.MarshalMap(&model.Expense{
			Base: model.Base{
				PK:        splitMembers[i],
				SK:        db.ExpenseSK(expenseID),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			Description:  description,
			Amount:       amount,
			Currency:     currency,
			AddedByID:    addedById,
			AddedByName:  addedByName,
			PaidById:     paidById,
			PaidByName:   paidByName,
			SplitType:    model.SplitTypesMap[splitType],
			Split:        split,
			ExpenseDate:  expenseDate,
			Note:         note,
			SplitMembers: splitMembers,
			ExpenseType:  model.ExpenseTypesMap[expenseType],
			GroupID:      db.GroupSK("NONGROUP"),
		})
		if err != nil {
			log.Fatalf("Got error marshalling Expense: %s", err.Error())
			return nil, err
		}

		writeReqs = append(writeReqs, &dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry}})
	}

	// 2. Now update the Owes mapping with new values for all users in splitMembers array
	getKeys := []map[string]*dynamodb.AttributeValue{}
	for i := 0; i < len(splitMembers); i++ {
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(splitMembers[i]),
			},
			"SK": {
				S: aws.String("GROUP#NONGROUP"),
			},
		})
	}

	gps, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
		RequestItems: map[string]*dynamodb.KeysAndAttributes{
			config.SPLITBUCKS_TABLE: {
				Keys: getKeys,
			},
		},
	})
	if err != nil {
		log.Fatalf("Got error while BatchGetItem: %s", err.Error())
		return nil, err
	}

	// First check if all NONGROUP entries are present in DB if not create them
	if len(gps.Responses[config.SPLITBUCKS_TABLE]) != len(splitMembers) {
		var writeReqs []*dynamodb.WriteRequest
		groupPKs := []string{}
		for _, item := range gps.Responses[config.SPLITBUCKS_TABLE] {
			var group model.Group
			_ = dynamodbattribute.UnmarshalMap(item, &group)
			groupPKs = append(groupPKs, group.PK)
		}
		// Now find which entries are not present
		for _, splitMember := range splitMembers {
			if !slices.Contains(groupPKs, splitMember) {
				nongroup, err := dynamodbattribute.MarshalMap(&model.Group{
					Base: model.Base{
						PK:        splitMember,
						SK:        db.GroupSK("NONGROUP"),
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					},
					Admin:     splitMember,
					GroupName: "NONGROUP",
					Members:   []string{splitMember},
					Owes:      map[string]float32{},
				})
				if err != nil {
					log.Fatalf("Got error marshalling Group: %s", err.Error())
					return nil, err
				}
				writeReqs = append(writeReqs, &dynamodb.WriteRequest{
					PutRequest: &dynamodb.PutRequest{Item: nongroup},
				})
			}
		}
		input := &dynamodb.BatchWriteItemInput{
			RequestItems: map[string][]*dynamodb.WriteRequest{
				config.SPLITBUCKS_TABLE: writeReqs,
			},
		}
		_, err = db.Client.BatchWriteItem(input)
		if err != nil {
			log.Fatalf("Got error calling BatchWriteItem: %s", err)
			return nil, err
		}

		// Now refetch the response
		gps, err = db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
			RequestItems: map[string]*dynamodb.KeysAndAttributes{
				config.SPLITBUCKS_TABLE: {
					Keys: getKeys,
				},
			},
		})
		if err != nil {
			log.Fatalf("Got error while BatchGetItem: %s", err.Error())
			return nil, err
		}
	}

	groups := []*model.Group{}

	if len(gps.Responses) > 0 {
		for _, value := range gps.Responses {
			for _, item := range value {
				var group model.Group
				_ = dynamodbattribute.UnmarshalMap(item, &group)
				if group.Owes == nil {
					group.Owes = make(map[string]float32)
				}
				for k, v := range split {
					group.Owes[k] += v
				}
				groups = append(groups, &group)
			}
		}
	}

	// Now batch save all the groups
	for i := 0; i < len(groups); i++ {
		entry, err := dynamodbattribute.MarshalMap(groups[i])
		if err != nil {
			log.Fatalf("Got error marshalling Group: %s", err.Error())
			return nil, err
		}

		writeReqs = append(writeReqs, &dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry}})
	}

	// Then also add an entry for Activity associated with every user
	activityID := uuid.New().String()
	for _, member := range splitMembers {
		expenseAddedActivity, err := dynamodbattribute.MarshalMap(&model.Activity{
			Base: model.Base{
				PK:        member,
				SK:        db.ActivityPK(activityID),
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
			AddedByID:          addedById,
			AddedByName:        addedByName,
			GroupID:            groupID,
			ExpenseDescription: description,
			GroupName:          groupName,
			ExpenseID:          db.ExpensePK(expenseID),
			ActivityType:       model.EXPENSE_ADDED,
		})
		if err != nil {
			log.Fatalf("Got error marshalling Activity: %s", err.Error())
			return nil, err
		}
		writeReqs = append(
			writeReqs,
			&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: expenseAddedActivity}},
		)
	}

	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}

	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Got error calling BatchWriteItem: %s", err)
		return nil, err
	}

	return &model.Expense{
		Base: model.Base{
			PK:        paidById,
			SK:        db.ExpenseSK(expenseID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Description:  description,
		Amount:       amount,
		Currency:     currency,
		AddedByID:    addedById,
		AddedByName:  addedByName,
		PaidById:     paidById,
		PaidByName:   paidByName,
		SplitType:    model.SplitTypesMap[splitType],
		Split:        split,
		ExpenseDate:  expenseDate,
		Note:         note,
		SplitMembers: splitMembers,
		ExpenseType:  model.ExpenseTypesMap[expenseType],
		GroupID:      db.GroupSK("NONGROUP"),
	}, nil
}

func (db *Dynamo) DeleteExpense(expense model.Expense) error {
	// two cases on basis of expense type either GROUP expense or NONGROUP expense
	if expense.ExpenseType == model.GROUP {
		fmt.Println("expense model", expense)
		// first delete the GROUPID,EXPENSEID entry from database
		_, err := db.Client.DeleteItem(&dynamodb.DeleteItemInput{
			TableName: aws.String(config.SPLITBUCKS_TABLE),
			Key: map[string]*dynamodb.AttributeValue{
				"PK": {
					S: aws.String(expense.GroupID),
				},
				"SK": {
					S: aws.String(expense.SK),
				},
			},
		})
		if err != nil {
			log.Fatalf("Error while DeleteItem: %s", err.Error())
			return err
		}

		// then also update the Owes mapping in GroupID, GroupID entry in database
		res, err := db.Client.Query(&dynamodb.QueryInput{
			TableName:              aws.String(config.SPLITBUCKS_TABLE),
			KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
			ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
				":pk": {
					S: aws.String(expense.GroupID),
				},
				":sk": {
					S: aws.String(expense.GroupID),
				},
			},
			ExpressionAttributeNames: map[string]*string{
				"#PK": aws.String("PK"),
				"#SK": aws.String("SK"),
			},
		})
		if err != nil {
			log.Fatalf("Got error querying for Group entry: %s", err.Error())
			return err
		}
		if res.Items == nil || len(res.Items) == 0 {
			return nil
		}
		group := model.Group{}
		err = dynamodbattribute.UnmarshalMap(res.Items[0], &group)
		if err != nil {
			log.Fatalf("Got error unmarshalling Group: %s", err.Error())
			return err
		}

		// Now update the Owes mapping with reversed values
		if group.Owes == nil {
			group.Owes = make(map[string]float32)
		}
		fmt.Println("group.Owes", group.Owes)
		fmt.Println("expense.Split", expense.Split)
		for k, v := range expense.Split {
			group.Owes[k] -= v // subtract here
		}

		fmt.Println("group.Owes", group.Owes)

		groupMarshal, err := dynamodbattribute.MarshalMap(group)
		if err != nil {
			log.Fatalf("Got error marshalling Group: %s", err.Error())
			return err
		}
		var writeReqs []*dynamodb.WriteRequest
		writeReqs = append(
			writeReqs,
			&dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: groupMarshal}},
		)

		input := &dynamodb.BatchWriteItemInput{
			RequestItems: map[string][]*dynamodb.WriteRequest{
				config.SPLITBUCKS_TABLE: writeReqs,
			},
		}

		_, err = db.Client.BatchWriteItem(input)
		if err != nil {
			log.Fatalf("Got error calling BatchWriteItem: %s", err)
			return err
		}

		return nil
	}
	// For non group case first delete all the USERID,EXPENSEID entries
	var writeReqs []*dynamodb.WriteRequest
	for i := 0; i < len(expense.SplitMembers); i++ {
		writeReqs = append(writeReqs, &dynamodb.WriteRequest{
			DeleteRequest: &dynamodb.DeleteRequest{
				Key: map[string]*dynamodb.AttributeValue{
					"PK": {
						S: aws.String(expense.SplitMembers[i]),
					},
					"SK": {
						S: aws.String(expense.SK),
					},
				},
			},
		})
	}

	// Then also update the owes mapping in USERID, NONGROUP entry
	getKeys := []map[string]*dynamodb.AttributeValue{}
	for i := 0; i < len(expense.SplitMembers); i++ {
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(expense.SplitMembers[i]),
			},
			"SK": {
				S: aws.String("GROUP#NONGROUP"),
			},
		})
	}

	gps, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
		RequestItems: map[string]*dynamodb.KeysAndAttributes{
			config.SPLITBUCKS_TABLE: {
				Keys: getKeys,
			},
		},
	})
	if err != nil {
		log.Fatalf("Got error while BatchGetItem: %s", err.Error())
		return err
	}

	groups := []*model.Group{}

	if len(gps.Responses) > 0 {
		for _, value := range gps.Responses {
			for _, item := range value {
				var group model.Group
				_ = dynamodbattribute.UnmarshalMap(item, &group)
				if group.Owes == nil {
					group.Owes = make(map[string]float32)
				}
				for k, v := range expense.Split {
					group.Owes[k] -= v // subtract here
				}
				groups = append(groups, &group)
			}
		}
	}

	// Now batch save all the groups
	for i := 0; i < len(groups); i++ {
		entry, err := dynamodbattribute.MarshalMap(groups[i])
		if err != nil {
			log.Fatalf("Got error marshalling Group: %s", err.Error())
			return err
		}

		writeReqs = append(writeReqs, &dynamodb.WriteRequest{PutRequest: &dynamodb.PutRequest{Item: entry}})
	}

	input := &dynamodb.BatchWriteItemInput{
		RequestItems: map[string][]*dynamodb.WriteRequest{
			config.SPLITBUCKS_TABLE: writeReqs,
		},
	}
	_, err = db.Client.BatchWriteItem(input)
	if err != nil {
		log.Fatalf("Got error calling BatchWriteItem: %s", err)
		return err
	}

	return nil
}

func (db *Dynamo) CreateComment(comment, expenseID, addedByID, addedByName string) (*model.Comment, error) {
	commentID := uuid.New().String()
	cc := &model.Comment{
		Base: model.Base{
			PK:        expenseID,
			SK:        db.CommentSK(commentID),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		Comment:     comment,
		AddedByID:   addedByID,
		AddedByName: addedByName,
	}
	commentEntry, err := dynamodbattribute.MarshalMap(cc)
	if err != nil {
		return nil, err
	}

	_, err = db.Client.PutItem(&dynamodb.PutItemInput{
		Item:      commentEntry,
		TableName: aws.String(config.SPLITBUCKS_TABLE),
	})
	if err != nil {
		return nil, err
	}

	return cc, nil
}

func (db *Dynamo) GetComments(expenseID string) ([]*model.Comment, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND begins_with(#SK, :sk)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(expenseID),
			},
			":sk": {
				S: aws.String(db.CommentSK("")),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Got error calling db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil {
		return []*model.Comment{}, nil
	}
	comments := []*model.Comment{}
	for i := 0; i < len(res.Items); i++ {
		comment := model.Comment{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &comment)
		if err != nil {
			log.Fatalf("Got error calling UnmarshalMap: %s", err.Error())
			return nil, err
		}
		comments = append(comments, &comment)
	}

	return comments, nil
}

func (db *Dynamo) GetActivities(groupIDs []string, userID string) ([]*model.Activity, error) {
	statement := `SELECT * FROM "splitbucks_db" WHERE "PK" IN `
	groupClause := "["
	for k, v := range groupIDs {
		if k == len(groupIDs)-1 {
			groupClause += fmt.Sprintf("'%s'", v)
		} else {
			groupClause += fmt.Sprintf("'%s',", v)
		}
	}
	groupClause += "]"
	statement += groupClause + ` AND begins_with("SK", 'ACTIVITY#')`

	res, err := db.Client.ExecuteStatement(&dynamodb.ExecuteStatementInput{
		Statement: aws.String(statement),
	})
	if err != nil {
		log.Fatalf("Error while ExecuteStatement: %s", err.Error())
		return nil, err
	}
	activites := []*model.Activity{}

	for i := 0; i < len(res.Items); i++ {
		activity := model.Activity{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &activity)
		if err != nil {
			return nil, err
		}
		activites = append(activites, &activity)
	}
	return activites, nil
}

func (db *Dynamo) GetGroupExpenses(groupID string) ([]*model.Expense, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND begins_with(#SK, :sk)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(groupID),
			},
			":sk": {
				S: aws.String(db.ExpenseSK("")),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil {
		return []*model.Expense{}, nil
	}

	expenses := []*model.Expense{}

	for i := 0; i < len(res.Items); i++ {
		expense := model.Expense{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &expense)
		if err != nil {
			return nil, err
		}
		expenses = append(expenses, &expense)
	}

	return expenses, nil
}

func (db *Dynamo) GetNonGroupExpenses(userID string) ([]*model.Expense, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND begins_with(#SK, :sk)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(userID),
			},
			":sk": {
				S: aws.String(db.ExpenseSK("")),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil {
		return []*model.Expense{}, nil
	}

	expenses := []*model.Expense{}

	for i := 0; i < len(res.Items); i++ {
		expense := model.Expense{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &expense)
		if err != nil {
			return nil, err
		}
		expenses = append(expenses, &expense)
	}

	return expenses, nil
}

func (db *Dynamo) GetUserGroups(emailID string) ([]*model.Group, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND begins_with(#SK, :sk)"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(db.UserPK(emailID)),
			},
			":sk": {
				S: aws.String(db.GroupPK("")),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		log.Fatalf("Error while db.Client.Query: %s", err.Error())
		return nil, err
	}
	if res.Items == nil {
		return []*model.Group{}, nil
	}

	getKeys := []map[string]*dynamodb.AttributeValue{}
	for i := 0; i < len(res.Items); i++ {
		group := model.Group{}
		err = dynamodbattribute.UnmarshalMap(res.Items[i], &group)
		if err != nil {
			return nil, err
		}
		groupPK := group.SK
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(groupPK),
			},
			"SK": {
				S: aws.String(groupPK),
			},
		})
	}

	// Also fetch the NONGROUP entry from database
	getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
		"PK": {
			S: aws.String(db.UserPK(emailID)),
		},
		"SK": {
			S: aws.String(db.GroupSK("NONGROUP")),
		},
	})

	groups := []*model.Group{}

	if len(getKeys) > 0 {
		gps, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
			RequestItems: map[string]*dynamodb.KeysAndAttributes{
				config.SPLITBUCKS_TABLE: {
					Keys: getKeys,
				},
			},
		})
		if err != nil {
			log.Fatalf("Error while BatchGetItem: %s", err.Error())
			return nil, err
		}

		if len(gps.Responses) > 0 {
			for key, value := range gps.Responses {
				fmt.Printf("Items retrieved from table %s:\n", key)
				for _, item := range value {
					var group model.Group
					err = dynamodbattribute.UnmarshalMap(item, &group)
					if err != nil {
						log.Fatalf("Error while unmarshalling Group: %s", err.Error())
						return nil, err
					}
					groups = append(groups, &group)
				}
			}
		}
	}

	return groups, nil
}

func (db *Dynamo) GetMembers(groupID string) ([]*model.User, error) {
	res, err := db.Client.Query(&dynamodb.QueryInput{
		TableName:              aws.String(config.SPLITBUCKS_TABLE),
		KeyConditionExpression: aws.String("#PK = :pk AND #SK = :sk"),
		ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
			":pk": {
				S: aws.String(groupID),
			},
			":sk": {
				S: aws.String(groupID),
			},
		},
		ExpressionAttributeNames: map[string]*string{
			"#PK": aws.String("PK"),
			"#SK": aws.String("SK"),
		},
	})
	if err != nil {
		return nil, err
	}
	if res.Items == nil || len(res.Items) == 0 {
		return []*model.User{}, nil
	}

	group := model.Group{}
	err = dynamodbattribute.UnmarshalMap(res.Items[0], &group)
	if err != nil {
		return nil, err
	}

	getKeys := []map[string]*dynamodb.AttributeValue{}

	for i := 0; i < len(group.Members); i++ {
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(group.Members[i]),
			},
			"SK": {
				S: aws.String(group.Members[i]),
			},
		})
	}

	fns, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
		RequestItems: map[string]*dynamodb.KeysAndAttributes{
			config.SPLITBUCKS_TABLE: {
				Keys: getKeys,
			},
		},
	})
	if err != nil {
		return nil, err
	}

	members := []*model.User{}

	if len(fns.Responses) > 0 {
		for key, value := range fns.Responses {
			fmt.Printf("Items retrieved from table %s:\n", key)
			for _, item := range value {
				var member model.User
				_ = dynamodbattribute.UnmarshalMap(item, &member)
				members = append(members, &member)
			}
		}
	}

	return members, nil
}

func (db *Dynamo) GetUsers(userIDs []string) ([]*model.User, error) {
	getKeys := []map[string]*dynamodb.AttributeValue{}

	for i := 0; i < len(userIDs); i++ {
		getKeys = append(getKeys, map[string]*dynamodb.AttributeValue{
			"PK": {
				S: aws.String(userIDs[i]),
			},
			"SK": {
				S: aws.String(userIDs[i]),
			},
		})
	}

	fns, err := db.Client.BatchGetItem(&dynamodb.BatchGetItemInput{
		RequestItems: map[string]*dynamodb.KeysAndAttributes{
			config.SPLITBUCKS_TABLE: {
				Keys: getKeys,
			},
		},
	})
	if err != nil {
		return nil, err
	}

	users := []*model.User{}

	if len(fns.Responses) > 0 {
		for key, value := range fns.Responses {
			fmt.Printf("Items retrieved from table %s:\n", key)
			for _, item := range value {
				var member model.User
				_ = dynamodbattribute.UnmarshalMap(item, &member)
				users = append(users, &member)
			}
		}
	}

	return users, nil
}

func (db *Dynamo) GroupPK(groupID string) string {
	return fmt.Sprintf("GROUP#%s", groupID)
}

func (db *Dynamo) GroupSK(groupID string) string {
	return fmt.Sprintf("GROUP#%s", groupID)
}

func (db *Dynamo) UserPK(email string) string {
	return fmt.Sprintf("USER#%s", email)
}

func (db *Dynamo) UserSK(email string) string {
	return fmt.Sprintf("USER#%s", email)
}

func (db *Dynamo) FriendSK(email string) string {
	return fmt.Sprintf("FRIEND#%s", email)
}

func (db *Dynamo) ExpensePK(id string) string {
	return fmt.Sprintf("EXPENSE#%s", id)
}

func (db *Dynamo) ExpenseSK(id string) string {
	return fmt.Sprintf("EXPENSE#%s", id)
}

func (db *Dynamo) ActivityPK(id string) string {
	return fmt.Sprintf("ACTIVITY#%s", id)
}

func (db *Dynamo) ActivitySK(id string) string {
	return fmt.Sprintf("ACTIVITY#%s", id)
}

func (db *Dynamo) CommentPK(id string) string {
	return fmt.Sprintf("COMMENT#%s", id)
}

func (db *Dynamo) CommentSK(id string) string {
	return fmt.Sprintf("COMMENT#%s", id)
}
