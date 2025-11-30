"""Pydantic models for request/response validation"""
from pydantic import BaseModel
from typing import Optional


class SubscribeRequest(BaseModel):
    """Request model for webhook subscription"""
    userId: str
    accessToken: str


class UnsubscribeRequest(BaseModel):
    """Request model for webhook unsubscription"""
    accessToken: str
    object: Optional[str] = 'instagram'
