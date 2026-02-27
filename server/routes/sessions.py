from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from database import db_manager
from models.session import SessionCreate, SessionResponse
from middleware.auth_middleware import get_current_active_doctor, get_current_user
from models.doctor import DoctorResponse
from datetime import datetime, timezone
from bson import ObjectId

router = APIRouter(prefix="/api/sessions", tags=["Therapy Sessions"])

@router.get("", response_model=List[SessionResponse])
async def list_all_sessions(current_user: dict = Depends(get_current_user)):
    """
    List all sessions in the system.
    Used by admins for dashboard metrics like room utilization.
    """
    try:
        cursor = db_manager.sessions.find().sort("date", -1)
        sessions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            # Ensure normalization
            if "childId" not in doc and "child_id" in doc:
                doc["childId"] = doc["child_id"]
            if "therapistId" not in doc and "therapist_id" in doc:
                doc["therapistId"] = doc["therapist_id"]
            sessions.append(doc)
        return sessions
    except Exception as e:
        print(f"[ERROR] Global session retrieval failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving global session records"
        )


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
        # Robust query: check both childId (camelCase) and child_id (snake_case)
        cursor = db_manager.sessions.find({
            "$or": [
                {"childId": child_id},
                {"child_id": child_id}
            ]
        }).sort("date", -1)
        
        sessions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            # Ensure both fields are present for frontend normalization
            if "childId" not in doc and "child_id" in doc:
                doc["childId"] = doc["child_id"]
            if "therapistId" not in doc and "therapist_id" in doc:
                doc["therapistId"] = doc["therapist_id"]
                
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
        # Robust query: check both therapistId (camelCase) and therapist_id (snake_case)
        cursor = db_manager.sessions.find({
            "$or": [
                {"therapistId": therapist_id},
                {"therapist_id": therapist_id}
            ]
        }).sort("date", -1)
        
        sessions = []
        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            # Ensure both fields are present for frontend normalization
            if "childId" not in doc and "child_id" in doc:
                doc["childId"] = doc["child_id"]
            if "therapistId" not in doc and "therapist_id" in doc:
                doc["therapistId"] = doc["therapist_id"]
                
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


