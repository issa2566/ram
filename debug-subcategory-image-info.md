# 🐛 DEBUG DOCUMENT - Subcategory Image Upload Feature

**Generated:** December 8, 2025  
**Project:** Auto Display Replicator - Subcategory Images  
**Purpose:** Complete technical reference for debugging subcategory image upload issues

---

## 📋 TABLE OF CONTENTS

1. [Backend API](#1-backend-api)
2. [Frontend Components](#2-frontend-components)
3. [Configuration](#3-configuration)
4. [Expected Behavior](#4-expected-behavior)
5. [Common Issues & Solutions](#5-common-issues--solutions)

---

## 1. BACKEND API

### 1.1 Route File Location
```
📁 backend/routes/subcategories.js
```

### 1.2 Upload Storage Path
```javascript
const uploadsDir = path.join(__dirname, '../uploads/subcategories');
// Full path: C:\Users\PC\Desktop\newprej\backend\uploads\subcategories
```

### 1.3 Database Table Schema

```sql
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

**Key Points:**
- `name` is UNIQUE (prevents duplicate subcategories)
- `image_url` stores relative path: `/uploads/subcategories/filename.jpg`
- Uses UPSERT on conflict (updates existing record)

### 1.4 API Endpoints

#### **POST /api/subcategories/upload-image** (Admin Only)

**Request:**
```javascript
Content-Type: multipart/form-data

Fields:
- image: File (JPG/JPEG/PNG only, max 5MB)
- subcategory_name: String (e.g., "Kit embrayage complet")
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "subcategory_name": "Kit embrayage complet",
    "image_url": "/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "subcategory_name is required"
}
```

**Backend Logic:**
1. Validates `subcategory_name` exists
2. Validates file exists and is image type
3. Generates safe filename: `{sanitized_name}-{timestamp}-{random}.{ext}`
4. Checks for existing image in database
5. Saves file to `/backend/uploads/subcategories/`
6. Updates database with new image URL
7. Deletes old image file if exists
8. Returns new image URL

#### **GET /api/subcategories**

**Request:**
```javascript
GET /api/subcategories
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Kit embrayage complet",
      "image_url": "/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg",
      "created_at": "2025-12-08T10:30:00.000Z",
      "updated_at": "2025-12-08T10:30:00.000Z"
    }
  ]
}
```

#### **DELETE /api/subcategories/:name/image** (Admin Only)

**Request:**
```javascript
DELETE /api/subcategories/Kit%20embrayage%20complet/image
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### 1.5 Multer Configuration

```javascript
// File Storage
const storage = multer.diskStorage({
  destination: 'backend/uploads/subcategories',
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = req.body.subcategory_name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

// File Filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
  }
};

// Limits
limits: {
  fileSize: 5 * 1024 * 1024 // 5MB max
}
```

### 1.6 Express Static File Serving

**In `backend/server.js`:**

```javascript
// Line 52: Serve all uploads
app.use('/uploads', express.static(uploadsDir));

// Resolves to:
// http://localhost:3000/uploads/subcategories/filename.jpg
```

**Full URL Example:**
```
Database stores: /uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg
Server exposes:  http://localhost:3000/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg
```

### 1.7 Database Queries

**Upsert Image:**
```sql
INSERT INTO subcategories (name, image_url, updated_at)
VALUES ($1, $2, NOW())
ON CONFLICT (name) 
DO UPDATE SET image_url = $2, updated_at = NOW()
RETURNING *
```

**Get Existing Image:**
```sql
SELECT image_url FROM subcategories WHERE name = $1
```

**Delete Image:**
```sql
UPDATE subcategories SET image_url = NULL, updated_at = NOW() WHERE name = $1
```

### 1.8 Old Image Cleanup Logic

```javascript
// After successful upload, delete old image
if (oldImageUrl && oldImageUrl !== imageUrl && oldImageUrl.startsWith('/uploads/subcategories/')) {
  const oldFilename = oldImageUrl.replace('/uploads/subcategories/', '');
  const oldFilepath = path.join(uploadsDir, oldFilename);
  
  if (fs.existsSync(oldFilepath)) {
    fs.unlinkSync(oldFilepath);
    console.log(`🗑️ Deleted old image: ${oldFilename}`);
  }
}
```

---

## 2. FRONTEND COMPONENTS

### 2.1 Main Component

**File:** `auto-display-replicator-main/src/components/FamillesPiecesSectionCompact.tsx`

**Total Lines:** 703

### 2.2 State Management

```typescript
// Admin status
const [isAdmin, setIsAdmin] = useState(false);

// Image upload state
const [uploadingSubcategory, setUploadingSubcategory] = useState<string | null>(null);
const [subcategoryImages, setSubcategoryImages] = useState<Record<string, string>>({});
const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
```

**Admin Detection Logic:**
```typescript
useEffect(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    const role = user?.role?.toLowerCase();
    const adminFromRole = role === 'admin' || role === 'administrator';
    const adminFromFlag = user?.is_admin === true || user?.isAdmin === true;
    setIsAdmin(adminFromRole || adminFromFlag);
  }
  
  // Direct flags
  if (localStorage.getItem('is_admin') === 'true' || 
      localStorage.getItem('isAdmin') === 'true' ||
      localStorage.getItem('force_admin') === '1') {
    setIsAdmin(true);
  }
}, []);
```

### 2.3 Image Upload Function

```typescript
const handleImageUpload = async (subcategoryName: string, file: File) => {
  if (!file) return;

  setUploadingSubcategory(subcategoryName);

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('subcategory_name', subcategoryName);

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/subcategories/upload-image`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    
    if (result.success && result.data?.image_url) {
      // Update the image in state
      setSubcategoryImages(prev => ({
        ...prev,
        [subcategoryName]: result.data.image_url
      }));
      console.log('✅ Image uploaded successfully');
    }
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    alert('Erreur lors du téléchargement de l\'image');
  } finally {
    setUploadingSubcategory(null);
  }
};
```

### 2.4 Image URL Resolution

```typescript
const getSubcategoryImageUrl = (subcategoryName: string): string => {
  const imageUrl = subcategoryImages[subcategoryName];
  if (imageUrl) {
    // If it's a full URL, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // If it starts with /uploads/, prepend the API base URL
    if (imageUrl.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000';
      return `${baseUrl}${imageUrl}`;
    }
    return imageUrl;
  }
  return '/images/placeholder.png';
};
```

**URL Resolution Flow:**
1. Check if image exists in state (`subcategoryImages[name]`)
2. If starts with `http` → return as-is (full URL)
3. If starts with `/uploads/` → prepend backend base URL
4. Otherwise → return placeholder `/images/placeholder.png`

### 2.5 File Input Trigger

```typescript
const triggerFileInput = (subcategoryName: string, context: 'mobile' | 'desktop' = 'mobile') => {
  const key = context === 'desktop' ? `desktop-${subcategoryName}` : subcategoryName;
  fileInputRefs.current[key]?.click();
};
```

**Ref Structure:**
- Mobile: `fileInputRefs.current["Kit embrayage complet"]`
- Desktop: `fileInputRefs.current["desktop-Kit embrayage complet"]`

### 2.6 Subcategory Item JSX (Mobile View)

```tsx
<li className="flex items-center justify-between gap-2 text-gray-700 
               text-sm leading-tight py-1.5 pl-2 rounded">
  {/* Left: Thumbnail + Name */}
  <div className="flex items-center gap-3 flex-1 min-w-0">
    {/* Subcategory Image Thumbnail */}
    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <img 
        src={getSubcategoryImageUrl(item)}
        alt={item}
        className="w-full h-full object-cover rounded-md"
        onError={(e) => { /* Fallback to icon */ }}
      />
    </div>
    
    <span className="truncate flex-1 text-sm">{item}</span>
  </div>

  {/* Right: Action Buttons */}
  <div className="flex items-center gap-1 flex-shrink-0">
    {/* Navigate/View Button */}
    <button onClick={() => navigate(`/acha/${encodeURIComponent(item)}`)}>
      <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
    </button>
    
    {/* Admin Controls */}
    {isAdmin && (
      <>
        {/* Edit Link */}
        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); ... }}>
          <Link2 className="w-3.5 h-3.5 text-orange-500" />
        </button>
        
        {/* Edit Image */}
        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); triggerFileInput(item); }}>
          {uploadingSubcategory === item ? (
            <Spinner />
          ) : (
            <Camera className="w-3.5 h-3.5 text-blue-500" />
          )}
        </button>
        
        {/* Delete */}
        <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); ... }}>
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
        
        {/* Hidden File Input */}
        <input
          ref={(el) => (fileInputRefs.current[item] = el)}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          className="hidden"
          onChange={(e) => handleImageUpload(item, e.target.files[0])}
        />
      </>
    )}
  </div>
</li>
```

### 2.7 Subcategory Item JSX (Desktop View)

```tsx
<div className="group flex items-center justify-between gap-2 p-3 rounded-lg
               bg-gray-50 hover:bg-orange-50 
               border border-transparent hover:border-orange-200
               text-gray-700 hover:text-orange-600 
               transition-all duration-200">
  {/* Left: Thumbnail + Name */}
  <div className="flex items-center gap-3 flex-1 min-w-0">
    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <img src={getSubcategoryImageUrl(item)} className="w-full h-full object-cover rounded-md" />
    </div>
    <span className="font-medium text-sm truncate flex-1">{item}</span>
  </div>

  {/* Right: Action Buttons (appear on hover) */}
  <div className="flex items-center gap-1 flex-shrink-0 
                  opacity-0 group-hover:opacity-100 transition-opacity">
    {/* Navigate Button */}
    <button onClick={() => navigate(...)}>
      <ChevronRight className="w-4 h-4 text-gray-600" />
    </button>
    
    {isAdmin && (
      <>
        <button onClick={...}><Link2 className="w-4 h-4 text-orange-500" /></button>
        <button onClick={...}><Camera className="w-4 h-4 text-blue-500" /></button>
        <button onClick={...}><Trash2 className="w-4 h-4 text-red-500" /></button>
        <input ref={(el) => (fileInputRefs.current[`desktop-${item}`] = el)} ... />
      </>
    )}
  </div>
</div>
```

### 2.8 Subcategory List (Hardcoded Data)

**Sample Subcategories:**
```typescript
{
  name: "Embrayage",
  subCategories: [
    "Kit embrayage complet",
    "Disque d'embrayage",
    "Mécanisme d'embrayage",
    "Butée hydraulique",
    "Volant moteur",
    "Cable d'embrayage"
  ]
}
```

**⚠️ IMPORTANT:**  
Subcategories are **hardcoded in the frontend** component, NOT loaded from database.  
The database only stores **image URLs** mapped to these names.

---

## 3. CONFIGURATION

### 3.1 Backend Environment Variables

**File:** `backend/config/app.js`

```javascript
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  
  uploads: {
    maxFileSize: 1024 * 1024, // 1MB (Note: Route uses 5MB)
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    directory: 'uploads'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
```

### 3.2 Frontend Environment Variables

**Expected:**
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

**Default Fallback in Code:**
```typescript
import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
```

### 3.3 Vite Configuration

**File:** `auto-display-replicator-main/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
```

**Frontend runs on:** `http://localhost:8080`  
**Backend runs on:** `http://localhost:3000`

### 3.4 Static File Serving Configuration

```javascript
// In backend/server.js (line 52)
app.use('/uploads', express.static(uploadsDir));

// Mapping:
Physical Path: C:\Users\PC\Desktop\newprej\backend\uploads\subcategories\file.jpg
URL Path:      http://localhost:3000/uploads/subcategories/file.jpg
```

---

## 4. EXPECTED BEHAVIOR

### 4.1 User Flow (Admin)

**Step 1: Enable Admin Mode**
```javascript
localStorage.setItem('force_admin', '1');
// Refresh page
```

**Step 2: Navigate to Pieces-Dispo Page**
- Click on any family (e.g., "Embrayage")
- Subcategory list expands

**Step 3: Upload Image**
1. Hover over subcategory row (desktop) or tap (mobile)
2. Click the blue camera icon
3. File picker opens
4. Select JPG/PNG image (max 5MB)
5. Upload starts automatically

**Step 4: Backend Processing**
1. Backend receives `multipart/form-data`
2. Validates file type and size
3. Generates unique filename
4. Saves to `/backend/uploads/subcategories/`
5. Checks database for existing image
6. Updates database with new URL
7. Deletes old image file (if exists)
8. Returns JSON response

**Step 5: Frontend Update**
1. Receives response with new `image_url`
2. Updates `subcategoryImages` state
3. React re-renders with new image
4. Thumbnail displays uploaded image
5. No page reload needed

### 4.2 User Flow (Regular User)

- Sees subcategory thumbnails
- No camera icon visible
- Can click subcategory name to navigate
- Images are read-only

### 4.3 Image URL Resolution Process

```
Backend returns:    /uploads/subcategories/file.jpg
Frontend resolves:  http://localhost:3000/uploads/subcategories/file.jpg
Browser requests:   http://localhost:3000/uploads/subcategories/file.jpg
Express serves:     C:\Users\PC\Desktop\newprej\backend\uploads\subcategories\file.jpg
```

### 4.4 Placeholder Fallback

**When no image exists:**
1. `getSubcategoryImageUrl()` returns `/images/placeholder.png`
2. `<img>` tries to load `/images/placeholder.png`
3. If placeholder fails → `onError` handler creates SVG icon
4. SVG icon injected into container

---

## 5. COMMON ISSUES & SOLUTIONS

### 5.1 Issue: Camera Icon Triggers Navigation

**Symptom:** Clicking camera icon navigates to subcategory page instead of opening file picker

**Cause:** Row had `onClick` that bubbled up to parent

**Solution:**
```typescript
// Removed onClick from <li> wrapper
// Added explicit buttons with:
onClick={(e) => {
  e.stopPropagation();  // Stop bubbling
  e.preventDefault();   // Prevent default action
  triggerFileInput(item);
}}
```

### 5.2 Issue: Images Not Displaying

**Possible Causes:**

1. **Incorrect URL Resolution**
   - Check: `getSubcategoryImageUrl()` function
   - Verify: `VITE_API_BASE_URL` is set correctly
   - Expected: Full URL like `http://localhost:3000/uploads/subcategories/file.jpg`

2. **Static Files Not Served**
   - Check: `app.use('/uploads', express.static(uploadsDir))` in server.js
   - Verify: Files exist in `/backend/uploads/subcategories/`
   - Test: Visit `http://localhost:3000/uploads/subcategories/file.jpg` directly

3. **CORS Issues**
   - Check: Backend CORS configuration
   - Current: `origin: '*'` (allows all)
   - Verify: Browser console for CORS errors

4. **Wrong File Path in Database**
   - Check: Database contains `/uploads/subcategories/file.jpg`
   - NOT: `C:\Users\PC\...` (absolute path)
   - NOT: `file.jpg` (filename only)

### 5.3 Issue: Upload Returns 400 Error

**Error: "subcategory_name is required"**
- Check: FormData includes `subcategory_name` field
- Current code: `formData.append('subcategory_name', subcategoryName);` ✅

**Error: "No image file uploaded"**
- Check: FormData field name matches route
- Route expects: `upload.single('image')`
- Frontend sends: `formData.append('image', file);` ✅

**Error: "Only JPG, JPEG, and PNG files are allowed!"**
- Check: File mimetype
- Allowed: `image/jpeg`, `image/jpg`, `image/png`
- Input accept: `image/jpeg,image/jpg,image/png` ✅

### 5.4 Issue: Old Images Not Deleted

**Check:**
1. Database query returns previous `image_url`
2. `oldImageUrl.startsWith('/uploads/subcategories/')` is true
3. File path is correctly constructed
4. File exists: `fs.existsSync(oldFilepath)`
5. Permissions allow deletion

### 5.5 Issue: Images Disappear After Refresh

**Symptom:** Images show after upload but disappear on page reload

**Cause:** `subcategoryImages` state is not persisted

**Current Behavior:** Images are stored in component state only

**⚠️ MISSING FEATURE:** No `useEffect` to load images from database on mount

**Solution Needed:**
```typescript
useEffect(() => {
  const loadImages = async () => {
    const response = await fetch(`${API_BASE_URL}/subcategories`);
    const result = await response.json();
    if (result.success) {
      const imageMap = {};
      result.data.forEach(item => {
        if (item.image_url) {
          imageMap[item.name] = item.image_url;
        }
      });
      setSubcategoryImages(imageMap);
    }
  };
  loadImages();
}, []);
```

---

## 6. API REQUEST/RESPONSE EXAMPLES

### 6.1 Successful Upload

**Request:**
```http
POST http://localhost:3000/api/subcategories/upload-image
Content-Type: multipart/form-data

------WebKitFormBoundary
Content-Disposition: form-data; name="subcategory_name"

Kit embrayage complet
------WebKitFormBoundary
Content-Disposition: form-data; name="image"; filename="clutch.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary--
```

**Backend Console Logs:**
```
📤 POST /api/subcategories/upload-image
📤 Upload file check: clutch.jpg mimetype: image/jpeg
✅ File accepted: clutch.jpg
📦 Uploading image for subcategory: Kit embrayage complet
📄 File: clutch.jpg → kit_embrayage_complet-1733654321-123456789.jpg
✅ Image uploaded and database updated
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "subcategory_name": "Kit embrayage complet",
    "image_url": "/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg"
  }
}
```

**Frontend Console Logs:**
```
✅ Image uploaded successfully
```

### 6.2 Failed Upload - Wrong File Type

**Request:** Upload `.pdf` file

**Backend Console:**
```
📤 Upload file check: document.pdf mimetype: application/pdf
❌ File rejected: document.pdf
❌ Upload error: Only JPG, JPEG, and PNG files are allowed!
```

**Response:**
```json
{
  "success": false,
  "error": "Only JPG, JPEG, and PNG files are allowed!"
}
```

**Frontend:**
```
❌ Error uploading image: Error: Upload failed
Alert: "Erreur lors du téléchargement de l'image"
```

---

## 7. CHECKLIST FOR DEBUGGING

### Backend

- [ ] Backend server running on port 3000
- [ ] `/uploads` route registered in server.js (line 52)
- [ ] `/api/subcategories` route registered (line 165)
- [ ] `subcategories` table exists in PostgreSQL
- [ ] Directory exists: `backend/uploads/subcategories/`
- [ ] Directory has write permissions
- [ ] Database connection working

### Frontend

- [ ] `VITE_API_BASE_URL` set to `http://localhost:3000/api`
- [ ] Admin mode enabled: `localStorage.getItem('force_admin') === '1'`
- [ ] Camera icon visible next to other admin buttons
- [ ] File input has correct `accept` attribute
- [ ] `handleImageUpload()` function called on file selection
- [ ] State updates after successful upload

### Network

- [ ] CORS allows requests from `http://localhost:8080`
- [ ] Browser can access `http://localhost:3000/uploads/subcategories/test.jpg`
- [ ] No 404 errors on image URLs
- [ ] FormData contains both `image` and `subcategory_name`

### Database

- [ ] Table `subcategories` created successfully
- [ ] Query: `SELECT * FROM subcategories;` returns data
- [ ] `image_url` column contains `/uploads/subcategories/...` paths
- [ ] No duplicate entries (UNIQUE constraint on `name`)

---

## 8. TESTING COMMANDS

### Backend

```bash
# Check if directory exists
ls backend/uploads/subcategories/

# Check database
psql -U postgres -d your_database
SELECT * FROM subcategories;

# Check server logs
cd backend
npm run dev
# Look for: "📁 Created /uploads/subcategories directory"
# Look for: "✅ subcategories table ready"

# Test static file serving
curl http://localhost:3000/uploads/test.txt
# Should return file or 404 (not "Cannot GET")
```

### Frontend

```javascript
// Enable admin in browser console
localStorage.setItem('force_admin', '1');
location.reload();

// Check admin status
const isAdminEnabled = localStorage.getItem('force_admin') === '1';
console.log('Admin enabled:', isAdminEnabled);

// Check API base URL
console.log('API URL:', import.meta.env.VITE_API_BASE_URL);

// Test image URL resolution
const testUrl = '/uploads/subcategories/test.jpg';
const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '') || 'http://localhost:3000';
console.log('Resolved URL:', `${baseUrl}${testUrl}`);
```

### Network (Browser DevTools)

```
1. Open Network tab
2. Click camera icon
3. Check request:
   - Method: POST
   - URL: http://localhost:3000/api/subcategories/upload-image
   - Type: multipart/form-data
   - Form Data: image (file), subcategory_name (text)
4. Check response:
   - Status: 200
   - Body: { success: true, data: { image_url: "..." } }
```

---

## 9. FILE STRUCTURE

```
newprej/
├── backend/
│   ├── routes/
│   │   └── subcategories.js        ← API routes (POST upload, GET all, DELETE)
│   ├── uploads/
│   │   └── subcategories/          ← Uploaded images stored here
│   │       └── kit_embrayage_complet-1733654321-123456789.jpg
│   ├── config/
│   │   └── app.js                  ← Environment config
│   └── server.js                   ← Express app (static serving, routes)
│
└── auto-display-replicator-main/
    └── src/
        ├── components/
        │   └── FamillesPiecesSectionCompact.tsx  ← Main component
        ├── api/
        │   └── database.ts                       ← API functions (not used yet)
        └── vite.config.ts                        ← Vite config
```

---

## 10. CURRENT LIMITATIONS

### ⚠️ Known Issues

1. **No Image Loading on Mount**
   - Images are NOT fetched from database when page loads
   - Only uploaded images in current session are displayed
   - **Fix needed:** Add `useEffect` to fetch images on component mount

2. **State Not Persisted**
   - `subcategoryImages` state resets on page refresh
   - Images exist in database but UI doesn't load them
   - **Fix needed:** Implement `GET /api/subcategories` call on mount

3. **No Error Toast**
   - Upload errors shown as `alert()` (basic browser popup)
   - Should use toast notification system
   - **Enhancement:** Integrate with existing toast library

4. **No Success Feedback**
   - Only console log after successful upload
   - User might not know upload succeeded
   - **Enhancement:** Add success toast notification

5. **No Loading Indicator on Row**
   - Spinner only shows inside camera button
   - Row doesn't indicate upload in progress
   - **Enhancement:** Add loading overlay or disable row during upload

---

## 11. RECOMMENDED NEXT STEPS

### Priority 1: Fix Image Loading on Mount

Add this to `FamillesPiecesSectionCompact.tsx`:

```typescript
useEffect(() => {
  const loadSubcategoryImages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/subcategories`);
      const result = await response.json();
      
      if (result.success && result.data) {
        const imageMap: Record<string, string> = {};
        result.data.forEach((item: any) => {
          if (item.image_url) {
            imageMap[item.name] = item.image_url;
          }
        });
        setSubcategoryImages(imageMap);
        console.log('📦 Loaded', Object.keys(imageMap).length, 'subcategory images');
      }
    } catch (error) {
      console.error('Error loading subcategory images:', error);
    }
  };
  
  loadSubcategoryImages();
}, []);
```

### Priority 2: Add Toast Notifications

Replace `alert()` with toast:

```typescript
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

// Success
toast({
  title: "Image téléchargée",
  description: "L'image a été enregistrée avec succès",
  variant: "default"
});

// Error
toast({
  title: "Erreur",
  description: "Échec du téléchargement de l'image",
  variant: "destructive"
});
```

### Priority 3: Add Loading State to Row

```typescript
className={`... ${uploadingSubcategory === item ? 'opacity-50 pointer-events-none' : ''}`}
```

---

## 12. VERIFICATION QUERIES

### Check Database Content

```sql
-- View all subcategories with images
SELECT id, name, image_url, updated_at 
FROM subcategories 
ORDER BY updated_at DESC;

-- Count how many have images
SELECT 
  COUNT(*) as total,
  COUNT(image_url) as with_images,
  COUNT(*) - COUNT(image_url) as without_images
FROM subcategories;

-- Find specific subcategory
SELECT * FROM subcategories WHERE name = 'Kit embrayage complet';
```

### Check File System

```bash
# Windows PowerShell
Get-ChildItem "C:\Users\PC\Desktop\newprej\backend\uploads\subcategories"

# List files with details
Get-ChildItem "C:\Users\PC\Desktop\newprej\backend\uploads\subcategories" | Format-Table Name, Length, LastWriteTime

# Count files
(Get-ChildItem "C:\Users\PC\Desktop\newprej\backend\uploads\subcategories").Count
```

### Test Image Accessibility

```bash
# From browser
http://localhost:3000/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg

# From command line (if backend running)
curl http://localhost:3000/uploads/subcategories/kit_embrayage_complet-1733654321-123456789.jpg --output test.jpg
```

---

## 13. CONTACT POINTS & INTEGRATION

### Frontend → Backend

**Endpoint:** `POST /api/subcategories/upload-image`

**Integration Point:**
```typescript
// File: FamillesPiecesSectionCompact.tsx, Line 72
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/subcategories/upload-image`,
  { method: 'POST', body: formData }
);
```

### Backend → Database

**Integration Point:**
```javascript
// File: routes/subcategories.js, Line 143-149
const result = await pool.query(`
  INSERT INTO subcategories (name, image_url, updated_at)
  VALUES ($1, $2, NOW())
  ON CONFLICT (name) 
  DO UPDATE SET image_url = $2, updated_at = NOW()
  RETURNING *
`, [subcategory_name, imageUrl]);
```

### Backend → File System

**Integration Point:**
```javascript
// File: routes/subcategories.js, Line 9-13
const uploadsDir = path.join(__dirname, '../uploads/subcategories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
```

---

## 14. SUMMARY

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend Routes** | ✅ Working | 3 endpoints implemented |
| **Database Table** | ✅ Created | Auto-initialized on server start |
| **File Upload** | ✅ Working | Multer configured, 5MB limit |
| **Static Serving** | ✅ Working | `/uploads` exposed correctly |
| **Frontend UI** | ✅ Working | Camera icon, file picker, upload |
| **Admin Check** | ✅ Working | Multiple detection methods |
| **Image Display** | ⚠️ Partial | Works for current session only |
| **Persistence** | ❌ Missing | Images not loaded from DB on mount |
| **Notifications** | ⚠️ Basic | Uses alert() instead of toast |

---

**🔍 CRITICAL MISSING PIECE:**

The frontend does NOT fetch existing images from the database when the page loads.

**Add this to fix:**
```typescript
useEffect(() => {
  fetch(`${API_BASE_URL}/subcategories`)
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        const map = {};
        result.data.forEach(item => {
          if (item.image_url) map[item.name] = item.image_url;
        });
        setSubcategoryImages(map);
      }
    });
}, []);
```

---

**END OF DEBUG DOCUMENT**

