package types

import "time"

// BaseModel includes common fields for all GORM models
type BaseModel struct {
	ID        string    `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UserRole constants used across services
const (
	RoleUser    = "user"
	RoleBroker  = "broker"
	RoleManager = "manager"
	RoleAdmin   = "admin"
)

// Lead status constants
const (
	LeadStatusNew        = "new"
	LeadStatusAssigned   = "assigned"
	LeadStatusResponded  = "responded"
	LeadStatusViewing    = "viewing_scheduled"
	LeadStatusCompleted  = "completed"
	LeadStatusCancelled  = "cancelled"
	LeadStatusExpired    = "expired"
)

// SLA status constants
const (
	SLAStatusPending = "pending"
	SLAStatusSuccess = "success"
	SLAStatusWarning = "warning"
	SLAStatusBreach  = "breach"
)

// Document verification levels
const (
	VerificationNone     = "none"
	VerificationBasic    = "basic"
	VerificationVerified = "verified"
	VerificationFull     = "fully_verified"
)

// Booking status constants
const (
	BookingPending   = "pending"
	BookingConfirmed = "confirmed"
	BookingCancelled = "cancelled"
	BookingCompleted = "completed"
)

// Payment status constants
const (
	PaymentPending   = "pending"
	PaymentCompleted = "completed"
	PaymentFailed    = "failed"
	PaymentRefunded  = "refunded"
)

// Property listing types
const (
	ListingTypeBuy  = "buy"
	ListingTypeRent = "rent"
)

// ServiceInfo provides health check metadata
type ServiceInfo struct {
	Name    string `json:"name"`
	Version string `json:"version"`
	Port    string `json:"port"`
	Status  string `json:"status"`
}
