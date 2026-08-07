#place to keep reusable helper functions for the backend
import os
from datetime import datetime


def generate_upload_path(folder, filename):
    """
    Generates a safe file path for uploaded files.
    """

    return os.path.join(folder, filename)


def format_timestamp(timestamp):
    """
    Converts a datetime object into ISO format.
    """

    if timestamp is None:
        return None

    return timestamp.isoformat()