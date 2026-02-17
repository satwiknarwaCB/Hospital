"""
Parent Authentication API Routes
Handles login, logout, and profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.parent import ParentLogin, ParentResponse, TokenResponse
from utils.auth import verify_password, create_access_token
from middleware.auth_middleware import get_current_parent
from datetime import datetime, timezone


router = APIRouter(prefix="/api/parent", tags=["Parent Authentication"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(credentials: ParentLogin):
    """
    Parent login endpoint
    
    Validates email and password, returns JWT token on success
    
    Args:
        credentials: Parent login credentials (email, password)
        
    Returns:
        TokenResponse with access token and parent information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find parent by email
    parent_data = db_manager.parents.find_one({"email": credentials.email})
    
    if not parent_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    if not verify_password(credentials.password, parent_data["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if parent is active
    if not parent_data.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent account is deactivated. Please contact administrator."
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(parent_data["_id"]), "email": str(parent_data["email"])}
    )
    
    # Update last login timestamp in DB
    login_time = datetime.now(timezone.utc)
    db_manager.parents.update_one(
        {"_id": parent_data["_id"]},
        {"$set": {"last_login": login_time}}
    )
    
    # Prepare parent response - ensure _id is converted to string
    parent_id = str(parent_data["_id"])
    parent_response = ParentResponse(
        id=parent_id,
        name=str(parent_data["name"]),
        email=str(parent_data["email"]),
        phone=str(parent_data.get("phone")) if parent_data.get("phone") else None,
        children_ids=[str(cid) for cid in parent_data.get("children_ids", [])],
        childId=str(parent_data.get("child_id")) if parent_data.get("child_id") else (str(parent_data.get("children_ids")[0]) if parent_data.get("children_ids") else None),
        relationship=str(parent_data.get("relationship")) if parent_data.get("relationship") else None,
        is_active=bool(parent_data.get("is_active", True)),
        created_at=parent_data.get("created_at"),
        last_login=login_time,
        role="parent"
    )
    
    # Auto-join parent to default community
    try:
        from bson import ObjectId
        
        # Get or create default community
        default_community = db_manager.communities.find_one({"name": "Parent Support Community"})
        
        if not default_community:
            # Create default community
            default_community = {
                "_id": str(ObjectId()),
                "name": "Parent Support Community",
                "description": "A safe space for parents to connect, share experiences, and support each other on their journey.",
                "created_by": "system",
                "member_ids": [],
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            db_manager.communities.insert_one(default_community)
        
        community_id = str(default_community["_id"])
        member_ids = default_community.get("member_ids", [])
        
        # Add parent to community if not already a member
        if parent_id not in member_ids:
            db_manager.communities.update_one(
                {"_id": community_id},
                {
                    "$push": {"member_ids": parent_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
    except Exception as e:
        # Log error but don't fail login
        print(f"Warning: Failed to auto-join community: {str(e)}")
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        parent=parent_response
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout():
    """
    Parent logout endpoint
    
    Note: JWT tokens are stateless, so logout is handled on the client side
    by removing the token from storage. This endpoint is provided for
    consistency and can be extended to implement token blacklisting if needed.
    
    Returns:
        Success message
    """
    return {
        "message": "Logout successful",
        "detail": "Please clear the token from client storage"
    }


@router.get("/profile", response_model=ParentResponse, status_code=status.HTTP_200_OK)
async def get_profile(current_parent: ParentResponse = Depends(get_current_parent)):
    """
    Get current parent profile (protected route)
    
    Requires valid JWT token in Authorization header
    
    Args:
        current_parent: Current authenticated parent from middleware
        
    Returns:
        ParentResponse with parent information
    """
    return current_parent


@router.get("/me", response_model=ParentResponse, status_code=status.HTTP_200_OK)
async def get_me(current_parent: ParentResponse = Depends(get_current_parent)):
    """
    Get current parent profile (alternative endpoint)
    
    Alias for /profile endpoint
    
    Returns:
        ParentResponse with parent information
    """
    return current_parent
