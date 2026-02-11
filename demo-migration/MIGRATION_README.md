# Shared Library - Demo Migration Reference

## What Was Migrated

### Utils (from `src/utils/`)
- `currencyUtils.js` - GBP formatting, price calculations
- `authHelpers.js` - Token management helpers
- `exportUtils.ts` - Export data to CSV/PDF
- `typography.js` - Typography utilities
- `chatbotResponses.js` - AI chatbot response templates

### Types (from `src/contexts/`)
- All React contexts containing type definitions for auth, notifications, etc.

### Constants
- `mockDataService.js` - Mock data for development (44KB) - property samples, user data

### Config
- `.env.example` - Environment variable template

## Target Structure
```
packages/
  types/         - Shared TypeScript interfaces
  utils/         - Currency, date, auth helpers
  constants/     - API endpoints, roles, statuses
  validation/    - Zod schemas for request/response validation
  ui-components/ - Shared React components (for web + mobile)
```
