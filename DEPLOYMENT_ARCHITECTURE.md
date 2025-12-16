# Deployment Architecture

## Overview

This document defines the production deployment architecture for the full-stack application.

## Architecture Components

### 1. Nginx (Reverse Proxy & Static File Server)

**Role:**
- Serves static frontend files (React build output)
- Acts as reverse proxy for API requests
- Handles SSL/TLS termination
- Routes requests to appropriate services

**Port:** 80 (HTTP) / 443 (HTTPS)

**Responsibilities:**
- Serve static files from `/var/www/frontend/dist` (or equivalent)
- Proxy `/api/*` requests to Node.js backend
- Proxy `/uploads/*`, `/brands/*`, `/hero/*` to Node.js backend (static file serving)
- Handle SPA routing (serve `index.html` for non-API routes)
- Compress responses (gzip)
- Set security headers
- Rate limiting (optional)

**Public Access:** Yes (exposed to internet)

### 2. Node.js Backend (API Server)

**Role:**
- Handles all API requests (`/api/*`)
- Serves uploaded static files (`/uploads/*`, `/brands/*`, `/hero/*`)
- Connects to PostgreSQL database
- Business logic and data processing

**Port:** 5000 (internal, not exposed publicly)

**Responsibilities:**
- Process API requests from Nginx
- Database operations (PostgreSQL)
- File upload handling
- Authentication/authorization
- Serve static uploads (images, files)

**Public Access:** No (only accessible via Nginx reverse proxy)

### 3. PostgreSQL Database

**Role:**
- Data persistence
- Application data storage

**Port:** 5432 (internal, not exposed publicly)

**Public Access:** No (only accessible from Node.js backend)

## Request Flow

### Frontend Request (Static File)
```
Client → Nginx (port 80/443) → /index.html → Client
```

### API Request
```
Client → Nginx (port 80/443) → /api/products → Node.js (port 5000) → PostgreSQL (port 5432)
                                                                    ↓
Client ← Nginx ← JSON Response ← Node.js ← Query Results
```

### Static File Request (Upload)
```
Client → Nginx (port 80/443) → /uploads/image.png → Node.js (port 5000) → File System
                                                                          ↓
Client ← Nginx ← File Content ← Node.js
```

## Port Configuration

| Service | Port | Access | Purpose |
|---------|------|--------|---------|
| Nginx | 80, 443 | Public | HTTP/HTTPS entry point |
| Node.js | 5000 | Internal | API server (backend) |
| PostgreSQL | 5432 | Internal | Database |

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
DB_USER=your_db_user
DB_HOST=127.0.0.1
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
CORS_ORIGIN=https://yourdomain.com
```

### Frontend (Build-time)
```
VITE_API_BASE_URL=https://yourdomain.com/api
```

## File Structure (Production Server)

```
/var/www/
├── frontend/
│   └── dist/              # React build output (served by Nginx)
├── backend/
│   ├── server.js          # Node.js entry point
│   ├── .env               # Backend environment variables
│   ├── uploads/           # User-uploaded files
│   ├── public/
│   │   ├── brands/        # Brand images
│   │   └── hero/          # Hero section images
│   └── node_modules/
└── nginx/
    └── sites-available/
        └── yourdomain.com  # Nginx configuration
```

## Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend static files
    root /var/www/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # API requests → Node.js backend
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static file uploads → Node.js backend
    location ~ ^/(uploads|brands|hero) {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Frontend SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## Process Management

### Node.js Backend
- Use PM2 or systemd to manage Node.js process
- Auto-restart on crash
- Log management
- Process monitoring

### Example PM2 Configuration
```json
{
  "name": "backend-api",
  "script": "server.js",
  "cwd": "/var/www/backend",
  "instances": 2,
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Security Considerations

1. **Firewall:** Only ports 80/443 should be publicly accessible
2. **Database:** PostgreSQL should only accept connections from localhost (127.0.0.1)
3. **Node.js:** Backend should listen on 0.0.0.0 but only be accessible via Nginx
4. **CORS:** Backend CORS_ORIGIN should match frontend domain
5. **SSL/TLS:** Use Let's Encrypt or similar for HTTPS
6. **Environment Variables:** Never commit .env files to version control

## Deployment Checklist

- [ ] Nginx installed and configured
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] Frontend built and deployed to `/var/www/frontend/dist`
- [ ] Backend deployed to `/var/www/backend`
- [ ] PostgreSQL database created and configured
- [ ] Backend .env file configured with production values
- [ ] Frontend built with `VITE_API_BASE_URL` set
- [ ] Node.js process managed by PM2/systemd
- [ ] Firewall configured (only 80/443 open)
- [ ] Health check endpoint tested: `https://yourdomain.com/api/health`
- [ ] CORS_ORIGIN matches frontend domain

