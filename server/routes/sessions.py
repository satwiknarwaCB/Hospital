from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.session import SessionCreate, SessionResponse
from middleware.auth_middleware import get_current_active_doctor
from models.doctor import DoctorResponse
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/sessions", tags=["Therapy Sessions"])

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session: SessionCreate,
    current_doctor: DoctorResponse = Depends(get_current_active_doctor)
):
    """
    Log a new therapy session (Production Level)
    
    Security: Only authenticated therapists can log sessions.
    Automation: Automatically assigns current therapist ID and timestamps.
    """
    try:
        session_data = session.dict()
        
        # Security: Force therapistId to be the authenticated user
        session_data["therapistId"] = current_doctor.id
        
        # Timestamps - use offset-aware UTC
        now = datetime.now(timezone.utc)
        session_data["created_at"] = now
        session_data["updated_at"] = now
        
        # Insert into MongoDB
        result = db_manager.sessions.insert_one(session_data)
        
        # Prepare response
        session_data["_id"] = str(result.inserted_id)
        return session_data
        
    except Exception as e:
        print(f"[ERROR] Session creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to persist session data to MongoDB"
        )

@router.get("/child/{child_id}", response_model=List[SessionResponse])
async def get_child_sessions(child_id: str):
    """
    Fetch all sessions for a specific patient.
    Used by both therapists and parents.
    """
    try:
        # Standard MongoDB query with descending date sort
        cursor = db_manager.sessions.find({"childId": child_id}).sort("date", -1)
        sessions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            sessions.append(doc)
        return sessions
    except Exception as e:
        print(f"[ERROR] Session retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving session history"
        )

@router.get("/therapist/{therapist_id}", response_model=List[SessionResponse])
async def get_therapist_sessions(therapist_id: str):
    """
    Fetch all sessions logged by a specific therapist.
    """
    try:
        cursor = db_manager.sessions.find({"therapistId": therapist_id}).sort("date", -1)
        sessions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            sessions.append(doc)
        return sessions
    except Exception as e:
        print(f"[ERROR] Therapist session retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving therapist records"
        )

@router.delete("/{session_id}")
async def delete_session(
    session_id: str,
    current_doctor: DoctorResponse = Depends(get_current_active_doctor)
):
    """
    Delete a therapy session record.
    Security: Doctors can only delete sessions if authorized (simplified here).
    """
    try:
        # Check if ID is valid ObjectId
        try:
            query_id = ObjectId(session_id)
        except:
            query_id = session_id

        # Delete from MongoDB
        result = db_manager.sessions.delete_one({"_id": query_id})
        
        if result.deleted_count == 0:
            # Try plain string ID
            result = db_manager.sessions.delete_one({"_id": session_id})

        return {"status": "success", "message": "Session deleted"}
    except Exception as e:
        print(f"[ERROR] Session deletion failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session record"
        )


