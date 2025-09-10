# Game Platform Backend

NestJS v10 + TypeScript + TypeORM backend for secure game session management and asset streaming.

## Features

- **Session-based JWT authentication** with 5-minute rolling tokens
- **Heartbeat mechanism** for session persistence monitoring
- **Range streaming** for game assets with session validation
- **Billing integration stub** (ready for RLUSD API)
- **Swagger API documentation** at `/docs`
- **Rate limiting** and security headers
- **Comprehensive e2e and unit tests**

## Tech Stack

- NestJS v10
- TypeScript v5
- TypeORM with PostgreSQL
- JWT session tokens
- Helmet for security
- Throttler for rate limiting

## Installation

```bash
npm install
```

## Environment Setup

Create a `.env` file (see `.env` for example):

```env
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/game_platform
SESSION_JWT_SECRET=replace_me_with_secure_secret
SESSION_JWT_TTL_SEC=300
HEARTBEAT_INTERVAL_SEC=45
ASSET_STORAGE_ROOT=./storage/assets
```

## Database Setup

```bash
# Run migrations
npm run migration:run

# Seed sample data
npm run seed
```

## Running the Application

```bash
# Development with watch mode
npm run dev

# Production build
npm run build
npm run start:prod
```

## API Documentation

Visit `http://localhost:3000/docs` for Swagger documentation.

## Key API Endpoints

### Play Session Management

- `POST /api/play/start` - Start a new play session
- `POST /api/play/heartbeat` - Send heartbeat to maintain session
- `POST /api/play/stop` - Stop the current session

### Asset Streaming

- `GET /api/assets/:assetId` - Stream asset with Range support (requires session JWT)

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Architecture

### Modules

- **auth** - JWT session strategy and guards
- **users** - User management
- **games** - Game metadata
- **play** - Session lifecycle management
- **assets** - Secure asset streaming with Range support
- **billing** - Payment stream monitoring (stub)

### Security

- Session tokens expire in 5 minutes (configurable)
- Heartbeat required every 45 seconds
- Assets only accessible with valid session
- No public static hosting - all assets proxied through API
- Rate limiting on all endpoints
- CORS configured for frontend domains only

### Database Schema

- **users** - User accounts with wallet addresses
- **games** - Game metadata and versions
- **play_sessions** - Active and historical sessions
- **assets** - Game asset registry with paths and metadata

## Development Notes

- Never trust the client - all validation server-side
- Assets served through proxy, not direct URLs
- Session tokens roll on each heartbeat
- Billing checks at session start and heartbeat
- Automatic session cleanup for expired sessions

## Production Deployment

1. Set secure `SESSION_JWT_SECRET`
2. Configure production database
3. Enable SSL/TLS
4. Set appropriate CORS origins
5. Configure CDN with signed URLs (optional)
6. Set up monitoring and logging
7. Configure auto-scaling based on sessions

## License

Proprietary