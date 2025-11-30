"""Security utilities for webhook verification"""
import hmac
import hashlib
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def verify_request_signature(data: bytes, signature: Optional[str], app_secret: str) -> bool:
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
        app_secret.encode('utf-8'),
        data,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature_hash, expected_hash):
        logger.error('[Security] Invalid signature')
        return False
    
    logger.info('[Security] Signature verified successfully')
    return True
