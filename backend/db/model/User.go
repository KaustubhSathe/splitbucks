package model

import "encoding/json"

type UserInfo struct {
	Aud           string `json:"aud"`
	Iss           string `json:"iss"`
	Exp           string `json:"exp"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
}

type EmailSettings struct {
	NotifyOnAddToGroup    bool
	NotifyOnAddAsFriend   bool
	NotifyOnExpenseAdded  bool
	NotifyOnExpenseEdited bool
	NotifyOnComment       bool
	NotifyWhenSomeonePays bool
}

type PushNotificationSettings struct {
	PushNotifyExpenseAdded     bool
	PushNotifyCommentAdded     bool
	PushNotifyExpenseUpdated   bool
	PushNotifyAddedAsFriend    bool
	PushNotifyFriendUpdated    bool
	PushNotifyAddedToGroup     bool
	PushNotifyGroupUpdated     bool
	PushNotifyRemovedFromGroup bool
}

// This struct represents User object stored in DynamoDB
type User struct {
	Base
	EmailSettings
	PushNotificationSettings
	Email      string
	Name       string
	Picture    string
	GivenName  string
	FamilyName string
}

func (in *User) Stringify() string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}

func StringifyUsers(in []*User) string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}
