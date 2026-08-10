import sys
import os

# Add the backend directory (parent of the tests folder) to PYTHONPATH
backend_root = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

if backend_root not in sys.path:
    sys.path.insert(0, backend_root)
