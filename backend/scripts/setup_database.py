import sqlite3
import os
from datetime import datetime

def setup_database():
    """Initialize SQLite database with tables for weather reports and users"""
    
    # Create database directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Connect to SQLite database
    conn = sqlite3.connect('data/moto_weather.db')
    cursor = conn.cursor()
    
    # Create users table (optional login)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create weather_reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            weather_type TEXT NOT NULL,
            intensity INTEGER DEFAULT 1,
            description TEXT,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create weather_api_cache table for caching API responses
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weather_api_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            weather_data TEXT NOT NULL,
            cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        )
    ''')
    
    # Create indexes for better performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_weather_reports_location ON weather_reports (latitude, longitude)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_weather_reports_created ON weather_reports (created_at)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_cache_location ON weather_api_cache (latitude, longitude)')
    
    conn.commit()
    conn.close()
    
    print("Database setup completed successfully!")
    print("Tables created: users, weather_reports, weather_api_cache")

if __name__ == "__main__":
    setup_database()
