# EstoSpaces Shared Library

Shared Go packages used across all microservices.

## Packages

| Package | Description |
|---------|-------------|
| `pkg/config` | Environment configuration loader |
| `pkg/database` | GORM PostgreSQL connection wrapper |
| `pkg/middleware` | JWT auth, RBAC, and optional auth middleware |
| `pkg/response` | Standardized JSON response helpers |
| `pkg/types` | Shared constants (roles, statuses, verification levels) |

## Usage

```go
import (
    "github.com/estospaces/shared/pkg/config"
    "github.com/estospaces/shared/pkg/database"
    "github.com/estospaces/shared/pkg/middleware"
    "github.com/estospaces/shared/pkg/response"
    "github.com/estospaces/shared/pkg/types"
)
```
