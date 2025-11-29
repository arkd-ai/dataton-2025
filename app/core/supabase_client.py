import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

try:
    if not url or "your_supabase_url" in url:
        raise ValueError("Supabase URL not configured")
    supabase: Client = create_client(url, key)
except Exception as e:
    print(f"WARNING: Could not connect to Supabase: {e}")
    supabase = None
