package models

import (
	"time"

	"gorm.io/gorm"
)

type Appointment struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Title     string    `json:"title" gorm:"type:varchar(255);not null"`
	CreatorID uint      `json:"creator_id" gorm:"not null;index"`
	Start     time.Time `json:"start" gorm:"not null;index"`
	End       time.Time `json:"end" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relationships
	Creator     User                 `json:"creator,omitempty" gorm:"foreignKey:CreatorID"`
	Participants []AppointmentParticipant `json:"participants,omitempty" gorm:"foreignKey:AppointmentID"`
}

func (Appointment) TableName() string {
	return "appointments"
}

type AppointmentParticipant struct {
	ID            uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	AppointmentID uint      `json:"appointment_id" gorm:"not null;index"`
	UserID        uint      `json:"user_id" gorm:"not null;index"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	
	// Relationships
	Appointment Appointment `json:"appointment,omitempty" gorm:"foreignKey:AppointmentID"`
	User        User         `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

func (AppointmentParticipant) TableName() string {
	return "appointment_participants"
}

