package entitlementpermit

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

const Lifetime = 30 * time.Second

const (
	ActionPublishProperty = "publish_property"
	ActionCreateFastTrack = "create_fast_track_case"
)

var ErrInvalid = errors.New("invalid entitlement permit")

// Claims are signed by Payment and verified by the service owning the counted
// write. This type deliberately contains no browser or provider credential.
type Claims struct {
	PermitID               string        `json:"permit_id"`
	KeyID                  string        `json:"key_id"`
	ManagerID              string        `json:"manager_id"`
	Mode                   string        `json:"mode"`
	CallerService          string        `json:"caller_service"`
	Action                 string        `json:"action"`
	IdempotencyKey         string        `json:"idempotency_key"`
	AuthorityVersion       string        `json:"authority_version"`
	ResourceKey            string        `json:"resource_key,omitempty"`
	PublishedPropertyLimit ResourceLimit `json:"published_property_limit"`
	ActiveCaseLimit        ResourceLimit `json:"active_case_limit"`
	IssuedAt               time.Time     `json:"issued_at"`
	ExpiresAt              time.Time     `json:"expires_at"`
}

// ResourceLimit is part of the signed authorization. A finite limit is always
// non-negative; unlimited deliberately has no numeric sentinel.
type ResourceLimit struct {
	Kind  string `json:"kind"`
	Value *int   `json:"value,omitempty"`
}

func Verify(token, publicKeyBase64 string, now time.Time) (Claims, error) {
	var claims Claims
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return claims, ErrInvalid
	}
	payload, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return claims, ErrInvalid
	}
	signature, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return claims, ErrInvalid
	}
	key, err := decodePublicKey(publicKeyBase64)
	if err != nil || !ed25519.Verify(key, payload, signature) {
		return claims, ErrInvalid
	}
	if err := json.Unmarshal(payload, &claims); err != nil || !validClaims(claims) {
		return Claims{}, ErrInvalid
	}
	now = now.UTC()
	if !now.Before(claims.ExpiresAt.UTC()) || now.Before(claims.IssuedAt.UTC()) {
		return Claims{}, ErrInvalid
	}
	return claims, nil
}

func decodePublicKey(value string) (ed25519.PublicKey, error) {
	decoded, err := base64.RawStdEncoding.DecodeString(strings.TrimSpace(value))
	if err != nil {
		decoded, err = base64.StdEncoding.DecodeString(strings.TrimSpace(value))
	}
	if err != nil || len(decoded) != ed25519.PublicKeySize {
		return nil, ErrInvalid
	}
	return ed25519.PublicKey(decoded), nil
}

func validClaims(claims Claims) bool {
	if _, err := uuid.Parse(claims.PermitID); err != nil {
		return false
	}
	if _, err := uuid.Parse(claims.ManagerID); err != nil {
		return false
	}
	if strings.TrimSpace(claims.KeyID) == "" || strings.TrimSpace(claims.Mode) == "" || strings.TrimSpace(claims.CallerService) == "" || strings.TrimSpace(claims.IdempotencyKey) == "" || strings.TrimSpace(claims.AuthorityVersion) == "" {
		return false
	}
	if claims.Action != ActionPublishProperty && claims.Action != ActionCreateFastTrack {
		return false
	}
	if !validResourceLimit(claims.PublishedPropertyLimit) || !validResourceLimit(claims.ActiveCaseLimit) {
		return false
	}
	return claims.ExpiresAt.UTC().Equal(claims.IssuedAt.UTC().Add(Lifetime))
}

func validResourceLimit(limit ResourceLimit) bool {
	if limit.Kind == "unlimited" {
		return limit.Value == nil
	}
	return limit.Kind == "finite" && limit.Value != nil && *limit.Value >= 0
}
