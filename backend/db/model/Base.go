package model

import "time"

type Base struct {
	PK        string
	SK        string
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time
}
