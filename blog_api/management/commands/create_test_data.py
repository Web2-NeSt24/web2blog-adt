from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog_api.models import Profile, Post, Hashtag, Comment, Like, Bookmark, Image
import random
import os
import base64
from django.conf import settings

#to delete the database's content use `python manage.py flush --noinput`
class Command(BaseCommand):
    help = 'Create test data for the blog API with dev-themed content'

    def add_arguments(self, parser):
        parser.add_argument(
            '--posts',
            type=int,
            default=9,
            help='Number of posts to create (default: 8)'
        )
        parser.add_argument(
            '--users',
            type=int,
            default=5,
            help='Number of users to create (default: 5)'
        )

    def convert_markdown_to_html(self, content):
        """Convert basic markdown to HTML for display"""
        import re
        
        # Convert newlines to line breaks
        content = content.replace('\n', '<br>')
        
        # Convert ## headers to h3
        content = re.sub(r'<br>## (.*?)<br>', r'<br><h3>\1</h3><br>', content)
        
        # Convert code blocks ```lang to <pre><code>
        content = re.sub(r'```(\w+)<br>(.*?)<br>```', r'<pre><code class="language-\1">\2</code></pre>', content, flags=re.DOTALL)
        content = re.sub(r'```<br>(.*?)<br>```', r'<pre><code>\1</code></pre>', content, flags=re.DOTALL)
        
        # Convert inline code `code` to <code>
        content = re.sub(r'`([^`]+)`', r'<code>\1</code>', content)
        
        # Convert **bold** to <strong>
        content = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', content)
        
        # Convert - list items
        content = re.sub(r'<br>- (.*?)<br>', r'<br><li>\1</li><br>', content)
        
        # Clean up multiple <br> tags
        content = re.sub(r'(<br>){3,}', '<br><br>', content)
        
        return content.strip()

    def handle(self, *args, **options):
        self.stdout.write('Creating test data...')
        
        # Load test images
        test_images_dir = os.path.join(settings.BASE_DIR, 'test_images')
        image_mapping = {}
        
        if os.path.exists(test_images_dir):
            self.stdout.write('Loading test images...')
            for filename in os.listdir(test_images_dir):
                if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    filepath = os.path.join(test_images_dir, filename)
                    try:
                        with open(filepath, 'rb') as f:
                            image_data = f.read()
                        
                        # Determine image type
                        if filename.lower().endswith('.png'):
                            img_type = 'PNG'
                        elif filename.lower().endswith(('.jpg', '.jpeg')):
                            img_type = 'JPEG'
                        else:
                            continue
                        
                        # Create image object
                        image_obj = Image.objects.create(
                            type=img_type,
                            data=image_data
                        )
                        
                        # Map filename to image object for later use
                        image_mapping[filename] = image_obj
                        self.stdout.write(f'Loaded image: {filename} (ID: {image_obj.id})')
                        
                    except Exception as e:
                        self.stdout.write(f'Failed to load {filename}: {e}')
        else:
            self.stdout.write('Test images directory not found, proceeding without images...')
        
        # Create users and profiles
        users_data = [
            {
                'username': 'alex_dev',
                'email': 'alex@devblog.com',
                'first_name': 'Alex',
                'last_name': 'Johnson',
                'biography': 'Full-stack developer passionate about React and Django. Love clean code and TDD.'
            },
            {
                'username': 'sarah_codes',
                'email': 'sarah@devblog.com',
                'first_name': 'Sarah',
                'last_name': 'Chen',
                'biography': 'Frontend developer specializing in TypeScript and modern CSS. UI/UX enthusiast.'
            },
            {
                'username': 'mike_backend',
                'email': 'mike@devblog.com',
                'first_name': 'Mike',
                'last_name': 'Rodriguez',
                'biography': 'Backend engineer with expertise in Python, Django, and cloud architecture.'
            },
            {
                'username': 'jenny_mobile',
                'email': 'jenny@devblog.com',
                'first_name': 'Jenny',
                'last_name': 'Kim',
                'biography': 'Mobile developer working with React Native and Flutter. Open source contributor.'
            },
            {
                'username': 'david_devops',
                'email': 'david@devblog.com',
                'first_name': 'David',
                'last_name': 'Wilson',
                'biography': 'DevOps engineer passionate about automation, Docker, and Kubernetes.'
            }
        ]

        created_users = []
        for i, user_data in enumerate(users_data[:options['users']]):
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name']
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'Created user: {user.username}')
            
            # Update profile biography
            profile = user.profile
            profile.biography = user_data['biography']
            profile.save()
            
            created_users.append(user)

        # Create hashtags
        hashtags_list = [
            'javascript', 'python', 'django', 'react', 'typescript', 'css',
            'html', 'nodejs', 'api', 'database', 'sql', 'mongodb', 'postgresql',
            'docker', 'kubernetes', 'aws', 'devops', 'git', 'github', 'vscode',
            'testing', 'tdd', 'agile', 'scrum', 'opensource', 'webdev', 'frontend',
            'backend', 'fullstack', 'mobile', 'reactnative', 'flutter', 'restapi',
            'graphql', 'microservices', 'cicd', 'automation', 'cloudcomputing'
        ]
        
        created_hashtags = []
        for tag_value in hashtags_list:
            hashtag, created = Hashtag.objects.get_or_create(value=tag_value)
            created_hashtags.append(hashtag)
        
        self.stdout.write(f'Created/verified {len(created_hashtags)} hashtags')

        # Create posts
        posts_data = [
            {
                'title': 'Building a REST API with Django and Django REST Framework',
                'content': '''In this post, I'll walk you through creating a robust REST API using Django and DRF.

## Setting up the project

First, let's create a new Django project and install the necessary dependencies:

```bash
pip install django djangorestframework
django-admin startproject myapi
cd myapi
python manage.py startapp api
```

## Creating Models

We'll start by defining our models in `models.py`:

```python
from django.db import models

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
```

## Serializers

Next, we'll create serializers to convert our model instances to JSON:

```python
from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'
```

This is just the beginning! In the next part, we'll cover viewsets and URL routing.''',
                'tags': ['django', 'python', 'restapi', 'backend', 'webdev'],
                'draft': False,
                'image_file': 'alex_dev_django.png',
                'author_username': 'alex_dev'
            },
            {
                'title': 'React Hooks: useState vs useReducer - When to Use Which?',
                'content': '''React Hooks revolutionized how we write React components. Two of the most important hooks for state management are useState and useReducer.

## useState - The Simple Choice

`useState` is perfect for simple state management:

```javascript
const [count, setCount] = useState(0);
const [name, setName] = useState('');
const [isVisible, setIsVisible] = useState(false);
```

## useReducer - For Complex State Logic

When your state logic becomes complex, `useReducer` shines:

```javascript
const initialState = { count: 0, name: '', items: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    case 'set_name':
      return { ...state, name: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

## When to Use Which?

- **useState**: Simple values, independent state updates
- **useReducer**: Complex state objects, related state updates, predictable state transitions

The key is understanding your state complexity!''',
                'tags': ['react', 'javascript', 'frontend', 'hooks'],
                'draft': False,
                'image_file': 'sarah_codes_react.png',
                'author_username': 'sarah_codes'
            },
            {
                'title': 'TypeScript Best Practices for Large-Scale Applications',
                'content': '''As your TypeScript application grows, following best practices becomes crucial for maintainability.

## 1. Strict Type Checking

Always enable strict mode in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

## 2. Use Interfaces for Object Shapes

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
```

## 3. Leverage Union Types

```typescript
type Status = 'loading' | 'success' | 'error';
type Theme = 'light' | 'dark' | 'auto';
```

## 4. Generic Functions

```typescript
function apiCall<T>(url: string): Promise<ApiResponse<T>> {
  return fetch(url).then(res => res.json());
}
```

These practices will make your codebase more robust and easier to maintain!''',
                'tags': ['typescript', 'javascript', 'frontend', 'webdev'],
                'draft': False,
                'image_file': 'david_devops_typescript.png',
                'author_username': 'david_devops'
            },
            {
                'title': 'Docker for Developers: A Practical Guide',
                'content': '''Docker has become essential for modern development workflows. Let's explore practical Docker usage.

## Basic Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Multi-stage Builds

For optimized production images:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

## Docker Compose for Development

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: password
```

Docker simplifies development environments and deployment!''',
                'tags': ['docker', 'devops', 'deployment', 'containers'],
                'draft': False,
                'image_file': 'alex_dev_docker.png',
                'author_username': 'alex_dev'
            },
            {
                'title': 'CSS Grid vs Flexbox: Choosing the Right Layout Method',
                'content': '''Both CSS Grid and Flexbox are powerful layout systems, but they excel in different scenarios.

## Flexbox - One-Dimensional Layouts

Perfect for navigation bars, button groups, and centering content:

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button-group {
  display: flex;
  gap: 1rem;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

## CSS Grid - Two-Dimensional Layouts

Ideal for page layouts and complex grid systems:

```css
.page-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main aside"
    "footer footer footer";
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 200px 1fr 200px;
  min-height: 100vh;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
```

## When to Use Which?

- **Flexbox**: Navigation, button groups, centering, one-dimensional layouts
- **CSS Grid**: Page layouts, card grids, complex two-dimensional layouts

Often, you'll use both together in the same project!''',
                'tags': ['css', 'frontend', 'webdev', 'layout'],
                'draft': False,
                'image_file': 'jenny_mobile_grid_vs_flexbox.png',
                'author_username': 'jenny_mobile'
            },
            {
                'title': 'Building Scalable Node.js APIs with Express and MongoDB',
                'content': '''Learn how to build production-ready APIs with Node.js, Express, and MongoDB.

## Project Structure

```
src/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
└── app.js
```

## Setting up Express

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

## Mongoose Models

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

## Authentication Middleware

```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
```

This setup provides a solid foundation for scalable APIs!''',
                'tags': ['nodejs', 'express', 'mongodb', 'backend', 'api'],
                'draft': False,
                'image_file': 'sarah_codes_nodejs.png',
                'author_username': 'sarah_codes'
            },
            {
                'title': 'Modern CSS Techniques: Custom Properties and Container Queries',
                'content': '''CSS continues to evolve with powerful new features. Let's explore custom properties and container queries.

## CSS Custom Properties (Variables)

```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --border-radius: 0.5rem;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius);
  color: white;
  border: none;
}

.button:hover {
  background: color-mix(in srgb, var(--primary-color) 80%, black);
}
```

## Dynamic Theming

```css
[data-theme="dark"] {
  --primary-color: #60a5fa;
  --bg-color: #1f2937;
  --text-color: #f9fafb;
}

[data-theme="light"] {
  --primary-color: #3b82f6;
  --bg-color: #ffffff;
  --text-color: #111827;
}

body {
  background: var(--bg-color);
  color: var(--text-color);
  transition: background 0.3s, color 0.3s;
}
```

## Container Queries

```css
.card-container {
  container-type: inline-size;
}

.card {
  padding: 1rem;
  background: white;
  border-radius: var(--border-radius);
}

@container (min-width: 300px) {
  .card {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
  }
}

@container (min-width: 500px) {
  .card {
    padding: 2rem;
  }
}
```

These modern CSS features give us unprecedented control over styling and responsiveness!''',
                'tags': ['css', 'frontend', 'webdev', 'responsive'],
                'draft': False,
                'image_file': 'mike_backend_css.png',
                'author_username': 'mike_backend'
            },
            {
                'title': 'Testing React Components with Jest and Testing Library',
                'content': '''Comprehensive testing is crucial for reliable React applications. Let's explore best practices.

## Basic Component Test

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Custom Hooks

```javascript
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

describe('useCounter', () => {
  test('should increment counter', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Testing with Context

```javascript
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from './ThemeContext';
import ThemedComponent from './ThemedComponent';

const renderWithTheme = (ui, theme = 'light') => {
  return render(
    <ThemeProvider initialTheme={theme}>
      {ui}
    </ThemeProvider>
  );
};

test('renders with dark theme', () => {
  renderWithTheme(<ThemedComponent />, 'dark');
  expect(screen.getByTestId('themed-div')).toHaveClass('dark-theme');
});
```

## Mocking API Calls

```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, name: 'John Doe' }]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Good tests give you confidence to refactor and add features!''',
                'tags': ['testing', 'react', 'jest', 'javascript', 'tdd'],
                'draft': False,
                'image_file': 'david_devops_testingreact.png',
                'author_username': 'david_devops'
            },
            {
                'title': 'GraphQL vs REST: Choosing the Right API Architecture',
                'content': '''GraphQL and REST are two popular API paradigms. Let’s compare their strengths and weaknesses.

## REST

REST is resource-oriented and leverages HTTP verbs:

- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT/PATCH**: Update resources
- **DELETE**: Remove resources

## GraphQL

GraphQL enables clients to specify exactly the data they need:

```graphql
query {
  user(id: 1) {
    id
    name
    posts {
      id
      title
    }
  }
}
```

## When to Use Which?

- **REST**: Simple CRUD services, straightforward caching, familiar tooling
- **GraphQL**: Complex data graphs, multiple clients with varying requirements, reducing over/under-fetching

Choose the approach that best fits your project’s needs.''',
                'tags': ['graphql', 'api', 'backend', 'webdev'],
                'draft': False,
                'author_username': 'mike_backend'
            }
        ]

        created_posts = []
        for i, post_data in enumerate(posts_data[:options['posts']]):
            # Assign specific author if specified, otherwise random
            if 'author_username' in post_data:
                author = next((u for u in created_users if u.username == post_data['author_username']), None)
                if not author:
                    author = random.choice(created_users)
            else:
                author = random.choice(created_users)
            
            # Get image if specified
            post_image = None
            if 'image_file' in post_data and post_data['image_file'] in image_mapping:
                post_image = image_mapping[post_data['image_file']]
            
            # Convert content to HTML
            html_content = self.convert_markdown_to_html(post_data['content'])
            
            # Create post
            post = Post.objects.create(
                profile=author.profile,
                title=post_data['title'],
                content=html_content,
                draft=post_data['draft'],
                image=post_image
            )
            
            # Add tags
            post_hashtags = []
            for tag_value in post_data['tags']:
                hashtag = next((h for h in created_hashtags if h.value == tag_value), None)
                if hashtag:
                    post_hashtags.append(hashtag)
            
            post.tags.set(post_hashtags)
            created_posts.append(post)
            
            image_info = f" with image {post_data.get('image_file', 'none')}" if post_image else ""
            self.stdout.write(f'Created post: "{post.title}" by {author.username}{image_info}')

        # Create some comments
        comment_templates = [
            "Great post! This really helped me understand {topic}.",
            "Thanks for sharing this. I've been struggling with {topic} lately.",
            "Excellent explanation of {topic}. Looking forward to more content like this.",
            "This is exactly what I needed for my current project. Thanks!",
            "Well written article. The code examples are very clear.",
            "I have a question about the {topic} part. Could you elaborate?",
            "This approach to {topic} is brilliant. I'll definitely try it.",
            "Nice tutorial! I've bookmarked this for future reference."
        ]

        comment_topics = ['Django', 'React', 'TypeScript', 'Docker', 'CSS', 'Node.js', 'testing', 'APIs']

        for post in created_posts[:6]:  # Add comments to first 6 posts
            num_comments = random.randint(1, 4)
            for _ in range(num_comments):
                commenter = random.choice(created_users)
                topic = random.choice(comment_topics)
                content = random.choice(comment_templates).format(topic=topic)
                
                Comment.objects.create(
                    post=post,
                    author_profile=commenter.profile,
                    content=content
                )

        # Create some likes
        for post in created_posts:
            num_likes = random.randint(0, len(created_users))
            likers = random.sample(created_users, num_likes)
            for liker in likers:
                Like.objects.get_or_create(
                    post=post,
                    liker_profile=liker.profile
                )

        # Create some bookmarks
        bookmark_titles = [
            "Django REST API Tutorial",
            "React Hooks Reference",
            "TypeScript Best Practices",
            "Docker Guide",
            "CSS Layout Techniques",
            "Node.js API Development",
            "Testing Strategies",
            "Frontend Development Tips"
        ]

        for post in created_posts[:5]:  # Bookmark first 5 posts
            num_bookmarks = random.randint(1, 3)
            bookmarkers = random.sample(created_users, min(num_bookmarks, len(created_users)))
            for bookmarker in bookmarkers:
                Bookmark.objects.get_or_create(
                    post=post,
                    creator_profile=bookmarker.profile,
                    defaults={'title': random.choice(bookmark_titles)}
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created test data:\n'
                f'  - {len(created_users)} users\n'
                f'  - {len(image_mapping)} images\n'
                f'  - {len(created_hashtags)} hashtags\n'
                f'  - {len(created_posts)} posts\n'
                f'  - {Comment.objects.count()} comments\n'
                f'  - {Like.objects.count()} likes\n'
                f'  - {Bookmark.objects.count()} bookmarks'
            )
        )
