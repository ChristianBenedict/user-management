package routes

import (
	"appointment-management/handlers"
	"appointment-management/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Public routes
	api := r.Group("/api")
	{
		api.POST("/login", handlers.Login)
		api.POST("/logout", handlers.Logout)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User routes
		protected.GET("/users", handlers.GetUsers)
		protected.GET("/users/:id", handlers.GetUserByID)
		protected.POST("/users", handlers.CreateUser)
		protected.PUT("/users/:id", handlers.UpdateUser)
		protected.DELETE("/users/:id", handlers.DeleteUser)

		// Appointment routes
		protected.POST("/appointments", handlers.CreateAppointment)
		protected.GET("/appointments", handlers.GetAppointments)
		protected.GET("/appointments/:id", handlers.GetAppointmentByID)
		protected.DELETE("/appointments/:id", handlers.DeleteAppointment)
	}
}

