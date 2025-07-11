#!/usr/bin/env python
"""
Web2Blog Server Launcher

Simple wrapper to start Django server in different environments.
"""

import os
import sys
import subprocess
import secrets


def generate_secret_key():
    """Generate a secure secret key"""
    return secrets.token_urlsafe(50)


def set_environment(env_name):
    """Set environment variables for the given environment"""
    os.environ['DJANGO_ENV'] = env_name
    
    if env_name == 'production' and not os.environ.get('SECRET_KEY'):
        print("❌ ERROR: SECRET_KEY environment variable is required in production!")
        print("Generate one with: python server.py --generate-secret")
        sys.exit(1)


def print_environment_info(env_name):
    """Print current environment configuration"""
    if env_name == 'development':
        print("🚀 Development Mode")
        print("   Debug: ON")
        print("   CORS: Allow all origins")
        print("   Swagger: Full access")
    else:
        print("🔒 Production Mode")
        print("   Debug: OFF")
        print("   CORS: Restricted")
        print("   Swagger: Admin only")
        print("   ⚠️  Use gunicorn/uWSGI for real production deployment")


def main():
    """Main function"""
    if len(sys.argv) > 1:
        if sys.argv[1] == '--generate-secret':
            secret = generate_secret_key()
            print(f"Generated SECRET_KEY: {secret}")
            print('Set as environment variable:')
            print(f'export SECRET_KEY="{secret}"')
            return
        
        if sys.argv[1] == 'prod' or sys.argv[1] == 'production':
            env_name = 'production'
            host = '0.0.0.0'
            port = '8000'
        elif sys.argv[1] == 'dev' or sys.argv[1] == 'development':
            env_name = 'development'
            host = '127.0.0.1'
            port = '8000'
        else:
            print("Usage: python server.py [dev|prod|--generate-secret] [port]")
            print("Examples:")
            print("  python server.py dev          # Development mode")
            print("  python server.py prod         # Production mode")
            print("  python server.py dev 3000     # Development on port 3000")
            print("  python server.py --generate-secret  # Generate secret key")
            return
        
        # Optional port argument
        if len(sys.argv) > 2:
            port = sys.argv[2]
    else:
        # Default to development
        env_name = 'development'
        host = '127.0.0.1'
        port = '8000'
    
    # Set environment
    set_environment(env_name)
    
    # Print info
    print_environment_info(env_name)
    print(f"Starting server at http://{host}:{port}/")
    
    if env_name == 'development':
        print(f"Swagger UI: http://{host}:{port}/api/swagger-ui/")
    
    print()
    
    # Start Django server
    try:
        subprocess.run([
            sys.executable, 'manage.py', 'runserver', f'{host}:{port}'
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
