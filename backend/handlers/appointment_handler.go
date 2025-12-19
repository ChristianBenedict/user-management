package handlers

import (
	"fmt"
	"net/http"
	"time"

	"appointment-management/database"
	"appointment-management/models"
	"appointment-management/utils"

	"github.com/gin-gonic/gin"
)

type CreateAppointmentRequest struct {
	Title         string   `json:"title" binding:"required"`
	Start         string   `json:"start" binding:"required"`
	End           string   `json:"end" binding:"required"`
	ParticipantIDs []uint  `json:"participant_ids"`
}

type AppointmentResponse struct {
	ID            uint      `json:"id"`
	Title         string    `json:"title"`
	CreatorID     uint      `json:"creator_id"`
	Start         time.Time `json:"start"`
	End           time.Time `json:"end"`
	StartLocal    string    `json:"start_local"`
	EndLocal      string    `json:"end_local"`
	Creator       UserInfo  `json:"creator"`
	Participants  []UserInfo `json:"participants"`
	CreatedAt     time.Time `json:"created_at"`
}

type UserInfo struct {
	ID               uint   `json:"id"`
	Name             string `json:"name"`
	Username         string `json:"username"`
	PreferredTimezone string `json:"preferred_timezone"`
}

func CreateAppointment(c *gin.Context) {
	userID, _ := c.Get("user_id")
	creatorID := userID.(uint)

	var req CreateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var creator models.User
	if err := database.DB.First(&creator, creatorID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Creator not found"})
		return
	}

	creatorLoc, err := time.LoadLocation(creator.PreferredTimezone)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid creator timezone"})
		return
	}

	var startTimeLocal, endTimeLocal time.Time

	fmt.Printf("DEBUG: Parsing start time: %s in timezone: %s\n", req.Start, creator.PreferredTimezone)

	if parsedTime, err := time.Parse(time.RFC3339, req.Start); err == nil {
		fmt.Printf("DEBUG: RFC3339 parse succeeded, extracting components\n")
		startTimeLocal = time.Date(
			parsedTime.Year(), parsedTime.Month(), parsedTime.Day(),
			parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(),
			0, creatorLoc,
		)
	} else {
		fmt.Printf("DEBUG: RFC3339 parse failed, using ParseInLocation\n")
		startTimeLocal, err = time.ParseInLocation("2006-01-02T15:04:05", req.Start, creatorLoc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid start time format. Use format: 2024-01-15T09:00:00"})
			return
		}
	}

	fmt.Printf("DEBUG: Parsing end time: %s in timezone: %s\n", req.End, creator.PreferredTimezone)

	if parsedTime, err := time.Parse(time.RFC3339, req.End); err == nil {
		fmt.Printf("DEBUG: RFC3339 parse succeeded, extracting components\n")
		endTimeLocal = time.Date(
			parsedTime.Year(), parsedTime.Month(), parsedTime.Day(),
			parsedTime.Hour(), parsedTime.Minute(), parsedTime.Second(),
			0, creatorLoc,
		)
	} else {
		fmt.Printf("DEBUG: RFC3339 parse failed, using ParseInLocation\n")
		endTimeLocal, err = time.ParseInLocation("2006-01-02T15:04:05", req.End, creatorLoc)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid end time format. Use format: 2024-01-15T17:00:00"})
			return
		}
	}

	startTime := startTimeLocal.UTC()
	endTime := endTimeLocal.UTC()

	fmt.Printf("DEBUG: Creator timezone: %s\n", creator.PreferredTimezone)
	fmt.Printf("DEBUG: Input start: %s, parsed as local: %s, UTC: %s\n", req.Start, startTimeLocal.Format("2006-01-02 15:04:05 MST"), startTime.Format("2006-01-02 15:04:05 UTC"))
	fmt.Printf("DEBUG: Input end: %s, parsed as local: %s, UTC: %s\n", req.End, endTimeLocal.Format("2006-01-02 15:04:05 MST"), endTime.Format("2006-01-02 15:04:05 UTC"))

	if endTime.Before(startTime) || endTime.Equal(startTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	fmt.Printf("DEBUG: Validating working hours only for creator timezone: %s\n", creator.PreferredTimezone)
	if err := utils.ValidateWorkingHoursForAllParticipants(startTime, endTime, []string{creator.PreferredTimezone}); err != nil {
		fmt.Printf("DEBUG: Validation failed: %s\n", err.Error())
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Printf("DEBUG: Validation passed for creator timezone\n")

	appointment := models.Appointment{
		Title:     req.Title,
		CreatorID: creatorID,
		Start:     startTime,
		End:       endTime,
	}

	if err := database.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create appointment"})
		return
	}

	database.DB.Create(&models.AppointmentParticipant{
		AppointmentID: appointment.ID,
		UserID:        creatorID,
	})

	for _, participantID := range req.ParticipantIDs {
		if participantID != creatorID {
			database.DB.Create(&models.AppointmentParticipant{
				AppointmentID: appointment.ID,
				UserID:        participantID,
			})
		}
	}

	c.JSON(http.StatusCreated, gin.H{"data": appointment})
}

func GetAppointments(c *gin.Context) {
	userID, _ := c.Get("user_id")
	currentUserID := userID.(uint)

	var currentUser models.User
	if err := database.DB.First(&currentUser, currentUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	fmt.Printf("Fetching appointments for user ID: %d\n", currentUserID)

	var appointments []models.Appointment

	var appointmentIDs []uint
	err := database.DB.Table("appointment_participants").
		Joins("INNER JOIN appointments ON appointments.id = appointment_participants.appointment_id").
		Where("appointment_participants.user_id = ?", currentUserID).
		Where("appointments.deleted_at IS NULL").
		Pluck("appointment_participants.appointment_id", &appointmentIDs).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointment IDs: " + err.Error()})
		return
	}

	if len(appointmentIDs) == 0 {
		c.JSON(http.StatusOK, gin.H{"data": []AppointmentResponse{}})
		return
	}

	err = database.DB.
		Where("id IN ?", appointmentIDs).
		Preload("Creator").
		Preload("Participants").
		Order("start ASC").
		Find(&appointments).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch appointments: " + err.Error()})
		return
	}

	for i := range appointments {
		for j := range appointments[i].Participants {
			database.DB.First(&appointments[i].Participants[j].User, appointments[i].Participants[j].UserID)
		}
	}

	fmt.Printf("Found %d appointments\n", len(appointments))

	var response []AppointmentResponse
	for _, apt := range appointments {
		if apt.Creator.ID == 0 {
			continue
		}

		startLocal, _ := utils.FormatTimeForTimezone(apt.Start, currentUser.PreferredTimezone)
		endLocal, _ := utils.FormatTimeForTimezone(apt.End, currentUser.PreferredTimezone)

		creatorInfo := UserInfo{
			ID:               apt.Creator.ID,
			Name:             apt.Creator.Name,
			Username:         apt.Creator.Username,
			PreferredTimezone: apt.Creator.PreferredTimezone,
		}

		var participantsInfo []UserInfo
		for _, p := range apt.Participants {
			if p.User.ID == 0 {
				continue
			}
			participantsInfo = append(participantsInfo, UserInfo{
				ID:               p.User.ID,
				Name:             p.User.Name,
				Username:         p.User.Username,
				PreferredTimezone: p.User.PreferredTimezone,
			})
		}

		response = append(response, AppointmentResponse{
			ID:            apt.ID,
			Title:         apt.Title,
			CreatorID:     apt.CreatorID,
			Start:         apt.Start,
			End:           apt.End,
			StartLocal:    startLocal,
			EndLocal:      endLocal,
			Creator:       creatorInfo,
			Participants:  participantsInfo,
			CreatedAt:     apt.CreatedAt,
		})
	}

	fmt.Printf("Sending %d appointments in response\n", len(response))
	c.JSON(http.StatusOK, gin.H{"data": response})
}

func GetAppointmentByID(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	currentUserID := userID.(uint)

	var currentUser models.User
	if err := database.DB.First(&currentUser, currentUserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var appointment models.Appointment
	if err := database.DB.
		Preload("Creator").
		Preload("Participants.User").
		First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	isParticipant := false
	for _, p := range appointment.Participants {
		if p.UserID == currentUserID {
			isParticipant = true
			break
		}
	}
	if !isParticipant && appointment.CreatorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You don't have access to this appointment"})
		return
	}

	startLocal, _ := utils.FormatTimeForTimezone(appointment.Start, currentUser.PreferredTimezone)
	endLocal, _ := utils.FormatTimeForTimezone(appointment.End, currentUser.PreferredTimezone)

	creatorInfo := UserInfo{
		ID:               appointment.Creator.ID,
		Name:             appointment.Creator.Name,
		Username:         appointment.Creator.Username,
		PreferredTimezone: appointment.Creator.PreferredTimezone,
	}

	var participantsInfo []UserInfo
	for _, p := range appointment.Participants {
		participantsInfo = append(participantsInfo, UserInfo{
			ID:               p.User.ID,
			Name:             p.User.Name,
			Username:         p.User.Username,
			PreferredTimezone: p.User.PreferredTimezone,
		})
	}

	response := AppointmentResponse{
		ID:            appointment.ID,
		Title:         appointment.Title,
		CreatorID:     appointment.CreatorID,
		Start:         appointment.Start,
		End:           appointment.End,
		StartLocal:    startLocal,
		EndLocal:      endLocal,
		Creator:       creatorInfo,
		Participants:  participantsInfo,
		CreatedAt:     appointment.CreatedAt,
	}

	c.JSON(http.StatusOK, gin.H{"data": response})
}

func DeleteAppointment(c *gin.Context) {
	id := c.Param("id")
	userID, _ := c.Get("user_id")
	currentUserID := userID.(uint)

	var appointment models.Appointment
	if err := database.DB.First(&appointment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Appointment not found"})
		return
	}

	if appointment.CreatorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the creator can delete this appointment"})
		return
	}

	// Use transaction to ensure both deletions succeed
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Hard delete appointment participants using raw SQL
	if err := tx.Exec("DELETE FROM appointment_participants WHERE appointment_id = ?", appointment.ID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment participants: " + err.Error()})
		return
	}

	// Hard delete appointment using raw SQL (permanently remove from database)
	if err := tx.Exec("DELETE FROM appointments WHERE id = ?", appointment.ID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete appointment: " + err.Error()})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction: " + err.Error()})
		return
	}

	fmt.Printf("DEBUG: Appointment ID %d permanently deleted from database\n", appointment.ID)

	c.JSON(http.StatusOK, gin.H{"message": "Appointment deleted successfully"})
}

