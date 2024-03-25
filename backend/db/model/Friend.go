package model

import "encoding/json"

// This struct represents user to user friend relationship
type Friend struct {
	Base
	PetName string
}

func (in *Friend) Stringify() string {
	b, err := json.Marshal(in)
	if err != nil {
		return ""
	}
	return string(b)
}
