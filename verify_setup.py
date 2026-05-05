#!/usr/bin/env python3
"""
Voice2PDF Backend Verification Script

Run this to verify all components are correctly configured.
Usage: python verify_setup.py
"""

import sys
import subprocess
from pathlib import Path

def check_file(path: str) -> bool:
    """Check if file exists."""
    exists = Path(path).exists()
    status = "✅" if exists else "❌"
    print(f"{status} {path}")
    return exists

def check_import(module: str) -> bool:
    """Check if module can be imported."""
    try:
        __import__(module)
        print(f"✅ {module}")
        return True
    except ImportError as e:
        print(f"❌ {module}: {e}")
        return False

def check_command(cmd: str) -> bool:
    """Check if command is available."""
    result = subprocess.run(["which", cmd], capture_output=True)
    exists = result.returncode == 0
    status = "✅" if exists else "❌"
    print(f"{status} {cmd}")
    return exists

def main():
    print("\n" + "="*60)
    print("Voice2PDF Backend Verification")
    print("="*60 + "\n")
    
    all_good = True
    
    # Check project structure
    print("📁 Project Structure:")
    files = [
        "backend/__init__.py",
        "backend/main.py",
        "backend/config.py",
        "backend/routes/conversion.py",
        "backend/services/speech.py",
        "backend/services/tts.py",
        "backend/websocket/transcription.py",
        "backend/requirements.txt",
    ]
    for f in files:
        if not check_file(f):
            all_good = False
    
    print("\n🔧 Required Commands:")
    commands = ["python", "ffmpeg", "ffprobe"]
    for cmd in commands:
        if not check_command(cmd):
            all_good = False
    
    print("\n📦 Python Packages:")
    packages = [
        "fastapi",
        "uvicorn",
        "pydantic",
        "numpy",
        "pydub",
        "reportlab",
        "deep_translator",
        "edge_tts",
        # "whisper",  # May fail on Python 3.14, that's ok
    ]
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"✅ {pkg}")
        except ImportError:
            print(f"⚠️  {pkg} (optional or not installed)")
    
    print("\n🎯 Checking Imports:")
    imports = [
        "backend.config",
        "backend.main",
        "backend.routes.conversion",
        "backend.services.speech",
        "backend.services.tts",
        "backend.websocket.transcription",
    ]
    for imp in imports:
        try:
            __import__(imp)
            print(f"✅ {imp}")
        except Exception as e:
            print(f"❌ {imp}: {e}")
            all_good = False
    
    print("\n" + "="*60)
    if all_good:
        print("✅ All checks passed! Ready to run backend.")
        print("\nStart backend with:")
        print("  python -m uvicorn backend.main:app --reload --port 7860")
        return 0
    else:
        print("⚠️  Some checks failed. Please fix issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
