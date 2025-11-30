from fastapi import FastAPI, Request, HTTPException, Query
from fastapi.responses import JSONResponse, PlainTextResponse
import os
import hmac
import hashlib
import logging
from datetime import datetime
from dotenv import load_dotenv
import requests
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Load environment variables
load_dotenv()

app = FastAPI(title="Meta Notifications Client")

# Configuration
VERIFY_TOKEN = os.getenv('WEBHOOK_VERIFY_TOKEN', 'meta_notifications_verify_token_2025')
APP_SECRET = os.getenv('META_APP_SECRET')
APP_ID = os.getenv('META_APP_ID')
WEBHOOK_URL = os.getenv('WEBHOOK_URL')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S'
)
logger = logging.getLogger(__name__)


# Pydantic models
class SubscribeRequest(BaseModel):
    userId: str
    accessToken: str


class UnsubscribeRequest(BaseModel):
    accessToken: str
    object: Optional[str] = 'instagram'


def verify_request_signature(data: bytes, signature: Optional[str]) -> bool:
    """Verify that the callback came from Meta/Facebook"""
    if not signature:
        logger.warning('[Security] No signature found in request')
        return False
    
    try:
        sha_name, signature_hash = signature.split('=')
    except ValueError:
        logger.error('[Security] Invalid signature format')
        return False
    
    if sha_name != 'sha256':
        logger.error(f'[Security] Unknown signature algorithm: {sha_name}')
        return False
    
    expected_hash = hmac.new(
        APP_SECRET.encode('utf-8'),
        data,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature_hash, expected_hash):
        logger.error('[Security] Invalid signature')
        return False
    
    logger.info('[Security] Signature verified successfully')
    return True

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
    request: Request,
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
        if mode == 'subscribe' and token == VERIFY_TOKEN:
            logger.info('[Webhook] Verification successful, sending challenge')
            return PlainTextResponse(content=challenge, status_code=200)
        else:
            logger.warning('[Webhook] Verification failed - invalid token or mode')
            raise HTTPException(status_code=403, detail='Forbidden')
    else:
        logger.warning('[Webhook] Verification failed - missing parameters')
        raise HTTPException(status_code=400, detail='Bad Request')
        logger.warning('[Webhook] Verification failed - missing parameters')

@app.post('/webhook')
async def receive_webhook(request: Request):
    """Webhook event endpoint"""
    # Verify signature
    body = await request.body()
    signature = request.headers.get('X-Hub-Signature-256')
    
    if not verify_request_signature(body, signature):
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
                
                # Handle different webhook events
                if field == 'comments':
                    handle_comment(value)
                elif field == 'mentions':
                    handle_mention(value)
                elif field == 'media':
                    handle_media(value)
                elif field == 'story_insights':
                    handle_story_insights(value)
                else:
                    logger.warning(f'[Webhook] Unhandled webhook field: {field}')
        
        return PlainTextResponse(content='EVENT_RECEIVED', status_code=200)
    else:
        logger.warning('[Webhook] Invalid object type', extra={'object': data.get('object')})
        raise HTTPException(status_code=404, detail='Not Found')


def handle_comment(value):
    """Handle comment events"""
    logger.info('[Event:Comment] New comment received', extra={'value': value})
    # Add your comment handling logic here


def handle_mention(value):
    """Handle mention events"""
    logger.info('[Event:Mention] New mention received', extra={'value': value})
    # Add your mention handling logic here


def handle_media(value):
    """Handle media events"""
    logger.info('[Event:Media] Media event received', extra={'value': value})
    # Add your media handling logic here

def handle_story_insights(value):
    """Handle story insights events"""
    logger.info('[Event:StoryInsights] Story insights event received', extra={'value': value})
    # Add your story insights handling logic here

@app.post('/subscribe')
async def subscribe_webhook(data: SubscribeRequest):
    """Subscribe to webhooks"""
    logger.info('[Subscribe] Webhook subscription requested')
    
    try:
        subscribe_url = f'https://graph.facebook.com/v18.0/{APP_ID}/subscriptions'
        
        response = requests.post(subscribe_url, json={
            'object': 'instagram',
            'callback_url': f'{WEBHOOK_URL}/webhook',
            'verify_token': VERIFY_TOKEN,
            'fields': 'comments,mentions,media,story_insights',
            'access_token': data.accessToken
        })
        
        response.raise_for_status()
        result = response.json()
        
        logger.info('[Subscribe] Subscription successful', extra={'result': result})
        
        return {
            'success': True,
            'data': result
        }
        
    except requests.exceptions.RequestException as e:
        logger.error('[Subscribe] Subscription failed', extra={
            'error': str(e),
            'response': e.response.json() if e.response else None
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to subscribe to webhooks',
                'details': e.response.json() if e.response else str(e)
            }
        )
        
        return jsonify({
            'error': 'Failed to subscribe to webhooks',
            'details': e.response.json() if e.response else str(e)
        }), 500

@app.get('/subscriptions')
async def get_subscriptions(access_token: str = Query(..., description="Access token for authentication")):
    """Get current webhook subscriptions"""
    logger.info('[Subscriptions] Subscription list requested')
    
    try:
        response = requests.get(
            f'https://graph.facebook.com/v18.0/{APP_ID}/subscriptions',
            params={'access_token': access_token}
        )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info('[Subscriptions] Retrieved subscriptions', extra={'result': result})
        
        return result
        
    except requests.exceptions.RequestException as e:
        logger.error('[Subscriptions] Failed to get subscriptions', extra={
            'error': str(e),
            'response': e.response.json() if e.response else None
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to get subscriptions',
                'details': e.response.json() if e.response else str(e)
            }
        )
    
        return jsonify({
            'error': 'Failed to get subscriptions',
            'details': e.response.json() if e.response else str(e)
        }), 500


@app.delete('/subscribe')
async def unsubscribe_webhook(data: UnsubscribeRequest):
    """Unsubscribe from webhooks"""
    logger.info('[Unsubscribe] Webhook unsubscribe requested')
    
    try:
        response = requests.delete(
            f'https://graph.facebook.com/v18.0/{APP_ID}/subscriptions',
            params={
                'object': data.object,
                'access_token': data.accessToken
            }
        )
        
        response.raise_for_status()
        result = response.json()
        
        logger.info('[Unsubscribe] Unsubscribe successful', extra={'result': result})
        
        return {
            'success': True,
            'data': result
        }
        
    except requests.exceptions.RequestException as e:
        logger.error('[Unsubscribe] Unsubscribe failed', extra={
            'error': str(e),
            'response': e.response.json() if e.response else None
        })
        
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to unsubscribe from webhooks',
                'details': e.response.json() if e.response else str(e)
            }
        )

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    logger.info('[Server] Meta Notifications Client starting', extra={
        'port': port,
        'has_app_id': bool(APP_ID),
        'has_app_secret': bool(APP_SECRET),
        'has_verify_token': bool(VERIFY_TOKEN),
        'webhook_url': WEBHOOK_URL or 'not set'
    })
    
    app.run(host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'False').lower() == 'true')
if __name__ == '__main__':
    
    port = int(os.getenv('PORT', 8080))
    logger.info('[Server] Meta Notifications Client starting', extra={
        'port': port,
        'has_app_id': bool(APP_ID),
        'has_app_secret': bool(APP_SECRET),
        'has_verify_token': bool(VERIFY_TOKEN),
        'webhook_url': WEBHOOK_URL or 'not set'
    })
    
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=port,
        reload=os.getenv('DEBUG', 'False').lower() == 'true'
    )