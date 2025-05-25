from rest_framework.authentication import SessionAuthentication

# DRF returns 403 Forbidden instead of 401 Unauthorized
# if no WWW-Authenticate header is set
class SessionAuthentication401(SessionAuthentication):
    def authenticate_header(self, request):
        return "---"
