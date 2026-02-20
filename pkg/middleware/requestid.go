package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/requestid"
)

// RequestIDMiddleware injects a unique X-Request-ID into every request
// and sets it in the local fiber context for logging
func RequestIDMiddleware() fiber.Handler {
	return requestid.New()
}
