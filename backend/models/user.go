package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID               uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name             string    `json:"name" gorm:"type:varchar(255);not null"`
	Username         string    `json:"username" gorm:"type:varchar(255);uniqueIndex;not null"`
	PreferredTimezone string   `json:"preferred_timezone" gorm:"type:varchar(100);not null;default:'Asia/Jakarta'"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
}

func (User) TableName() string {
	return "users"
}

