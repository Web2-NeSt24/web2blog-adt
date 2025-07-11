import os
import secrets
from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line


class Command(BaseCommand):
    help = 'Run the server with production settings'

    def add_arguments(self, parser):
        parser.add_argument(
            '--port',
            type=int,
            default=8000,
            help='Port to run the server on (default: 8000)',
        )
        parser.add_argument(
            '--host',
            type=str,
            default='0.0.0.0',
            help='Host to run the server on (default: 0.0.0.0)',
        )
        parser.add_argument(
            '--generate-secret',
            action='store_true',
            help='Generate a new secret key',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🔒 Starting production server...'))
        
        # Generate secret key if requested
        if options['generate_secret']:
            secret_key = secrets.token_urlsafe(50)
            self.stdout.write(f'Generated SECRET_KEY: {secret_key}')
            self.stdout.write('Set this as environment variable: export SECRET_KEY="{}"'.format(secret_key))
            return
        
        # Set production environment
        os.environ['DJANGO_ENV'] = 'production'
        
        # Check if SECRET_KEY is set
        if not os.environ.get('SECRET_KEY'):
            self.stdout.write(
                self.style.ERROR('ERROR: SECRET_KEY environment variable is required in production!')
            )
            self.stdout.write('Generate one with: python manage.py runprod --generate-secret')
            return
        
        # Show current environment
        self.stdout.write(f'Environment: {self.style.SUCCESS("PRODUCTION")}')
        self.stdout.write(f'Debug: {self.style.SUCCESS("OFF")}')
        self.stdout.write(f'CORS: {self.style.SUCCESS("RESTRICTED")}')
        self.stdout.write(f'Swagger: {self.style.SUCCESS("ADMIN ONLY")}')
        self.stdout.write('')
        
        # Production warnings
        self.stdout.write(self.style.WARNING('⚠️  PRODUCTION MODE WARNINGS:'))
        self.stdout.write('- Swagger UI is restricted to admin users only')
        self.stdout.write('- CORS is restricted - configure CORS_ALLOWED_ORIGINS in settings.py')
        self.stdout.write('- Use a production WSGI server (gunicorn, uWSGI) for real deployment')
        self.stdout.write('')
        
        # Start server
        host = options['host']
        port = options['port']
        
        self.stdout.write(f'Starting server at http://{host}:{port}/')
        self.stdout.write('')
        
        execute_from_command_line(['manage.py', 'runserver', f'{host}:{port}'])
