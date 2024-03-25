package model

import "time"

type Expense struct {
	Base
	Description  string
	Amount       float32
	Currency     string
	PaidBy       string
	SplitType    SplitType
	Split        map[string]float32
	ExpenseDate  time.Time
	Note         string
	SplitMembers []string
	ExpenseType  ExpenseType
	GroupID      string
}

type SplitType int

const (
	EQUALLY SplitType = iota
	UNEQUALLY
	PERCENTAGES
)

var SplitTypesMap = map[string]SplitType{
	"EQUALLY":     EQUALLY,
	"UNEQUALLY":   UNEQUALLY,
	"PERCENTAGES": PERCENTAGES,
}

type ExpenseType int

const (
	GROUP ExpenseType = iota
	NONGROUP
)

var ExpenseTypesMap = map[string]ExpenseType{
	"GROUP":    GROUP,
	"NONGROUP": NONGROUP,
}
