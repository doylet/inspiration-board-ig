"""Instagram webhook event handlers"""
import logging
from typing import Dict, Any, Callable

logger = logging.getLogger(__name__)


class InstagramEventHandler:
    """Handler for Instagram webhook events"""
    
    def __init__(self):
        # Map event fields to handler methods
        self.handlers: Dict[str, Callable] = {
            'comments': self.handle_comment,
            'mentions': self.handle_mention,
            'media': self.handle_media,
            'story_insights': self.handle_story_insights,
        }
    
    def handle_event(self, field: str, value: Dict[str, Any]) -> None:
        """Route event to appropriate handler"""
        handler = self.handlers.get(field)
        
        if handler:
            handler(value)
        else:
            logger.warning(f'[Webhook] Unhandled webhook field: {field}')
    
    def handle_comment(self, value: Dict[str, Any]) -> None:
        """Handle comment events"""
        logger.info('[Event:Comment] New comment received', extra={'value': value})
        # Add your comment handling logic here
    
    def handle_mention(self, value: Dict[str, Any]) -> None:
        """Handle mention events"""
        logger.info('[Event:Mention] New mention received', extra={'value': value})
        # Add your mention handling logic here
    
    def handle_media(self, value: Dict[str, Any]) -> None:
        """Handle media events"""
        logger.info('[Event:Media] Media event received', extra={'value': value})
        # Add your media handling logic here
    
    def handle_story_insights(self, value: Dict[str, Any]) -> None:
        """Handle story insights events"""
        logger.info('[Event:StoryInsights] Story insights event received', extra={'value': value})
        # Add your story insights handling logic here
