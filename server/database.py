"""
MongoDB Database Connection
Handles database initialization and connection management
"""
from pymongo import MongoClient
from pymongo.database import Database
from config import settings


class DatabaseManager:
    """MongoDB database manager singleton"""
    
    _instance = None
    _client: MongoClient = None
    _db: Database = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        """Initialize MongoDB connection"""
        if self._client is None:
            try:
                self._client = MongoClient(settings.MONGODB_URL)
                self._db = self._client[settings.DATABASE_NAME]
                # Test connection
                self._client.server_info()
                print(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")
            except Exception as e:
                print(f"[ERROR] MongoDB connection error: {e}")
                raise
    
    def disconnect(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("[DISCONNECT] MongoDB connection closed")
    
    def get_database(self) -> Database:
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    @property
    def doctors(self):
        """Get doctors collection"""
        return self.get_database()["doctors"]
    
    @property
    def children(self):
        """Get children collection"""
        return self.get_database()["patients"]
    
    @property
    def sessions(self):
        """Get sessions collection"""
        return self.get_database()["sessions"]
    
    @property
    def parents(self):
        """Get parents collection"""
        return self.get_database()["parents"]
    
    @property
    def admins(self):
        """Get admins collection"""
        return self.get_database()["admins"]

    @property
    def appointments(self):
        """Get appointments collection"""
        return self.get_database()["appointments"]

    @property
    def communities(self):
        """Get communities collection"""
        return self.get_database()["communities"]
    
    @property
    def community_messages(self):
        """Get community messages collection"""
        return self.get_database()["community_messages"]

    @property
    def direct_messages(self):
        """Get direct (private) messages collection"""
        return self.get_database()["direct_messages"]



# Create global database manager instance
db_manager = DatabaseManager()


def get_db() -> Database:
    """Dependency to get database instance"""
    return db_manager.get_database()
