#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import logging
from datetime import datetime


def setup_logging():
    """Setup logging to server.log file"""
    log_file = os.path.join(os.path.dirname(__file__), 'server.log')
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)


def main():
    """Run administrative tasks."""
    logger = setup_logging()
    logger.info(f"Django management command started: {' '.join(sys.argv)}")
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
        from django.conf import settings
        from django.test.utils import get_runner
        logger.info("Django imports successful")
    except ImportError as exc:
        error_msg = (
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        )
        logger.error(f"Import error: {error_msg}")
        logger.error(f"Exception details: {exc}")
        raise ImportError(error_msg) from exc

    # Only print test info and run test discovery if 'test' is in the command
    if len(sys.argv) > 1 and sys.argv[1] == 'test':
        logger.info("Running in test mode")
        print('INSTALLED_APPS:', settings.INSTALLED_APPS)
        print('Test discovery paths:', sys.path)
        test_runner = get_runner(settings)()
        test_suite = test_runner.build_suite([])
        print('Discovered test cases:', [test.__class__.__name__ for test in test_suite])
    elif len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        logger.info("Starting Django development server")
    
    try:
        # Set up exception handling for Django's internal threads
        import threading
        original_excepthook = threading.excepthook
        
        def log_thread_exception(args):
            logger.error(f"Exception in thread {args.thread.name}: {args.exc_type.__name__}: {args.exc_value}")
            logger.error(f"Full traceback: {args.exc_traceback}")
            original_excepthook(args)
        
        threading.excepthook = log_thread_exception
        
        execute_from_command_line(sys.argv)
        logger.info("Django command completed successfully")
    except Exception as exc:
        logger.error(f"Django command failed: {exc}")
        logger.error(f"Exception type: {type(exc).__name__}")
        import traceback
        logger.error(f"Full traceback: {traceback.format_exc()}")
        raise


if __name__ == '__main__':
    main()
