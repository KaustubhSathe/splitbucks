package model

import "encoding/json"

// This struct represents user to user friend relationship
type Group struct {
	Base
	Admin     string
	GroupName string
	Members   []string // will contain array of member user-ids
	Owes     map[string]float32 // this will  be a map of <user_id>:<user_id>:currency --> amount
}

func (in *Group) Stringify() string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}

func StringifyGroups(in []*Group) string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}
