package model

import (
	"encoding/json"
)

type Comment struct {
	Base
	Comment     string
	AddedByID   string
	AddedByName string
}

func (in *Comment) Stringify() string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}

func StringifyComments(in []*Comment) string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}
