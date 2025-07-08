import os
from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    help = 'Start the Django development server (defaults to development mode)'

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            '--env',
            choices=['development', 'production'],
            default='development',
            help='Environment to run in (default: development)',
        )

    def handle(self, *args, **options):
        # Set environment based on --env flag
        env = options.get('env', 'development')
        os.environ['DJANGO_ENV'] = env
        
        # Show environment info
        if env == 'development':
            self.stdout.write(self.style.SUCCESS('🚀 Development Mode'))
            self.stdout.write(f'   Debug: {self.style.WARNING("ON")}')
            self.stdout.write(f'   CORS: {self.style.WARNING("Allow all origins")}')
            self.stdout.write(f'   Swagger: {self.style.WARNING("Full access")}')
        else:
            # Production mode
            if not os.environ.get('SECRET_KEY'):
                self.stdout.write(
                    self.style.ERROR('❌ ERROR: SECRET_KEY environment variable is required in production!')
                )
                self.stdout.write('Generate one with: python manage.py runprod --generate-secret')
                return
            
            self.stdout.write(self.style.SUCCESS('🔒 Production Mode'))
            self.stdout.write(f'   Debug: {self.style.SUCCESS("OFF")}')
            self.stdout.write(f'   CORS: {self.style.SUCCESS("Restricted")}')
            self.stdout.write(f'   Swagger: {self.style.SUCCESS("Admin only")}')
            self.stdout.write(self.style.WARNING('   ⚠️  Use gunicorn/uWSGI for real production deployment'))
        
        # Add swagger URL for development
        if env == 'development':
            addrport = options.get('addrport', '127.0.0.1:8000')
            if ':' in addrport:
                host, port = addrport.rsplit(':', 1)
            else:
                host, port = '127.0.0.1', addrport
            
            self.stdout.write(f'   Swagger UI: http://{host}:{port}/api/swagger-ui/')
        
        self.stdout.write('')
        
        # Call the original runserver command
        super().handle(*args, **options)
