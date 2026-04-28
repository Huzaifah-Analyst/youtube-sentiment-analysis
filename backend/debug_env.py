import sys
import os
import subprocess

print(f"Python Executable: {sys.executable}")
print(f"Python Path: {sys.path}")

try:
    import transformers
    print(f"Transformers Version: {transformers.__version__}")
    print("SUCCESS: transformers imported.")
except ImportError:
    print("FAILURE: transformers NOT found.")
    print("Searching for transformers location via pip...")
    try:
        pip_show = subprocess.check_output([sys.executable, "-m", "pip", "show", "transformers"]).decode()
        print(f"Pip says:\n{pip_show}")
    except Exception as e:
        print(f"Pip show failed: {e}")
