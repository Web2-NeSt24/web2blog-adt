# RESTful API To-Do List

## 🟥 High Priority
- [ ] Replace POST-based filtering in `posts.py` with GET + query params  
  - author_id, tags, keywords as `?author=…&tags=a,b&keywords=c`
- [ ] Split like/unlike toggle into idempotent endpoints  
  - PUT `/posts/{id}/like/` → create like  
  - DELETE `/posts/{id}/like/` → remove like
- [ ] Add pagination to every list endpoint  
  - Use `PageNumberPagination` (`page_size=20`, `page_size_query_param`)
- [ ] Complete full CRUD for drafts  
  - GET /drafts/{id}/, PUT /drafts/{id}/, DELETE /drafts/{id}/
- [ ] Introduce API versioning prefix (`/v1/…`)

## 🟧 Medium Priority
- [ ] Standardise on class-based views (replace remaining function views in `auth.py`)
- [ ] Replace base64 image uploads with multipart file uploads
- [ ] Implement rate limiting (`AnonRateThrottle`, `UserRateThrottle`)
- [ ] Use plural nouns consistently in routes (`/comments/`, not `/comment/`)
- [ ] Provide logout endpoint (`DELETE /sessions/{id}/` or `/auth/v1/logout/`)
- [ ] Add generic ViewSets where suitable (e.g. `PostViewSet`)
- [ ] Implement soft-delete if records must be recoverable

## 🟨 Low Priority
- [ ] Add conditional requests (ETag / If-None-Match on GET)
- [ ] Add standard error envelope  
  ```json
  { "type": "validation_error", "title": "Invalid input", … }
  ```
- [ ] Add caching headers (`Cache-Control: public, max-age=60`) for anon GETs
- [ ] Pass `X-Request-ID` through stack for correlation IDs
- [ ] Integrate OpenTelemetry / DRF logging middleware for tracing
- [ ] Background jobs for heavy tasks (image resizing, emails)
- [ ] Tighten rate limits on sensitive endpoints (password reset, login)

## ✅ Things Already Done Well
- Comprehensive Swagger docs (`@extend_schema`)
- Correct HTTP status codes (200, 201, 204, 4xx)
- Auth & authorization via DRF permission classes
- Consistent error handling with meaningful messages