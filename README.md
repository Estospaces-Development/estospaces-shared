# EstoSpaces Shared Package

Shared Go module providing common utilities, middleware, types, and database configuration used across all EstoSpaces microservices.

## Tech Stack

| Component | Version |
|-----------|---------|
| Go | 1.22 |
| Framework | [GoFiber](https://gofiber.io/) v2.52.11 |
| ORM | [GORM](https://gorm.io/) v1.25.12 |
| Auth | golang-jwt v5.3.1 |

## Import

```go
import "github.com/estospaces/shared/pkg/middleware"
import "github.com/estospaces/shared/pkg/config"
import "github.com/estospaces/shared/pkg/database"
import "github.com/estospaces/shared/pkg/types"
import "github.com/estospaces/shared/pkg/jwt"
import "github.com/estospaces/shared/pkg/response"
```

Services reference this module via `go.mod` replace directive:

```go
replace github.com/estospaces/shared => ../estospaces-shared
```

## Package Reference

### `pkg/config` — Configuration

Loads environment variables with defaults:

```go
cfg := config.Load()
// cfg.Server.Port, cfg.Database.Host, cfg.JWT.Secret, etc.
```

### `pkg/database` — Database Connection

Creates GORM PostgreSQL connection with pooling:

```go
db := database.Connect(cfg)
// MaxOpenConns: 25, MaxIdleConns: 10, ConnMaxLifetime: 1h
```

### `pkg/middleware` — Fiber Middleware

```go
// JWT authentication (required)
authMiddleware := middleware.AuthMiddleware(jwtSecret)

// Role-based access control
adminOnly := middleware.RoleMiddleware(authMiddleware, "admin")

// Optional auth (sets user context if token present)
optionalAuth := middleware.OptionalAuthMiddleware(jwtSecret)
```

**Context values set by auth middleware:**
- `c.Locals("user_id")` → `string` (UUID)
- `c.Locals("user_email")` → `string`
- `c.Locals("user_role")` → `string`

### `pkg/middleware/requestid` — Request ID

```go
app.Use(requestid.New())  // Sets X-Request-ID header
```

### `pkg/jwt` — Token Operations

```go
token, err := jwt.GenerateToken(userID, email, role, secret, expiry)
claims, err := jwt.ParseToken(tokenString, secret)
```

### `pkg/response` — Standard Responses

```go
response.Success(data)       // {"success": true, "data": ...}
response.Error(message)      // {"success": false, "error": ...}
response.ErrorWithCode(code, msg)
```

### `pkg/types` — Shared Constants & Types

```go
types.BaseModel     // ID, CreatedAt, UpdatedAt, DeletedAt
types.RoleUser      // "user"
types.RoleBroker    // "broker"
types.RoleManager   // "manager"
types.RoleAdmin     // "admin"
```

Also includes constants for lead statuses, SLA statuses, verification levels, booking statuses, payment statuses, and listing types.

## Package Structure

```
estospaces-shared/
├── pkg/
│   ├── config/
│   │   └── config.go        # Environment loading + defaults
│   ├── database/
│   │   └── database.go      # GORM connection + pool config
│   ├── jwt/
│   │   └── jwt.go           # Token generate + parse
│   ├── middleware/
│   │   ├── auth.go          # AuthMiddleware, RoleMiddleware, OptionalAuth
│   │   └── requestid.go     # X-Request-ID middleware
│   ├── response/
│   │   └── response.go      # Standard JSON responses
│   └── types/
│       └── types.go         # Shared types and constants
└── go.mod
```

## Used By

All 7 microservices depend on this module:

| Service | Usage |
|---------|-------|
| core-service | Config, Database, JWT, Response, Types |
| booking-service | JWT (for token validation) |
| payment-service | JWT (for token validation) |
| notification-service | JWT (for token validation) |
| search-service | JWT (for token validation) |
| messaging-service | JWT (for token validation) |
| media-service | JWT (for token validation) |

> **Note**: Currently, only core-service uses the full shared package (config, database, middleware). Other services have inline JWT auth and database setup that should eventually be migrated to use this shared module.

---

**Last Updated**: February 20, 2026
