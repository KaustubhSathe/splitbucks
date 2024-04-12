package model

import "encoding/json"

type Activity struct {
	Base
	CreatedByID        string // user id of admin
	CreatedByName      string // user name of admin
	GroupID            string // created group ID
	GroupType          string
	GroupName          string // created group name
	EditedByID         string // user name of editor
	EditedByName       string // user id of editor
	CurrentName        string // current name of the group
	NewName            string // new name of the group
	DeletedByID        string // user id
	DeletedByName      string // user id name
	AddedByID          string // user id of adder
	AddedByName        string // user name of adder
	AddedMemberID      string // added member id
	AddedMemberName    string // added member name
	RemovedByID        string // user id of remover
	RemovedByName      string // user name of remover
	RemovedMemberID    string // removed member id
	RemovedMemberName  string // removed member name
	LeftMemberID       string // member id of member who left
	LeftMemberName     string
	ExpenseID          string // expense id of the expense
	ExpenseDescription string
	CurrentTitle       string  // current title of the expense
	NewTitle           string  // new title of the expense
	CurrentAmount      float32 // current amount of the expense
	NewAmount          float32 // new amount of the expense
	ActivityType       ActivityType
}

type ActivityType int

const (
	GROUP_CREATED ActivityType = iota
	GROUP_EDITED
	GROUP_DELETED
	MEMBER_ADDED
	MEMBER_REMOVED
	MEMBER_LEFT
	EXPENSE_ADDED
	EXPENSE_EDITED
	EXPENSE_DELETED
)

var ActivityTypesMap = map[string]ActivityType{
	"GROUP_CREATED":   GROUP_CREATED,
	"GROUP_EDITED":    GROUP_EDITED,
	"GROUP_DELETED":   GROUP_DELETED,
	"MEMBER_ADDED":    MEMBER_ADDED,
	"MEMBER_REMOVED":  MEMBER_REMOVED,
	"MEMBER_LEFT":     MEMBER_LEFT,
	"EXPENSE_ADDED":   EXPENSE_ADDED,
	"EXPENSE_EDITED":  EXPENSE_EDITED,
	"EXPENSE_DELETED": EXPENSE_DELETED,
}

func (in *Activity) Stringify() string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}

func StringifyActivities(in []*Activity) string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}
