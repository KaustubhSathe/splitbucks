package model

type Activity struct {
	Base
	CreateGroupActivity
	EditGroupNameActivity
	DeleteGroupActivity
	MemberAddedActivity
	MemberRemovedActivity
	MemberLeftActivity
	ExpenseAddedActivity
	ExpenseEditedActivity
	ExpenseDeletedActivity
	ActivityType ActivityType
}

type CreateGroupActivity struct {
	CreatedBy string // user id of admin
	GroupID   string // created group ID
}

type EditGroupNameActivity struct {
	EditedBy    string // user id of editor
	GroupID     string // edited group id
	CurrentName string // current name of the group
	NewName     string // new name of the group
}

type DeleteGroupActivity struct {
	DeletedBy string // user id
	GroupID   string // deleted group id
}

type MemberAddedActivity struct {
	AddedBy     string // user id of adder
	AddedMember string // added member id
	GroupID     string // group id in which member is added
}

type MemberRemovedActivity struct {
	RemovedBy     string // user id of remover
	RemovedMember string // removed member id
	GroupID       string // group id in which member is removed
}

type MemberLeftActivity struct {
	LeftMember string // member id of member who left
	GroupID    string // group id which member left
}

type ExpenseAddedActivity struct {
	AddedBy   string // member id of who added expense
	GroupID   string // group id expense is added
	ExpenseID string // expense id of the expense
}

type ExpenseEditedActivity struct {
	EditedBy      string  // member id of who edited expense
	GroupID       string  // group id expense is edited
	ExpenseID     string  // expense id of the expense
	CurrentTitle  string  // current title of the expense
	NewTitle      string  // new title of the expense
	CurrentAmount float32 // current amount of the expense
	NewAmount     float32 // new amount of the expense
}

type ExpenseDeletedActivity struct {
	DeletedBy     string  // member id of who edited expense
	GroupID       string  // group id expense is edited
	ExpenseID     string  // expense id of the expense
	CurrentTitle  string  // current title of the expense
	NewTitle      string  // new title of the expense
	CurrentAmount float32 // current amount of the expense
	NewAmount     float32 // new amount of the expense
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

// Log activity when user:

// Creates a group
// Edits group name
// Deletes a group

// Adds member to group
// Removes member from group
// Member leaves a group

// Adds an expense
// Edits an expense
// Deletes an expense
