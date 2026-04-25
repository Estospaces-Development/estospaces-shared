package response

import "github.com/gofiber/fiber/v2"

// Success sends a standardized JSON success response
func Success(c *fiber.Ctx, data interface{}) error {
	return c.JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}

// Created sends a 201 Created response
func Created(c *fiber.Ctx, data interface{}) error {
	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    data,
	})
}

// Paginated sends a paginated success response
func Paginated(c *fiber.Ctx, data interface{}, total int64, page, limit int) error {
	totalPages := (total + int64(limit) - 1) / int64(limit)
	return c.JSON(fiber.Map{
		"success":     true,
		"data":        data,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	})
}

// Error sends a standardized JSON error response
func Error(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"success": false,
		"error":   message,
	})
}

// BadRequest sends a 400 error
func BadRequest(c *fiber.Ctx, message string) error {
	return Error(c, 400, message)
}

// Unauthorized sends a 401 error
func Unauthorized(c *fiber.Ctx, message string) error {
	return Error(c, 401, message)
}

// Forbidden sends a 403 error
func Forbidden(c *fiber.Ctx, message string) error {
	return Error(c, 403, message)
}

// NotFound sends a 404 error
func NotFound(c *fiber.Ctx, message string) error {
	return Error(c, 404, message)
}

// InternalError sends a generic 500 error without exposing internal details.
func InternalError(c *fiber.Ctx, _ string) error {
	return Error(c, 500, "Internal server error")
}
