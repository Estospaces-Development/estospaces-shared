package auth

import (
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

// ValidateToken parses and validates a JWT token string using the provided secret
func ValidateToken(tokenString, secret string) (*jwt.Token, jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, nil, err
	}

	if !token.Valid {
		return nil, nil, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, nil, errors.New("invalid token claims")
	}

	return token, claims, nil
}

// ExtractUserID extracts the canonical "user_id" from the claims.
// It handles fallbacks or errors if the "user_id" claim is missing or malformed.
func ExtractUserID(claims jwt.MapClaims) (string, error) {
	// First check the canonical "user_id"
	if val, ok := claims["user_id"]; ok {
		if str, ok := val.(string); ok && str != "" {
			return str, nil
		}
	}

	// Fallback to "sub" if needed for migration from older tokens, but we encourage "user_id"
	if val, ok := claims["sub"]; ok {
		if str, ok := val.(string); ok && str != "" {
			return str, nil
		}
	}

	return "", errors.New("missing user_id claim in token")
}
