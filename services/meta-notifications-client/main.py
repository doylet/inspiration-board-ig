from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import PlainTextResponse
import logging
from datetime import datetime
from typing import Optional
import uvicorn

from config import Config
from models import SubscribeRequest, UnsubscribeRequest
from utils.security import verify_request_signature
from utils.graph_api import GraphAPIClient, GraphAPIError
from handlers import InstagramEventHandler

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)
logger = logging.getLogger(__name__)

# Validate configuration
Config.validate()

# Initialize app and clients
app = FastAPI(title="Meta Notifications Client")
graph_api = GraphAPIClient(Config.APP_ID)
event_handler = InstagramEventHandler()


@app.get('/')
async def health_check():
    """Health check endpoint"""
    logger.info('[Health] Health check requested')
    return {
        'status': 'healthy',
        'service': 'Meta Notifications Client',
        'timestamp': datetime.utcnow().isoformat(),
    }


@app.get('/webhook')
async def verify_webhook(
    mode: Optional[str] = Query(None, alias='hub.mode'),
    token: Optional[str] = Query(None, alias='hub.verify_token'),
    challenge: Optional[str] = Query(None, alias='hub.challenge')
):
    """Webhook verification endpoint"""
    logger.info('[Webhook] Verification request received', extra={
        'mode': mode,
        'has_token': bool(token),
        'has_challenge': bool(challenge)
    })
    
    if mode and token:
        if mode == 'subscribe' and token == Config.VERIFY_TOKEN:
            logger.info('[Webhook] Verification successful, sending challenge')
            return PlainTextResponse(content=challenge, status_code=200)
        else:
            logger.warning('[Webhook] Verification failed - invalid token or mode')
            raise HTTPException(status_code=403, detail='Forbidden')
    else:
        logger.warning('[Webhook] Verification failed - missing parameters')
        raise HTTPException(status_code=400, detail='Bad Request')


@app.post('/webhook')
async def receive_webhook(request: Request):
    """Webhook event endpoint"""
    # Verify signature
    body = await request.body()
    signature = request.headers.get('X-Hub-Signature-256')
    
    if not verify_request_signature(body, signature, Config.APP_SECRET):
        raise HTTPException(status_code=403, detail='Invalid signature')
    
    data = await request.json()
    logger.info('[Webhook] Event received', extra={'data': data})
    
    if data.get('object') == 'instagram':
        for entry in data.get('entry', []):
            user_id = entry.get('id')
            time = entry.get('time')
            
            logger.info('[Webhook] Processing entry', extra={
                'user_id': user_id,
                'time': time
            })
            
            for change in entry.get('changes', []):
                field = change.get('field')
                value = change.get('value')
                
                logger.info('[Webhook] Change detected', extra={
                    'field': field,
                    'value': value
                })
                
                # Handle event using event handler
                event_handler.handle_event(field, value)
        
        return PlainTextResponse(content='EVENT_RECEIVED', status_code=200)
    else:
        logger.warning('[Webhook] Invalid object type', extra={'object': data.get('object')})
        raise HTTPException(status_code=404, detail='Not Found')


@app.post('/subscribe')
async def subscribe_webhook(data: SubscribeRequest):
    """Subscribe to webhooks"""
    logger.info('[Subscribe] Webhook subscription requested')
    
    try:
        result = graph_api.subscribe_webhook(
            callback_url=f'{Config.WEBHOOK_URL}/webhook',
            verify_token=Config.VERIFY_TOKEN,
            access_token=data.accessToken
        )
        
        logger.info('[Subscribe] Subscription successful', extra={'result': result})
        return {'success': True, 'data': result}
        
    except GraphAPIError as e:
        logger.error('[Subscribe] Subscription failed', extra={
            'error': e.message,
            'response': e.response_data
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to subscribe to webhooks',
                'details': e.response_data or e.message
            }
        )


@app.get('/subscriptions')
async def get_subscriptions(access_token: str = Query(..., description="Access token for authentication")):
    """Get current webhook subscriptions"""
    logger.info('[Subscriptions] Subscription list requested')
    
    try:
        result = graph_api.get_subscriptions(access_token)
        logger.info('[Subscriptions] Retrieved subscriptions', extra={'result': result})
        return result
        
    except GraphAPIError as e:
        logger.error('[Subscriptions] Failed to get subscriptions', extra={
            'error': e.message,
            'response': e.response_data
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to get subscriptions',
                'details': e.response_data or e.message
            }
        )


@app.delete('/subscribe')
async def unsubscribe_webhook(data: UnsubscribeRequest):
    """Unsubscribe from webhooks"""
    logger.info('[Unsubscribe] Webhook unsubscribe requested')
    
    try:
        result = graph_api.unsubscribe_webhook(
            access_token=data.accessToken,
            object_type=data.object
        )
        
        logger.info('[Unsubscribe] Unsubscribe successful', extra={'result': result})
        return {'success': True, 'data': result}
        
    except GraphAPIError as e:
        logger.error('[Unsubscribe] Unsubscribe failed', extra={
            'error': e.message,
            'response': e.response_data
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to unsubscribe from webhooks',
                'details': e.response_data or e.message
            }
        )


if __name__ == '__main__':
    logger.info('[Server] Meta Notifications Client starting', extra={
        'port': Config.PORT,
        'has_app_id': bool(Config.APP_ID),
        'has_app_secret': bool(Config.APP_SECRET),
        'has_verify_token': bool(Config.VERIFY_TOKEN),
        'webhook_url': Config.WEBHOOK_URL or 'not set'
    })
    
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=Config.PORT,
        reload=Config.DEBUG
    )
