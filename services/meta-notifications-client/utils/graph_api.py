"""Meta Graph API client utilities"""
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class GraphAPIError(Exception):
    """Custom exception for Graph API errors"""
    def __init__(self, message: str, response_data: Optional[Dict] = None):
        self.message = message
        self.response_data = response_data
        super().__init__(self.message)


class GraphAPIClient:
    """Client for Meta Graph API interactions"""
    
    BASE_URL = 'https://graph.facebook.com/v18.0'
    
    def __init__(self, app_id: str):
        self.app_id = app_id
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make a request to Graph API with error handling"""
        url = f'{self.BASE_URL}/{endpoint}'
        
        try:
            response = requests.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            error_data = None
            if e.response is not None:
                try:
                    error_data = e.response.json()
                except:
                    error_data = {'error': e.response.text}
            
            logger.error(f'[GraphAPI] Request failed: {str(e)}', extra={
                'method': method,
                'endpoint': endpoint,
                'error_data': error_data
            })
            
            raise GraphAPIError(
                f'Graph API request failed: {str(e)}',
                error_data
            )
    
    def subscribe_webhook(
        self,
        callback_url: str,
        verify_token: str,
        access_token: str,
        object_type: str = 'instagram',
        fields: str = 'comments,mentions,media,story_insights'
    ) -> Dict[str, Any]:
        """Subscribe to webhooks"""
        logger.info('[GraphAPI] Subscribing to webhooks', extra={
            'object': object_type,
            'fields': fields
        })
        
        return self._make_request(
            'POST',
            f'{self.app_id}/subscriptions',
            json={
                'object': object_type,
                'callback_url': callback_url,
                'verify_token': verify_token,
                'fields': fields,
                'access_token': access_token
            }
        )
    
    def get_subscriptions(self, access_token: str) -> Dict[str, Any]:
        """Get current webhook subscriptions"""
        logger.info('[GraphAPI] Getting subscriptions')
        
        return self._make_request(
            'GET',
            f'{self.app_id}/subscriptions',
            params={'access_token': access_token}
        )
    
    def unsubscribe_webhook(
        self,
        access_token: str,
        object_type: str = 'instagram'
    ) -> Dict[str, Any]:
        """Unsubscribe from webhooks"""
        logger.info('[GraphAPI] Unsubscribing from webhooks', extra={
            'object': object_type
        })
        
        return self._make_request(
            'DELETE',
            f'{self.app_id}/subscriptions',
            params={
                'object': object_type,
                'access_token': access_token
            }
        )
