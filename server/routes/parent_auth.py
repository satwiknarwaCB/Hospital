"""
Parent Authentication API Routes
Handles login, logout, and profile endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.parent import ParentLogin, ParentResponse, TokenResponse, ParentUpdate
from utils.auth import verify_password, create_access_token
from middleware.auth_middleware import get_current_parent
from datetime import datetime, timezone
from bson import ObjectId


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
    print(f"[LOGIN] Parent login attempt: {credentials.email}")
    
    # Find parent by email (case-insensitive)
    import re
    parent_data = db_manager.parents.find_one({"email": {"$regex": f"^{re.escape(credentials.email)}$", "$options": "i"}})
    
    if not parent_data:
        print(f"[LOGIN FAIL] Parent not found: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify password
    is_valid = verify_password(credentials.password, parent_data["hashed_password"])
    print(f"[LOGIN DEBUG] Password valid for {credentials.email}: {is_valid}")
    
    if not is_valid:
        print(f"[LOGIN FAIL] Password mismatch for {credentials.email}")
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
    
    # Safely get children_ids
    raw_children_ids = parent_data.get("children_ids", [])
    if raw_children_ids is None:
        raw_children_ids = []
    children_ids = [str(cid) for cid in raw_children_ids]
    
    # Safely get childId
    child_id_val = parent_data.get("child_id")
    if not child_id_val and children_ids:
        child_id_val = children_ids[0]
        
    parent_response = ParentResponse(
        id=parent_id,
        name=str(parent_data.get("name", "Unknown")),
        email=str(parent_data.get("email", "")),
        phone=str(parent_data.get("phone")) if parent_data.get("phone") else None,
        address=str(parent_data.get("address")) if parent_data.get("address") else None,
        avatar=str(parent_data.get("avatar")) if parent_data.get("avatar") else None,
        children_ids=children_ids,
        childId=str(child_id_val) if child_id_val else None,
        relationship=str(parent_data.get("relationship")) if parent_data.get("relationship") else None,
        is_active=bool(parent_data.get("is_active", True)),
        created_at=parent_data.get("created_at"),
<<<<<<< HEAD
=======
        last_login=login_time,
>>>>>>> 748b94b9a72a8862b168f48cef7cb41e2e2f7dfc
        role="parent"
    )
    
    # Auto-join parent to default community
    try:
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
    """
    return current_parent


@router.put("/profile", response_model=ParentResponse, status_code=status.HTTP_200_OK)
async def update_profile(
    update_data: ParentUpdate,
    current_parent: ParentResponse = Depends(get_current_parent)
):
    """
    Update parent profile
    """
    print(f"[PROFILE] Update request for parent: {current_parent.email}")
    try:
        # Prepare update fields
        update_fields = {}
        if update_data.name:
            update_fields["name"] = update_data.name
        if update_data.phone:
            update_fields["phone"] = update_data.phone
        if update_data.address:
            update_fields["address"] = update_data.address
        if update_data.avatar:
            update_fields["avatar"] = update_data.avatar
        if update_data.relationship:
            update_fields["relationship"] = update_data.relationship
            
        update_fields["updated_at"] = datetime.now(timezone.utc)
        
        # Database update operation
        # Separate $set and $push operations
        db_set = update_fields 
        db_push = {}
        
        # Handle document upload if present
        if update_data.document and update_data.documentName:
            print("[PROFILE] Processing document upload...")
            try:
                new_doc = {
                    "id": str(ObjectId()),
                    "name": update_data.documentName,
                    "content": update_data.document, # Store base64 content
                    "uploaded_at": datetime.now(timezone.utc),
                    "uploaded_by": current_parent.name,
                    "child_id": current_parent.childId
                }
                
                db_push["documents"] = new_doc
                print("[PROFILE] Document processed successfully")
                
                # ALSO Update the child's record if childId is known
                if current_parent.childId:
                    print(f"[PROFILE] Pushing document to child: {current_parent.childId}")
                    db_manager.children.update_one(
                        {"_id": current_parent.childId},
                        {"$push": {"documents": {
                            **new_doc,
                            "title": update_data.documentName,
                            "type": "Parent Upload",
                            "category": "Parent Documents",
                            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
                        }}}
                    )
            except Exception as doc_error:
                print(f"[ERROR] Document processing failed: {str(doc_error)}")
                raise HTTPException(status_code=400, detail="Invalid document format")
        
        # Combine operations
        update_command = {}
        if db_set:
            update_command["$set"] = db_set
        if db_push:
            update_command["$push"] = db_push
        
        # Robust Update Logic: Try String ID first, then ObjectId
        parent_id = current_parent.id
        filter_query = {"_id": parent_id}
        
        if not update_command:
            print("[PROFILE] No changes detected, skipping update")
            return current_parent

        print(f"[PROFILE] Attempting update with String ID: {parent_id}")
        result = db_manager.parents.update_one(filter_query, update_command)
        
        if result.matched_count == 0:
            if ObjectId.is_valid(parent_id):
                print(f"[PROFILE] String ID match failed. Attempting ObjectId: {parent_id}")
                filter_query = {"_id": ObjectId(parent_id)}
                result = db_manager.parents.update_one(filter_query, update_command)
        
        if result.matched_count == 0:
            print("[ERROR] Parent not found during update (checked both String and ObjectId)")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent not found"
            )
            
        # Fetch updated parent using the successful filter_query
        updated_parent_data = db_manager.parents.find_one(filter_query)
        
        if not updated_parent_data:
             print("[ERROR] Update reported success but document fetch failed")
             raise HTTPException(status_code=500, detail="Update verification failed")

        print("[PROFILE] Update successful, returning response")
        
        # Return updated profile
        return ParentResponse(
            id=str(updated_parent_data["_id"]),
            name=str(updated_parent_data.get("name", "")),
            email=str(updated_parent_data.get("email", "")),
            phone=str(updated_parent_data.get("phone")) if updated_parent_data.get("phone") else None,
            address=str(updated_parent_data.get("address")) if updated_parent_data.get("address") else None,
            avatar=str(updated_parent_data.get("avatar")) if updated_parent_data.get("avatar") else None,
            children_ids=[str(cid) for cid in updated_parent_data.get("children_ids", [])],
            childId=str(updated_parent_data.get("child_id") or (updated_parent_data.get("children_ids")[0] if updated_parent_data.get("children_ids") else "")),
            relationship=str(updated_parent_data.get("relationship")) if updated_parent_data.get("relationship") else None,
            is_active=bool(updated_parent_data.get("is_active", True)),
            created_at=updated_parent_data.get("created_at"),
            role="parent"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"[ERROR] Failed to update profile: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile. Server error: {str(e)}"
        )


@router.get("/me", response_model=ParentResponse, status_code=status.HTTP_200_OK)
async def get_me(current_parent: ParentResponse = Depends(get_current_parent)):
    """
    Get current parent profile (alternative endpoint)
    """
    return current_parent
