# Meta Notifications Client

A FastAPI-based webhook service for receiving and processing Instagram notifications from Meta's Graph API.

## Project Structure

```
meta-notifications-client/
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── models.py              # Pydantic request/response models
├── handlers/              # Event handlers
│   ├── __init__.py
│   └── instagram_handlers.py  # Instagram event processing
├── utils/                 # Utility modules
│   ├── __init__.py
│   ├── security.py        # Signature verification
│   └── graph_api.py       # Meta Graph API client
├── requirements.txt       # Python dependencies
├── app.yaml              # Google App Engine config
└── .env                  # Environment variables (not in git)
```

## Architecture

The application is organized into separate concerns:

- **main.py**: FastAPI routes and application setup
- **config.py**: Centralized configuration with validation
- **models.py**: Pydantic models for request validation
- **handlers/**: Event-specific processing logic
- **utils/security.py**: HMAC signature verification
- **utils/graph_api.py**: Reusable Graph API client with error handling

## Key Features

- ✅ **Clean separation of concerns** - Each module has a single responsibility
- ✅ **DRY principle** - Eliminated duplicate error handling and API calls
- ✅ **Type safety** - Pydantic models for request/response validation
- ✅ **Centralized configuration** - Single source of truth for settings
- ✅ **Extensible event handlers** - Easy to add new Instagram event types
- ✅ **Reusable API client** - Graph API interactions through a clean interface
- ✅ **Custom exceptions** - Better error handling and debugging

## API Endpoints

### Health Check
- `GET /` - Service health status

### Webhooks
- `GET /webhook` - Webhook verification (Meta callback)
- `POST /webhook` - Receive webhook events from Instagram

### Subscriptions
- `POST /subscribe` - Subscribe to Instagram webhooks
- `GET /subscriptions` - List current subscriptions
- `DELETE /subscribe` - Unsubscribe from webhooks

## Environment Variables

Create a `.env` file with:

```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
WEBHOOK_VERIFY_TOKEN=your_verify_token
WEBHOOK_URL=https://your-app-url.com
PORT=8080
DEBUG=True
```

## Local Development

```bash
# Activate virtual environment
source ../../.venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the service
python main.py
```

The service will start on `http://0.0.0.0:8080` with auto-reload enabled in debug mode.

## API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

## Deployment

Deploy to Google App Engine:

```bash
gcloud app deploy app.yaml --project=inspiration-board-ig
```

Or use Cloud Build (automated via GitHub):

```bash
git push origin main
```

## Adding New Event Handlers

To handle a new Instagram event type:

1. Add a handler method to `handlers/instagram_handlers.py`:
   ```python
   def handle_new_event(self, value: Dict[str, Any]) -> None:
       logger.info('[Event:NewEvent] Processing...', extra={'value': value})
       # Your logic here
   ```

2. The handler will automatically be called when the event is received (no routing needed).

## Security

- All webhook requests are verified using HMAC-SHA256 signatures
- Signatures are validated against `META_APP_SECRET`
- Invalid signatures are rejected with 403 Forbidden

## Error Handling

The `GraphAPIClient` provides centralized error handling:
- Automatically logs all API errors
- Extracts error details from responses
- Raises custom `GraphAPIError` exceptions with context

## Testing

Test the webhook verification:
```bash
curl "http://localhost:8080/webhook?hub.mode=subscribe&hub.verify_token=meta_notifications_verify_token_2025&hub.challenge=test123"
```

Expected response: `test123`
