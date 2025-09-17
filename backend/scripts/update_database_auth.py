import sqlite3
import os

def update_database_for_auth():
    """Update database schema to support authentication"""
    
    # Ensure data directory exists
    data_dir = "data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    db_path = os.path.join(data_dir, "moto_weather.db")
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Update users table to support authentication
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT,
                password_hash TEXT,
                google_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Update reports table to link with users
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                weather_type TEXT NOT NULL,
                intensity TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        
        # Copy existing reports if any
        cursor.execute("""
            INSERT OR IGNORE INTO reports_new (latitude, longitude, weather_type, intensity, description, created_at)
            SELECT latitude, longitude, weather_type, intensity, description, created_at 
            FROM reports WHERE EXISTS (SELECT name FROM sqlite_master WHERE type='table' AND name='reports')
        """)
        
        # Drop old reports table and rename new one
        cursor.execute("DROP TABLE IF EXISTS reports")
        cursor.execute("ALTER TABLE reports_new RENAME TO reports")
        
        conn.commit()
        print("✅ Database updated successfully for authentication!")
        print("📊 Tables created:")
        print("   - users (with auth fields)")
        print("   - reports (linked to users)")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    update_database_for_auth()
