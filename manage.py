#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
        from django.conf import settings
        from django.test.utils import get_runner
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    print('INSTALLED_APPS:', settings.INSTALLED_APPS)
    print('Test discovery paths:', sys.path)

    test_runner = get_runner(settings)()
    test_suite = test_runner.build_suite([])
    print('Discovered test cases:', [test.__class__.__name__ for test in test_suite])

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
