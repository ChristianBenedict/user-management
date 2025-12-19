package utils

import (
	"errors"
	"time"
)

const (
	WorkingHourStart = 9  // 09:00
	WorkingHourEnd   = 17 // 17:00
)

func ConvertTimeToTimezone(t time.Time, timezone string) (time.Time, error) {
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return t, err
	}
	return t.In(loc), nil
}

func IsWithinWorkingHours(t time.Time, timezone string) (bool, error) {
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return false, err
	}

	localTime := t.In(loc)
	hour := localTime.Hour()
	minute := localTime.Minute()

	if hour < WorkingHourStart {
		return false, nil
	}
	if hour > WorkingHourEnd {
		return false, nil
	}
	if hour == WorkingHourEnd && minute > 0 {
		return false, nil
	}

	return true, nil
}

func ValidateWorkingHoursForAllParticipants(startTime, endTime time.Time, participantTimezones []string) error {
	var invalidTimezones []string
	var details []string

	for _, tz := range participantTimezones {
		loc, err := time.LoadLocation(tz)
		if err != nil {
			return errors.New("invalid timezone: " + tz)
		}

		startLocal := startTime.In(loc)
		endLocal := endTime.In(loc)

		startHour := startLocal.Hour()
		startMinute := startLocal.Minute()
		startTotalMinutes := startHour*60 + startMinute
		workingStartMinutes := WorkingHourStart * 60
		workingEndMinutes := WorkingHourEnd * 60

		startValid := startTotalMinutes >= workingStartMinutes && startTotalMinutes <= workingEndMinutes

		endHour := endLocal.Hour()
		endMinute := endLocal.Minute()
		endTotalMinutes := endHour*60 + endMinute

		endValid := endTotalMinutes >= workingStartMinutes && endTotalMinutes <= workingEndMinutes

		if !startValid || !endValid {
			invalidTimezones = append(invalidTimezones, tz)
			startTimeStr := startLocal.Format("15:04")
			endTimeStr := endLocal.Format("15:04")
			details = append(details, tz+": start="+startTimeStr+", end="+endTimeStr)
		}

		if endTotalMinutes <= startTotalMinutes {
			return errors.New("end time must be after start time for timezone: " + tz)
		}
	}

	if len(invalidTimezones) > 0 {
		msg := "appointment time is outside working hours (09:00-17:00) for timezone(s): " + invalidTimezones[0]
		if len(details) > 0 {
			msg += " (" + details[0] + ")"
		}
		if len(invalidTimezones) > 1 {
			msg += ". Please choose a time that works for all participants' timezones"
		}
		return errors.New(msg)
	}

	return nil
}

func FormatTimeForTimezone(t time.Time, timezone string) (string, error) {
	loc, err := time.LoadLocation(timezone)
	if err != nil {
		return "", err
	}
	return t.In(loc).Format("2006-01-02 15:04:05"), nil
}

