package middleware

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware validates JWT tokens and sets user_id + user_role in context
func AuthMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{"error": "Missing or invalid authorization header"})
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
		}

		// Set user context
		c.Locals("user_id", claims["sub"])
		if role, ok := claims["role"].(string); ok {
			c.Locals("user_role", role)
		}
		if email, ok := claims["email"].(string); ok {
			c.Locals("user_email", email)
		}

		return c.Next()
	}
}

// RoleMiddleware restricts access to specific roles
func RoleMiddleware(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, ok := c.Locals("user_role").(string)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "Access denied"})
		}

		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(403).JSON(fiber.Map{"error": "Insufficient permissions"})
	}
}

// OptionalAuthMiddleware sets user context if token exists but doesn't require it
func OptionalAuthMiddleware(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Next() // No token — proceed without user context
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return []byte(secret), nil
		})

		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				c.Locals("user_id", claims["sub"])
				if role, ok := claims["role"].(string); ok {
					c.Locals("user_role", role)
				}
			}
		}

		return c.Next()
	}
}
