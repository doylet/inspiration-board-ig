<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Modified principles: Initial creation
Added sections: All sections (initial constitution)
Removed sections: None
Templates status:
  ✅ plan-template.md - Compatible with multi-service architecture
  ✅ spec-template.md - Compatible with user story prioritization
  ✅ tasks-template.md - Compatible with independent service development
Follow-up TODOs: None
-->

# Instagram Inspiration Board Constitution

## Core Principles

### I. Service Independence & Separation of Concerns

**Multi-service architecture with clear boundaries:**
- Frontend (Next.js app) MUST remain independent from backend services
- Backend services MUST be independently deployable and testable
- Each service MUST have its own configuration, dependencies, and deployment pipeline
- Services communicate via well-defined APIs only (no shared code dependencies)

**Rationale**: Enables independent scaling, deployment, and development cycles. Prevents tight coupling and allows teams to work in parallel without conflicts.

### II. Modular Code Organization (NON-NEGOTIABLE)

**Clean separation within services:**
- No duplicate code - extract common logic into reusable modules
- Configuration MUST be centralized in dedicated config modules
- Business logic MUST be separated from API/routing layers
- Each module MUST have a single, clear responsibility
- Utility functions grouped by concern (security, API clients, handlers)

**Rationale**: The refactoring of `main.py` from 203 lines with duplication to modular structure (config.py, models.py, utils/, handlers/) demonstrates this principle. Maintainability and testability improve dramatically.

### III. API-First Design

**External integrations through dedicated clients:**
- All external API calls MUST go through centralized client classes
- Client classes MUST handle errors consistently with custom exceptions
- API responses MUST be validated with type-safe models (Pydantic for Python, TypeScript interfaces for Next.js)
- Retry logic and rate limiting MUST be handled at the client level

**Rationale**: The GraphAPIClient pattern prevents scattered API calls, provides consistent error handling, and makes testing/mocking straightforward.

### IV. Environment-Aware Configuration

**Configuration management:**
- ALL secrets and environment-specific values MUST be in environment variables
- NO hardcoded credentials or URLs in source code
- Each service MUST validate required configuration on startup
- Development, staging, and production configurations MUST be clearly separated

**Rationale**: Security and deployment flexibility. The Config class with validation prevents silent failures from missing environment variables.

### V. Observability & Structured Logging

**Comprehensive logging for debugging:**
- ALL API calls MUST be logged with request/response context
- ALL errors MUST be logged with stack traces and relevant context
- Log levels MUST be used appropriately (DEBUG, INFO, WARN, ERROR)
- Structured logging with contextual metadata (extra fields) preferred
- NO sensitive data (tokens, passwords) in logs

**Rationale**: Production debugging and monitoring. Structured logs enable quick diagnosis of webhook failures, API errors, and user issues.

## Architecture Standards

### Technology Stack

**Frontend (User Application):**
- Next.js 15+ with App Router
- TypeScript for type safety
- NextAuth.js for OAuth authentication
- Tailwind CSS for styling
- Server-side rendering for sensitive operations

**Backend Services (Webhook/Event Processing):**
- Python 3.12+ with FastAPI
- Pydantic for data validation
- Uvicorn as ASGI server
- Structured logging (Python logging module)

**Infrastructure:**
- Google Cloud Platform (App Engine, Cloud Build)
- GitHub for version control and CI/CD triggers
- Environment-based deployment (dev/prod separation)

### Service Architecture

**Project structure:**
```
/
├── src/                    # Next.js frontend application
│   ├── app/               # App Router pages and API routes
│   ├── components/        # React components
│   ├── lib/              # Shared utilities and clients
│   └── types/            # TypeScript type definitions
├── services/              # Independent backend services
│   └── meta-notifications-client/
│       ├── main.py       # FastAPI application
│       ├── config.py     # Configuration management
│       ├── models.py     # Pydantic models
│       ├── handlers/     # Event processing logic
│       └── utils/        # Reusable utilities
├── .specify/             # Speckit templates and constitution
└── cloudbuild.yaml       # CI/CD configuration
```

**Service independence requirements:**
- Each service has its own README.md
- Each service has its own dependencies file (package.json, requirements.txt)
- Each service has its own deployment configuration (app.yaml, Dockerfile)
- Services MUST NOT share source code directories

### Security Requirements

**Authentication & Authorization:**
- OAuth 2.0 for user authentication (Instagram/Meta)
- Session management with secure, httpOnly cookies
- Access tokens stored server-side only
- All webhook endpoints MUST verify HMAC signatures

**Data Protection:**
- NO user credentials in logs or error messages
- Environment variables for all secrets
- HTTPS required for all production endpoints
- API tokens refreshed and rotated appropriately

## Development Workflow

### Code Quality Gates

**Before committing:**
- Code MUST be formatted per project standards (ESLint for TypeScript, PEP8 for Python)
- NO duplicate code - refactor common patterns into utilities
- Type safety enforced (TypeScript strict mode, Pydantic validation)
- Configuration validated on service startup

**Before deployment:**
- Service health check endpoint MUST return 200 OK
- All environment variables MUST be documented in README
- Deployment configuration files up to date

### Deployment Process

**Independent service deployment:**
- Frontend deployed to Vercel or equivalent
- Backend services deployed to Google App Engine or Cloud Run
- Each service deployed independently via CI/CD
- Cloud Build triggers on push to main branch
- Rollback capability maintained for each service

### Documentation Standards

**Required documentation:**
- README.md in each service directory with:
  - Service purpose and architecture
  - Setup instructions (local development)
  - Environment variables required
  - API endpoints (if applicable)
  - Deployment instructions
- API documentation auto-generated (FastAPI /docs, TypeScript JSDoc)
- Architecture decisions documented when deviating from constitution

## Governance

This constitution supersedes all other development practices and coding standards. Any deviation from these principles MUST be explicitly documented and justified.

**Amendment Process:**
1. Propose amendment with clear rationale
2. Document impact on existing services
3. Update affected templates in `.specify/templates/`
4. Increment version according to semantic versioning:
   - MAJOR: Backward-incompatible governance changes
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications, wording improvements

**Compliance:**
- All PRs MUST verify adherence to constitution principles
- Code reviews MUST check for modularity and separation of concerns
- Complexity MUST be justified - prefer simplicity
- Use `.specify/templates/` for feature planning and task generation

**Version**: 1.0.0 | **Ratified**: 2025-11-30 | **Last Amended**: 2025-11-30
