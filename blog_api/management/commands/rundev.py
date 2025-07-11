import os
from django.core.management.base import BaseCommand
from django.core.management import execute_from_command_line


class Command(BaseCommand):
    help = 'Run the development server with development settings'

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
            default='127.0.0.1',
            help='Host to run the server on (default: 127.0.0.1)',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Starting development server...'))
        
        # Set development environment
        os.environ['DJANGO_ENV'] = 'development'
        
        # Show current environment
        self.stdout.write(f'Environment: {self.style.WARNING("DEVELOPMENT")}')
        self.stdout.write(f'Debug: {self.style.WARNING("ON")}')
        self.stdout.write(f'CORS: {self.style.WARNING("ALLOW ALL ORIGINS")}')
        self.stdout.write(f'Swagger: {self.style.WARNING("ENABLED")}')
        self.stdout.write('')
        
        # Start server
        host = options['host']
        port = options['port']
        
        self.stdout.write(f'Starting server at http://{host}:{port}/')
        self.stdout.write(f'Swagger UI: http://{host}:{port}/api/swagger-ui/')
        self.stdout.write('')
        
        execute_from_command_line(['manage.py', 'runserver', f'{host}:{port}'])
