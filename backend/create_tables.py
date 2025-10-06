#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.core.database import Base, engine
from app.models import *

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()