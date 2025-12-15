# SYSTEM ARCHITECTURE REPORT
## Complete Technical Documentation

**Document Version:** 1.0  
**Date:** 2025-01-XX  
**Purpose:** Comprehensive system understanding fornew developers  
**Project Type:** Full-stack e-commerce automotive parts platform

---

## 1. PROJECT OVERVIEW

### What This Project Is
A full-stack web application for selling automotive parts and accessories. The platform allows customers to browse products, search for parts by car brand/model, place orders, and enables administrators to manage inventory, content, and orders through a dedicated dashboard.

### Business Purpose
- **Customer-facing:** Browse catalog, search products, view product details, place orders
- **Admin-facing:** Manage products, inventory, promotions, hero content, brand images, orders, and content sections
- **Content Management:** Dynamic content editing (hero section, promotions, families of parts) without code changes

### Target Users

#### Normal Users (Customers)
- Browse car brands and models
- Search for specific parts
- View product details with images, prices, references
- Place orders (Acha pages) by filling contact information
- Navigate through category hierarchies (Familles → Subcategories → Products)

#### Admin Users
- Manage product inventory (quantity, prices, images)
- Edit homepage content (hero section, promotions, brand images)
- Manage orders (view, delete)
- Add/edit product families and subcategories
- Manage search options (car brands, models, years)
- Edit section content (Familles des Pièces)

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + TypeScript + Vite + React Router + TanStack Query  │
│  Location: auto-display-replicator-main/                    │
│                                                              │
│  - Pages (routes)                                            │
│  - Components (UI)                                           │
│  - API client (database.ts)                                  │
│  - Contexts (SearchContext)                                  │
│  - State: React Query + localStorage                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       │ (JSON)
┌──────────────────────▼──────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express + PostgreSQL                             │
│  Location: backend/                                          │
│                                                              │
│  - Routes (API endpoints)                                    │
│  - Controllers (business logic)                              │
│  - Models (database operations)                              │
│  - Middlewares (auth, error handling)                        │
│  - Database initialization (initTables.js)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       │ (pg/pool)
┌──────────────────────▼──────────────────────────────────────┐
│                      DATABASE                                │
│  PostgreSQL                                                  │
│                                                              │
│  Tables: users, products, acha_products, orders,            │
│          hero_content, brand_images, section_content, etc.   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- Vite (build tool)
- React Router v7 (routing)
- TanStack Query (data fetching/caching)
- Tailwind CSS (styling)
- shadcn/ui (UI components)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- PostgreSQL (database)
- pg/pool (database connection pool)
- Multer (file uploads)
- bcrypt (password hashing)
- dotenv (environment variables)

**Dev Tools:**
- TypeScript (type safety)
- ESLint (code quality)
- Git (version control)

---

## 2. FRONTEND STRUCTURE

### 2.1 Application Entry Point & Routing

#### File: `auto-display-replicator-main/src/App.tsx`

**Role:** Main application wrapper and routing configuration

**Responsibilities:**
- Initialize React Query client (data fetching/caching)
- Set up BrowserRouter (React Router)
- Configure routes for all pages
- Provide SearchContext to all pages
- Handle global error boundaries (unhandled promise rejections)

**Key Features:**
- React Query configured with retry logic and cache invalidation
- Cross-tab synchronization via BroadcastChannel for categories/subcategories updates
- Global toast notifications (Toaster, Sonner)
- WhatsApp button displayed on all pages

**Routes Defined:**
```
/                    → Index (Home page)
/login               → Login
/catalogue           → Catalogue (car brands)
/catalogue2/:marque  → Catalogue2 (models for a brand)
/pieces-dispo/:modelId → PiecesDispo (parts for a model)
/acha/:subId         → Acha (product detail & order)
/acha2               → Acha2 (generic product management)
/huile               → HuilePage (oil/additives page)
/search              → SearchResults
/admin-dashboard     → AdminDashboard
/admin/products      → AdminProducts
/category/:categoryName → CategoryPage
/brand/:brandName/parts → BrandPartsPage
/cart, /panier       → Cart
/filtres             → FiltresPage
/filters-catalogue   → FiltersCatalogue
/admin-filters       → AdminFiltersPage
/filter/:filterId    → FilterPage
/stock-management    → StockManagement
*                    → NotFound
```

**Data Management:**
- React Query: Server state (products, categories, orders)
- localStorage: User authentication, breadcrumbs, selected filters
- Context: SearchContext (global search state)

---

### 2.2 Core Pages

#### 2.2.1 Home Page

**File:** `auto-display-replicator-main/src/pages/Index.tsx`

**Role:** Main landing page

**Components Used:**
1. `Header` - Navigation bar with search
2. `BrandsSection` - Car brands display
3. `HeroSection` - Hero banner with images
4. `FamilleSection` - Product families grid
5. `PromotionsSection` - Promotional products carousel
6. `Footer` - Site footer

**Data Flow:**
- Each section fetches its own data independently via React Query or useEffect
- No shared state between sections
- Admin detection via localStorage (`user` object)

**API Calls:**
- `BrandsSection` → `GET /api/brands` (brand images)
- `HeroSection` → `GET /api/hero` (hero content)
- `FamilleSection` → `GET /api/sectionContent?sectionType=familles` (families data)
- `PromotionsSection` → `GET /api/dashboard-products` (promotional products)

**User Flow:**
1. Page loads → All sections fetch data in parallel
2. Admin can edit sections via edit buttons (appear on hover if admin)
3. Changes saved to database → UI updates via React Query invalidation

---

#### 2.2.2 Header Component

**File:** `auto-display-replicator-main/src/components/Header.tsx`

**Role:** Site-wide navigation and search

**Features:**
- Search bar with autocomplete suggestions
- Mobile menu (hamburger)
- User menu (login/logout/profile)
- Admin controls (if logged in as admin)
- Cart icon
- Breadcrumb navigation (stored in localStorage)

**Search Functionality:**
- Uses `SearchContext` for global search state
- Debounced search (300ms delay)
- Live suggestions while typing
- Navigates to `/search` on submit

**Admin Features:**
- Edit filter names (in mobile menu)
- Add custom filters
- Manage filter links

**State Management:**
- User state from localStorage
- Search state from SearchContext
- Menu state (local React state)

---

#### 2.2.3 Catalogue Flow Pages

##### Catalogue Page
**File:** `auto-display-replicator-main/src/pages/Catalogue.tsx`

**Role:** Display car brands for selection

**Data Source:** `GET /api/carBrands` or `/api/brands`

**Flow:**
1. User selects a brand → Navigate to `/catalogue2/:marque`
2. Brand saved to localStorage for breadcrumb

---

##### Catalogue2 Page
**File:** `auto-display-replicator-main/src/pages/catalogue2/index.tsx`

**Role:** Display vehicle models for a selected brand

**Route:** `/catalogue2/:marque`

**Data Source:** `GET /api/vehicleModels?marque={marque}`

**Features:**
- Model cards with images
- Admin can add/delete models
- Click model → Navigate to `/pieces-dispo/:modelId`

**State:**
- Models fetched via `useCallback` (React Query or fetch)
- Loading and error states

---

##### PiecesDispo Page
**File:** `auto-display-replicator-main/src/pages/PiecesDispo.tsx`

**Role:** Display parts available for a specific vehicle model

**Route:** `/pieces-dispo/:modelId`

**Data Source:** `GET /api/models/:modelId/parts`

**Features:**
- Parts grid/list view
- Compact families section (FamillesPiecesSectionCompact)
- Admin can add/delete parts
- Each part links to Acha page

**Custom Hook:** `useModelParts(modelId)` - encapsulates data fetching and mutations

---

#### 2.2.4 Product & Order Pages

##### Acha Page (Product Detail & Order)
**File:** `auto-display-replicator-main/src/pages/Acha.tsx`

**Role:** Display product details and handle order submission

**Route:** `/acha/:subId`

**Key Features:**
1. **Product Display:**
   - Product images (carousel)
   - Product name, price, references
   - Quantity selector
   - Promotion price (if applicable)

2. **Order Modal:**
   - Customer form: nom, prenom, telephone, wilaya, delegation, quantite
   - Validation before submission
   - Submits to `POST /api/orders`

3. **Data Flow:**
   ```
   Page Load → GET /api/acha-products/sub/:subId
             → Get or create product (backend creates if not exists)
             → Display product data
   
   Order Submit → Validate form
                → POST /api/orders (with product data + customer data)
                → Show success toast
                → Close modal
   ```

4. **Admin Features:**
   - Edit product quantity
   - Edit product references
   - Edit product price
   - Upload product images
   - Delete product

**API Endpoints Used:**
- `GET /api/acha-products/sub/:subId` - Get or create product
- `PUT /api/acha-products/:id` - Update product (admin)
- `DELETE /api/acha-products/:id` - Delete product (admin)
- `POST /api/orders` - Create order
- `POST /api/upload/image` - Upload product images

**State Management:**
- Product data: React state (fetched on mount)
- Order form: React state
- Admin mode: localStorage (`user.role === 'admin'`)

---

##### Acha2 Page
**File:** `auto-display-replicator-main/src/pages/acha2.tsx`

**Role:** Generic product management page (alternative to Acha)

**Route:** `/acha2?name={productName}`

**Features:**
- Similar to Acha but uses query parameter for product name
- Full CRUD operations for products
- Order modal (same as Acha)

**Note:** Appears to be a legacy or alternative implementation

---

##### Huile Page
**File:** `auto-display-replicator-main/src/pages/huile.tsx`

**Role:** Display oil/additives products

**Route:** `/huile`

**Data Source:** Products filtered by category or specific product type

**Features:**
- Product grid
- Admin can edit product images
- Click product → Navigate to Acha page

---

#### 2.2.5 Search System

##### Search Context
**File:** `auto-display-replicator-main/src/contexts/SearchContext.tsx`

**Role:** Global search state management

**Features:**
- Maintains search query, results, suggestions
- Debounced search execution
- AbortController for canceling previous searches
- Search statistics (time, count)

**API Integration:**
- `searchProducts(query)` - Frontend search (client-side filtering)
- `getBrandSuggestions()` - Brand autocomplete
- `getCategorySuggestions()` - Category autocomplete

**Search Algorithm:**
- Loads all products from `GET /api/products`
- Performs client-side filtering:
  - Exact match (name)
  - Partial match (name, description)
  - Fuzzy match (Levenshtein distance)
- Returns sorted results (exact > partial > fuzzy)

---

##### Search Results Page
**File:** `auto-display-replicator-main/src/pages/SearchResults.tsx`

**Role:** Display search results

**Route:** `/search?search={query}` or `/search?query={query}`

**Features:**
- Results grid/list
- Match type badges (exact, partial, fuzzy)
- Filter results by type
- Click result → Navigate to Acha page

**Data Source:** SearchContext (no direct API call)

---

#### 2.2.6 Admin Pages

##### Admin Dashboard
**File:** `auto-display-replicator-main/src/pages/AdminDashboard.tsx`

**Role:** Central admin control panel

**Route:** `/admin-dashboard`

**Sections (Menu-based):**
1. **Commandes** - Orders management
   - Fetches: `GET /api/orders` (admin only)
   - Displays: Orders table with customer info, product info, date
   - Actions: Delete order

2. **Other sections** (if implemented):
   - Products management
   - Users management
   - Content management

**Admin Protection:**
- Checks `user?.role === 'admin'` or `user?.isAdmin === true`
- Redirects if not admin

**API Endpoints:**
- `GET /api/orders` - Fetch all orders (protected by `requireAdmin` middleware)
- `DELETE /api/orders/:id` - Delete order (protected)

---

##### Admin Products Page
**File:** `auto-display-replicator-main/src/pages/admin/AdminProducts.tsx`

**Role:** Manage products inventory

**Route:** `/admin/products`

**Features:**
- List all products
- Add/edit/delete products
- Bulk operations

---

#### 2.2.7 Category & Filter Pages

##### Category Page
**File:** `auto-display-replicator-main/src/pages/CategoryPage.tsx`

**Route:** `/category/:categoryName`

**Role:** Display products in a category

**Data Source:** Products filtered by category

---

##### Filter Pages
**Files:**
- `FiltresPage.tsx` - Display filter options
- `FiltersCatalogue.tsx` - Filter-based product listing
- `AdminFiltersPage.tsx` - Manage filters (admin)
- `FilterPage.tsx` - Single filter detail

**Purpose:** Filter-based navigation (e.g., "Filtre à huile", "Filtre à air")

---

#### 2.2.8 Authentication

##### Login Page
**File:** `auto-display-replicator-main/src/pages/Login.tsx`

**Role:** User authentication (login/register)

**Route:** `/login`

**Features:**
- Login form (email, password)
- Register form (name, email, password, phone, address)
- Toggle between login/register modes

**API Endpoints:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

**Flow:**
1. User submits form → POST to API
2. Backend validates → Returns user data with role
3. Frontend saves to localStorage: `localStorage.setItem('user', JSON.stringify(userData))`
4. Dispatch `userLogin` event → Other components update
5. Navigate to home page

**Admin Detection:**
- Backend returns `role: 'admin'` or `isAdmin: true`
- Frontend checks `user.role === 'admin'` or `user.isAdmin === true`

---

### 2.3 Key Components

#### HeroSection
**File:** `auto-display-replicator-main/src/components/HeroSection.tsx`

**Data:** `GET /api/hero`

**Admin Features:**
- Edit title, subtitle, button text/link
- Upload/manage hero images (3 images, carousel)
- Changes saved to `hero_content` table

---

#### BrandsSection
**File:** `auto-display-replicator-main/src/components/BrandsSection.tsx`

**Data:** `GET /api/brands` (brand_images table)

**Features:**
- Display brand logos/images
- Admin can upload/edit brand images

---

#### FamilleSection
**File:** `auto-display-replicator-main/src/components/home/FamilleSection.tsx`

**Data:** `GET /api/sectionContent?sectionType=familles`

**Features:**
- Grid of product family cards
- Each family has subcategories
- Click family → Show subcategories → Navigate to Acha2 page
- Admin can add/edit/delete families and subcategories

**Mobile Version:** `MobileFamilleAccordion` (accordion-style in mobile menu)

---

#### PromotionsSection
**File:** `auto-display-replicator-main/src/components/PromotionsSection.tsx`

**Data:** `GET /api/dashboard-products` (promotional products)

**Features:**
- Carousel of promotional products
- Admin can edit product images
- Click product → Navigate to product detail

**API:** `PATCH /api/dashboard-products/:id` - Update promotion image

---

### 2.4 API Client Layer

#### File: `auto-display-replicator-main/src/api/database.ts`

**Role:** Centralized API client for all backend communication

**Structure:**
- Base URL: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'`
- All functions are async and return Promises
- Error handling with try/catch
- Console logging for debugging

**Main API Functions:**

**Products:**
- `getProducts()` - Fetch all products
- `getProductById(id)` - Get single product
- `createProduct(data)` - Create product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `searchProducts(query)` - Client-side search (loads all, filters locally)

**Acha Products:**
- `getAchaProductBySubId(subId)` - Get or create acha product
- `updateAchaProduct(id, data)` - Update acha product
- `saveAcha2Product(data)` - Save acha2 product

**Orders:**
- `createOrder(orderData)` - Create order
- `getOrders()` - Get all orders (admin)
- `deleteOrder(id)` - Delete order (admin)

**Hero Content:**
- `getHeroContent()` - Get hero content
- `updateHeroContent(data)` - Update hero content

**Brands:**
- `getBrandImages()` - Get brand images
- `updateBrandImages(data)` - Update brand images

**Section Content:**
- `getSectionContent(sectionType)` - Get section content
- `updateSectionContent(sectionType, data)` - Update section content

**Subcategories:**
- `getSubcategories()` - Get all subcategories
- `getSubcategoriesByFamily(familyName)` - Get subcategories for family
- `createSubcategory(data)` - Create subcategory

**Upload:**
- `uploadImage(file)` - Upload image file

**Search:**
- `getBrandSuggestions()` - Get brand suggestions
- `getCategorySuggestions()` - Get category suggestions

**Vehicle Models:**
- `getVehicleModels(marque)` - Get models for brand
- `createVehicleModel(data)` - Create model
- `deleteVehicleModel(id)` - Delete model

**Model Parts:**
- `getModelParts(modelId)` - Get parts for model
- `createModelPart(modelId, data)` - Create part
- `deleteModelPart(partId)` - Delete part

---

### 2.5 State Management

#### React Query (Server State)
- Used for: Products, categories, hero content, brands, orders
- Benefits: Automatic caching, refetching, error handling
- Configuration: See `App.tsx` (retry logic, stale time)

#### localStorage (Client State)
- User authentication: `localStorage.getItem('user')`
- Breadcrumbs: `selectedBrand`, `selectedModel`, `breadcrumb_*`
- Search filters: `search_*`

#### React Context
- `SearchContext` - Global search state and functions

#### Local Component State
- Form inputs, modals, UI state (useState hooks)

---

## 3. BACKEND STRUCTURE

### 3.1 Server Entry Point

#### File: `backend/server.js`

**Role:** Express application setup and route registration

**Key Responsibilities:**
1. Initialize Express app
2. Configure middleware (CORS, body parser, file uploads)
3. Register all API routes
4. Serve static files (uploads, hero images)
5. Initialize database tables on startup
6. Run database migrations
7. Start HTTP server

**Middleware Stack:**
```javascript
1. CORS (cross-origin requests)
2. express.json() (parse JSON, 50MB limit)
3. express.urlencoded() (parse form data, 50MB limit)
4. Static file serving (/uploads, /public/hero)
5. API routes
6. Error handler (last)
```

**Routes Registered:**
```
/api/auth              → Authentication (login, register)
/api/users             → User management
/api/products          → Products CRUD
/api/acha-products     → Acha products CRUD
/api/orders            → Orders (create, get all, delete)
/api/hero              → Hero content
/api/brands            → Brand images
/api/subcategories     → Subcategories management
/api/sectionContent    → Section content (familles, etc.)
/api/searchOptions     → Search options
/api/carBrands         → Car brands
/api/vehicles          → Vehicles
/api/vehicleModels     → Vehicle models
/api/models            → Model parts
/api/parts             → Parts
/api/acha2             → Acha2 products
/api/modeles           → Modeles
/api/upload            → Image upload
/api                   → Dashboard products
```

**Database Initialization:**
- Calls `initializeTables(pool)` on startup
- Creates all tables if they don't exist
- Runs migrations for existing tables

**File Upload Configuration:**
- Upload directory: `backend/uploads/`
- Max file size: 50MB (via express-fileupload or multer)
- Supported formats: JPG, JPEG, PNG

---

### 3.2 Folder Structure

```
backend/
├── config/
│   ├── app.js           # App configuration (port, CORS)
│   └── database.js      # PostgreSQL connection pool
├── controllers/         # Business logic (one per domain)
│   ├── authController.js
│   ├── orderController.js
│   ├── achaProductController.js
│   ├── heroController.js
│   ├── sectionContentController.js
│   └── ...
├── models/              # Database operations (one per table)
│   ├── User.js
│   ├── Order.js
│   ├── AchaProduct.js
│   ├── HeroContent.js
│   └── ...
├── routes/              # API route definitions
│   ├── auth.js
│   ├── orders.js
│   ├── achaProducts.js
│   ├── hero.js
│   └── ...
├── middlewares/         # Express middlewares
│   ├── asyncHandler.js  # Wrap async route handlers
│   ├── requireAdmin.js  # Admin authorization
│   └── errorHandler.js  # Global error handler
├── db/
│   └── initTables.js    # Database schema initialization
├── migrations/          # Database migration scripts
├── uploads/             # Uploaded files directory
└── server.js            # Main entry point
```

---

### 3.3 Route → Controller → Model Pattern

**Standard Flow:**
```
HTTP Request → Route (routes/*.js)
            → Middleware (auth, validation)
            → Controller (controllers/*.js) - business logic
            → Model (models/*.js) - database queries
            → Response
```

**Example: Create Order**
```
POST /api/orders
  → routes/orders.js (router.post('/', OrderController.create))
  → controllers/orderController.js (OrderController.create)
    → Validate request body
    → models/Order.js (Order.create(data))
      → SQL INSERT INTO orders ...
    → Return response
```

---

### 3.4 Key API Endpoints

#### Authentication
**Base:** `/api/auth`

- `POST /login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ success: true, data: { id, name, email, role, isAdmin } }`
  - Sets JWT or session (if implemented)

- `POST /register` - Register new user
  - Body: `{ name, email, password, phone, address }`
  - Returns: User data

---

#### Orders
**Base:** `/api/orders`

- `POST /` - Create order (public)
  - Body: `{ product_id, product_name, product_image, product_price, product_references, quantity, customer_nom, customer_prenom, customer_phone, customer_wilaya, customer_delegation }`
  - Returns: Created order

- `GET /` - Get all orders (admin only, requires `requireAdmin` middleware)
  - Returns: Array of orders

- `DELETE /:id` - Delete order (admin only)
  - Returns: Success message

**Controller:** `backend/controllers/orderController.js`  
**Model:** `backend/models/Order.js`

---

#### Acha Products
**Base:** `/api/acha-products`

- `GET /sub/:subId` - Get or create product by sub_id
  - If exists: Return product
  - If not: Create with default values, return new product
  - Used by Acha page on load

- `GET /:id` - Get product by ID
- `POST /` - Create product
- `PUT /:id` - Update product (quantity, references, price, images)
- `DELETE /:id` - Delete product
- `POST /:id/vente-hors-ligne` - Decrease quantity by 1 (offline sale)

**Controller:** `backend/controllers/achaProductController.js`  
**Model:** `backend/models/AchaProduct.js`

---

#### Hero Content
**Base:** `/api/hero`

- `GET /` - Get hero content
  - Returns: `{ title, subtitle, buttonText, buttonLink, images[] }`
  - Never returns 500 (fallback to default content)

- `POST /` - Update hero content (admin)
  - Body: `{ title, subtitle, buttonText, buttonLink, images[] }`

**Controller:** `backend/controllers/heroController.js`  
**Model:** `backend/models/HeroContent.js`  
**Table:** `hero_content`

---

#### Brands
**Base:** `/api/brands`

- `GET /` - Get brand images
- `POST /` - Update brand images (admin)

**Controller:** `backend/controllers/brandImagesController.js`  
**Model:** `backend/models/BrandImages.js`  
**Table:** `brand_images`

---

#### Section Content
**Base:** `/api/sectionContent`

- `GET /?sectionType={type}` - Get section content
  - Types: `familles`, etc.
- `POST /` - Create or update section content
  - Body: `{ sectionType, title, content (JSONB) }`

**Controller:** `backend/controllers/sectionContentController.js`  
**Table:** `section_content`

---

#### Subcategories
**Base:** `/api/subcategories`

- `GET /` - Get all subcategories
- `GET /family/:familyName` - Get subcategories for family
- `POST /` - Create subcategory (with image upload)
- `PUT /:id` - Update subcategory
- `DELETE /:id` - Delete subcategory

**Controller:** `backend/controllers/subcategoryController.js` (if exists)  
**Table:** `subcategories` (if exists, or stored in `section_content`)

---

#### Upload
**Base:** `/api/upload`

- `POST /image` - Upload image file
  - Body: FormData with `image` field
  - Returns: `{ success: true, url: '/uploads/filename.jpg' }`
  - Max size: 50MB

**Controller:** `backend/controllers/uploadController.js`

---

### 3.5 Authentication & Authorization

#### Admin Detection

**Backend:**
- Middleware: `backend/middlewares/requireAdmin.js`
- Checks: `req.user.is_admin === true` OR `req.user.role === 'admin'`
- Returns: 403 if not admin

**Frontend:**
- Reads from localStorage: `JSON.parse(localStorage.getItem('user'))`
- Checks: `user.role === 'admin'` OR `user.isAdmin === true`
- UI: Admin buttons/components only render if admin

**Current Implementation:**
- **Note:** Authentication middleware may not be fully implemented on all routes
- Some routes rely on frontend checks only (security risk)
- Admin detection is primarily client-side

---

### 3.6 Error Handling

**Global Error Handler:**
- `backend/middlewares/errorHandler.js`
- Catches unhandled errors in routes
- Returns 500 with error message

**Async Handler:**
- `backend/middlewares/asyncHandler.js`
- Wraps async route handlers
- Catches promise rejections → forwards to error handler

**Usage:**
```javascript
router.get('/', asyncHandler(Controller.method));
```

---

## 4. DATABASE STRUCTURE

### 4.1 Database Technology

- **Database:** PostgreSQL
- **Connection:** pg (Node.js driver) with connection pooling
- **Configuration:** `backend/config/database.js`
- **Initialization:** `backend/db/initTables.js` (runs on server startup)

**Environment Variables Required:**
```
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=database_name
DB_HOST=127.0.0.1
DB_PORT=5432
```

---

### 4.2 Main Tables

#### 4.2.1 `users`
**Purpose:** User accounts (customers and admins)

**Columns:**
- `id` SERIAL PRIMARY KEY
- `first_name` TEXT NOT NULL
- `last_name` TEXT NOT NULL
- `email` TEXT UNIQUE NOT NULL
- `password` TEXT NOT NULL (hashed with bcrypt)
- `phone` TEXT
- `role` TEXT DEFAULT 'user' ('admin' or 'user')
- `is_admin` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

**Used By:**
- Login/Register
- Admin authorization

---

#### 4.2.2 `products`
**Purpose:** General product catalog

**Columns:**
- `id` SERIAL PRIMARY KEY
- `name` TEXT NOT NULL
- `price` NUMERIC
- `original_price` NUMERIC
- `discount` TEXT
- `main_image` TEXT
- `all_images` TEXT[] (array of image URLs)
- `brand` TEXT
- `sku` TEXT
- `category` TEXT
- `loyalty_points` INTEGER DEFAULT 0
- `has_preview` BOOLEAN DEFAULT false
- `has_options` BOOLEAN DEFAULT false
- `description` TEXT
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

**Used By:**
- Search functionality
- Product listings
- Catalog browsing

---

#### 4.2.3 `acha_products`
**Purpose:** Specific products on Acha pages (product detail pages)

**Columns:**
- `id` SERIAL PRIMARY KEY
- `sub_id` TEXT UNIQUE NOT NULL (identifier from URL, e.g., "/acha/:subId")
- `name` TEXT
- `brand_name` TEXT
- `model_name` TEXT
- `description` TEXT
- `price` NUMERIC(12,3) DEFAULT 0.000
- `images` TEXT[] (array of image URLs)
- `quantity` INTEGER DEFAULT 0 (inventory)
- `product_references` TEXT[] DEFAULT '{}' (array of reference numbers)
- `promotion_percentage` NUMERIC DEFAULT 0
- `promotion_price` NUMERIC DEFAULT NULL
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

**Relations:**
- No foreign keys (standalone)

**Used By:**
- Acha page (`/acha/:subId`)
- Product detail display
- Order creation (product info copied to orders table)

**Special Behavior:**
- `GET /api/acha-products/sub/:subId` creates product if it doesn't exist (getOrCreate pattern)

---

#### 4.2.4 `orders`
**Purpose:** Customer orders

**Columns:**
- `id` SERIAL PRIMARY KEY
- `product_id` TEXT (sub_id from acha_products)
- `product_name` TEXT NOT NULL
- `product_image` TEXT
- `product_price` NUMERIC(12,3) DEFAULT 0
- `product_references` TEXT[] DEFAULT '{}'
- `quantity` INTEGER NOT NULL DEFAULT 1
- `customer_nom` TEXT NOT NULL (last name)
- `customer_prenom` TEXT NOT NULL (first name)
- `customer_phone` TEXT NOT NULL
- `customer_wilaya` TEXT NOT NULL (governorate/state)
- `customer_delegation` TEXT NOT NULL (district)
- `created_at` TIMESTAMP DEFAULT NOW()

**Note:** Includes backward compatibility columns (governorate, delegation, firstname, lastname, phone) if old schema exists.

**Used By:**
- Order creation from Acha page
- Admin dashboard (order management)

**Relations:**
- No foreign keys (product data is denormalized/copied)

---

#### 4.2.5 `hero_content`
**Purpose:** Homepage hero section content

**Columns:**
- `id` SERIAL PRIMARY KEY
- `title` TEXT DEFAULT 'Un large choix de pièces auto'
- `subtitle` TEXT DEFAULT '...'
- `button_text` TEXT DEFAULT 'Découvrir le catalogue'
- `button_link` TEXT DEFAULT '/catalogue'
- `images` TEXT[] DEFAULT ARRAY['/k.png', '/k2.jpg', '/k3.png']
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

**Used By:**
- HeroSection component
- Homepage display

**Behavior:**
- Single row (only one hero content)
- If empty, defaults are used (never returns 500)

---

#### 4.2.6 `brand_images`
**Purpose:** Car brand logos/images for homepage

**Columns:**
- `id` SERIAL PRIMARY KEY
- `title` TEXT DEFAULT 'NOS MARQUES DISPONIBLES'
- `images` TEXT[] DEFAULT ARRAY['/pp.jpg']
- `created_at` TIMESTAMP DEFAULT NOW()
- `updated_at` TIMESTAMP DEFAULT NOW()

**Used By:**
- BrandsSection component
- Homepage display

**Behavior:**
- Single row (only one brand_images entry)

---

#### 4.2.7 `section_content`
**Purpose:** Dynamic section content (JSONB storage)

**Columns:**
- `id` SERIAL PRIMARY KEY
- `section_type` TEXT UNIQUE NOT NULL (e.g., 'familles')
- `title` TEXT
- `content` JSONB (flexible JSON structure)

**Used By:**
- FamilleSection (section_type = 'familles')
- Other dynamic sections

**Example Content (familles):**
```json
{
  "families": [
    {
      "id": "famille-moteur",
      "title": "PIÈCES MOTEUR",
      "image": "/images/moteur.png",
      "subcategories": ["Kit de distribution", ...]
    },
    ...
  ]
}
```

---

#### 4.2.8 `dashboard_products`
**Purpose:** Promotional products for homepage carousel

**Columns:**
- `id` SERIAL PRIMARY KEY
- `product_id` TEXT
- `name` TEXT
- `image` TEXT
- `reference` TEXT
- `price` NUMERIC(12,3)
- `quantity` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

**Used By:**
- PromotionsSection component
- Homepage promotions carousel

---

#### 4.2.9 Other Tables

**`vehicle_models`**
- `id`, `marque`, `model`, `description`, `image`, `created_at`, `updated_at`
- Used by: Catalogue2 page

**`vehicle_model_parts`**
- `id`, `model_id`, `name`, `reference`, `description`, `price`, `image_url`, `category`, `in_stock`, `created_at`, `updated_at`
- Used by: PiecesDispo page

**`car_brands`**
- `id`, `name`, `model`, `description`, `image_url`, `created_at`, `updated_at`
- Used by: Catalogue page

**`search_options`**
- `id`, `field`, `value`, `created_at`
- Used by: Search filters (marques, modeles, annees)

---

### 4.3 Table Relations

**Current State:**
- **No foreign keys defined** in schema
- Relations are **logical only** (via application code)
- Data is **denormalized** in some cases (e.g., orders table copies product data)

**Logical Relations:**
- `vehicle_model_parts.model_id` → `vehicle_models.id` (not enforced)
- `orders.product_id` → `acha_products.sub_id` (not enforced, string match)

**Why No Foreign Keys:**
- Flexibility for migrations
- Easier schema changes
- Some data comes from external sources

---

### 4.4 Database Initialization

**File:** `backend/db/initTables.js`

**Process:**
1. Server starts → `server.js` calls `initializeTables(pool)`
2. For each table definition:
   - Check if table exists
   - If not: Create table with `CREATE TABLE`
   - If exists: Check for missing columns
   - Add missing columns with `ALTER TABLE`
   - Migrate data from old columns to new (if applicable)
3. Set NOT NULL constraints after ensuring no NULL values
4. Log results

**Migration Support:**
- Handles old column names → new column names
- Example: `governorate` → `customer_wilaya`, `delegation` → `customer_delegation`
- Copies data before dropping old columns (if implemented)

---

## 5. REQUEST FLOW EXAMPLES

### 5.1 Homepage Load Flow

```
1. User navigates to "/"
   ↓
2. App.tsx renders Index page
   ↓
3. Index.tsx renders multiple sections in parallel:
   - BrandsSection
   - HeroSection
   - FamilleSection
   - PromotionsSection
   ↓
4. Each section makes independent API calls:
   
   BrandsSection:
   → GET /api/brands
   → Controller: brandImagesController.get
   → Model: BrandImages.get()
   → SQL: SELECT * FROM brand_images
   → Response: { images: [...] }
   → UI updates
   
   HeroSection:
   → GET /api/hero
   → Controller: heroController.get
   → Model: HeroContent.get()
   → SQL: SELECT * FROM hero_content
   → Response: { title, subtitle, images, ... }
   → UI updates
   
   FamilleSection:
   → GET /api/sectionContent?sectionType=familles
   → Controller: sectionContentController.getSectionContent
   → SQL: SELECT * FROM section_content WHERE section_type = 'familles'
   → Response: { content: {...} }
   → UI updates
   
   PromotionsSection:
   → GET /api/dashboard-products
   → Controller: dashboardProductController.getAll
   → SQL: SELECT * FROM dashboard_products
   → Response: [{...}, {...}]
   → UI updates

5. All sections render independently
6. Page fully loaded
```

---

### 5.2 Product Selection → Order Creation Flow

```
1. User clicks product link (e.g., from PiecesDispo page)
   ↓
2. Navigate to "/acha/:subId"
   ↓
3. Acha.tsx component mounts
   ↓
4. useEffect fetches product:
   → GET /api/acha-products/sub/:subId
   → Controller: achaProductController.getOrCreate
   → Model: AchaProduct.getBySubId(subId)
   → SQL: SELECT * FROM acha_products WHERE sub_id = $1
   
   If product exists:
   → Return product data
   
   If product doesn't exist:
   → INSERT INTO acha_products (sub_id, name, ...) VALUES (...)
   → Return new product (with default values)
   ↓
5. Product data displayed:
   - Images carousel
   - Name, price, references
   - Quantity selector
   ↓
6. User clicks "Commander" button
   ↓
7. Order modal opens
   ↓
8. User fills form:
   - nom, prenom, telephone
   - wilaya (governorate), delegation
   - quantite (quantity)
   ↓
9. User clicks "Valider la commande"
   ↓
10. Frontend validation:
    → Check all fields filled
    → Check phone format
    → Trim all strings
    ↓
11. Frontend constructs order payload:
    {
      product_id: subId,
      product_name: product.name,
      product_image: product.images[0],
      product_price: product.price,
      product_references: product.product_references,
      quantity: orderForm.quantite,
      customer_nom: orderForm.nom.trim(),
      customer_prenom: orderForm.prenom.trim(),
      customer_phone: orderForm.telephone.trim(),
      customer_wilaya: orderForm.wilaya.trim(),
      customer_delegation: orderForm.delegation.trim()
    }
    ↓
12. POST /api/orders
    → Route: routes/orders.js
    → Middleware: None (public endpoint)
    → Controller: orderController.create
    → Validation:
      - Check required fields
      - Check for empty strings
    → Model: Order.create(orderData)
    → SQL: INSERT INTO orders (...) VALUES (...)
    → Response: { success: true, data: {...} }
    ↓
13. Frontend receives success:
    → Show success toast: "Commande envoyée!"
    → Close modal
    → Reset form
    ↓
14. Order saved in database
```

---

### 5.3 Admin Editing Content → UI Update Flow

**Example: Editing Hero Section**

```
1. Admin logs in
   → POST /api/auth/login
   → Backend returns: { role: 'admin', isAdmin: true }
   → Frontend saves to localStorage
   ↓
2. Admin visits homepage
   → HeroSection component checks admin status
   → localStorage.getItem('user') → user.role === 'admin'
   → Edit button appears (on hover)
   ↓
3. Admin clicks edit button
   → Modal opens with current content
   ↓
4. Admin modifies content (e.g., changes title)
   ↓
5. Admin clicks "Save"
   ↓
6. Frontend uploads new images (if any):
   → POST /api/upload/image
   → Returns: { url: '/uploads/image.jpg' }
   ↓
7. Frontend sends update:
   → POST /api/hero
   → Body: { title: "New Title", subtitle: "...", images: [...] }
   ↓
8. Backend processes:
   → Controller: heroController.update
   → Model: HeroContent.update(data)
   → SQL: UPDATE hero_content SET title = $1, ... WHERE id = 1
   → Response: { success: true, data: {...} }
   ↓
9. Frontend updates local state:
   → setHeroContent(newData)
   → React Query invalidates 'hero' query (if using React Query)
   → UI re-renders with new content
   ↓
10. Content updated in database and UI
```

**Alternative Flow (React Query):**
```
9. Frontend calls: queryClient.invalidateQueries(['hero'])
   ↓
10. React Query refetches: GET /api/hero
   ↓
11. UI updates automatically
```

---

### 5.4 Search Flow

```
1. User types in search bar (Header/SearchBar)
   ↓
2. handleSearchChange called (debounced 300ms)
   ↓
3. SearchContext.setSearchQuery(query)
   ↓
4. After debounce: SearchContext.performSearch(query)
   ↓
5. Frontend search (client-side):
   → searchProducts(query) in database.ts
   → Fetches: GET /api/products (all products)
   → Filters products:
     - Exact match (name === query)
     - Partial match (name.includes(query))
     - Fuzzy match (Levenshtein distance)
   → Returns sorted results
   ↓
6. SearchContext updates:
   → setSearchResults(results)
   → setResultsCount(results.length)
   → setSearchStats({ time, count })
   ↓
7. SearchBar shows suggestions (if query length > 0)
   ↓
8. User clicks suggestion OR presses Enter
   ↓
9. Navigate to: /search?search={query}
   ↓
10. SearchResults page loads
    → Uses SearchContext.searchResults
    → Displays results grid
    ↓
11. User clicks result
    → Navigate to /acha/:subId
    → Product detail page loads
```

---

## 6. SERVER & DEPLOYMENT LOGIC

### 6.1 Server Startup

**File:** `backend/server.js`

**Startup Sequence:**
```
1. Load environment variables (dotenv)
2. Initialize Express app
3. Configure middleware (CORS, body parser)
4. Test database connection
   → testConnection() (3 retries, 2s delay)
5. Initialize database tables
   → initializeTables(pool)
   → Creates/migrates all tables
6. Register API routes
7. Configure static file serving
8. Register error handler
9. Start HTTP server
   → app.listen(port)
   → Log: "Server running on port {port}"
```

**Port Configuration:**
- Default: 3000
- Config: `backend/config/app.js` or `process.env.PORT`

---

### 6.2 Frontend & Backend Connection

**Development:**
- Frontend: Vite dev server (usually port 5173 or 8080)
- Backend: Express server (port 3000)
- CORS: Enabled for frontend origin
- API Base URL: `import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'`

**Production (Assumed):**
- Frontend: Build with Vite → Static files served by backend or separate server
- Backend: Express server with static file serving
- API calls: Relative URLs or environment variable

**CORS Configuration:**
```javascript
app.use(cors({
  origin: corsConfig.origin, // e.g., 'http://localhost:8080'
  credentials: corsConfig.credentials // true
}));
```

---

### 6.3 Static Files & Images

**Backend Static Routes:**
```
/uploads/* → backend/uploads/ directory
/public/hero/* → backend/public/hero/ directory
```

**Image Upload Flow:**
1. Frontend: File picker → Select image
2. Frontend: `FormData` with image file
3. POST `/api/upload/image`
4. Backend: Save file to `backend/uploads/` (or subdirectory)
5. Backend: Return URL: `{ url: '/uploads/filename.jpg' }`
6. Frontend: Save URL to database (via product/hero/etc. update API)

**Image Storage:**
- Physical files: `backend/uploads/`
- Database: Stores URL strings (e.g., `/uploads/product-123.jpg`)
- Public access: Files served by Express static middleware

**Potential Issues:**
- Images lost on server restart if not persisted properly
- Need backup strategy for production
- Consider cloud storage (S3, etc.) for production

---

### 6.4 Environment Variables

**Backend (.env):**
```
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=database_name
DB_HOST=127.0.0.1
DB_PORT=5432
PORT=3000
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:3000/api
```

**Usage:**
- Backend: `process.env.VARIABLE_NAME`
- Frontend: `import.meta.env.VITE_API_BASE_URL`

**Security:**
- Never commit `.env` files
- Use different values for development/production
- Secrets (passwords, API keys) should not be in frontend `.env`

---

## 7. CURRENT OBSERVED ISSUES

### 7.1 Frontend/Backend Mismatches

#### Issue: Field Naming Inconsistencies
- **Frontend sends:** `customer_wilaya`, `customer_delegation`
- **Old database may have:** `governorate`, `delegation`
- **Status:** Fixed with backward compatibility in Order model
- **Risk:** Medium (migration handles it, but needs testing)

#### Issue: Admin Authorization Incomplete
- **Problem:** Some routes rely on frontend checks only
- **Risk:** High (security vulnerability)
- **Example:** Some admin routes may not check `requireAdmin` middleware
- **Recommendation:** Add `requireAdmin` to all admin routes

---

### 7.2 Naming Inconsistencies

- **User fields:**
  - Database: `first_name`, `last_name`
  - Some code: `name` (combined)
  - Response: May use different field names

- **Product fields:**
  - `acha_products.sub_id` vs `products.id`
  - `product_references` vs `references` (old)

- **Location fields:**
  - `wilaya` (Arabic/French) vs `governorate` (English)
  - `delegation` (French) vs `district` (English)

---

### 7.3 Missing Validations

#### Frontend:
- ✅ Order form validation exists
- ⚠️ Some forms may lack validation
- ⚠️ Phone number validation exists but may not cover all cases

#### Backend:
- ✅ Order creation validation exists
- ⚠️ Some endpoints may lack input validation
- ⚠️ File upload validation (size, type) exists but may need stricter checks

---

### 7.4 Risky or Fragile Patterns

#### Pattern: getOrCreate in Acha Products
- **Risk:** Medium
- **Issue:** Automatically creates products if they don't exist
- **Impact:** May create unwanted products in database
- **Mitigation:** Currently acceptable for business logic, but monitor

#### Pattern: Client-Side Search
- **Risk:** Low (for small datasets), High (for large datasets)
- **Issue:** Loads all products, filters in browser
- **Impact:** Performance degrades as product count grows
- **Recommendation:** Implement server-side search for production

#### Pattern: No Foreign Keys
- **Risk:** Medium
- **Issue:** Data integrity not enforced by database
- **Impact:** Orphaned records possible
- **Mitigation:** Application logic must maintain referential integrity

#### Pattern: localStorage for Authentication
- **Risk:** Medium
- **Issue:** No server-side session validation
- **Impact:** User can fake admin status in localStorage
- **Mitigation:** Always validate on backend (requireAdmin middleware)

#### Pattern: Denormalized Data in Orders
- **Risk:** Low
- **Issue:** Product data copied to orders table
- **Impact:** Orders don't reflect product updates after order placed
- **Mitigation:** Acceptable for order history (historical snapshot)

---

### 7.5 Things That Could Break During Updates

1. **Database Migrations:**
   - Old columns may still exist
   - Migration code must handle both old and new schemas
   - **Fix Applied:** Backward compatibility in Order model

2. **React Query Cache:**
   - Cache invalidation may miss some queries
   - Cross-tab synchronization may fail
   - **Mitigation:** Manual invalidation in some places

3. **File Uploads:**
   - Images may be lost if uploads directory is cleared
   - File paths may break if server path changes
   - **Recommendation:** Use absolute URLs or cloud storage

4. **API Base URL:**
   - Hardcoded fallback may point to wrong server
   - Environment variable may not be set
   - **Mitigation:** Default to localhost for development

5. **Admin Detection:**
   - Multiple ways to check admin status (inconsistent)
   - Frontend and backend checks may diverge
   - **Recommendation:** Standardize on single method

---

## 8. SUMMARY DIAGRAM

### Complete Request Flow (Text-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  React App (Vite Dev Server / Static Files)                     │
│  - React Router (navigation)                                     │
│  - React Query (data fetching/caching)                           │
│  - localStorage (auth, breadcrumbs)                              │
│  - Context (SearchContext)                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP Request (fetch/axios)
                     │ GET/POST/PUT/DELETE
                     │ Headers: Content-Type, Authorization (if any)
                     │ Body: JSON or FormData
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    EXPRESS SERVER                                │
│  Port: 3000                                                      │
│                                                                  │
│  1. Middleware Stack:                                            │
│     - CORS (cross-origin)                                        │
│     - express.json() (parse JSON, 50MB limit)                    │
│     - express.urlencoded() (parse form data)                     │
│     - Static files (/uploads, /public)                           │
│                                                                  │
│  2. Route Matching:                                              │
│     - Matches URL pattern (e.g., /api/orders)                    │
│     - Routes to: routes/orders.js                                │
│                                                                  │
│  3. Route Handler:                                               │
│     - routes/orders.js: router.post('/', ...)                    │
│     - Middleware: asyncHandler (error catching)                  │
│     - Middleware: requireAdmin (if needed)                       │
│                                                                  │
│  4. Controller:                                                  │
│     - controllers/orderController.js: OrderController.create     │
│     - Business logic:                                            │
│       * Validate request body                                    │
│       * Transform data                                           │
│       * Call model                                               │
│                                                                  │
│  5. Model:                                                       │
│     - models/Order.js: Order.create(data)                        │
│     - Database operations:                                       │
│       * Construct SQL query                                      │
│       * Use connection pool                                      │
└────────────────────┬────────────────────────────────────────────┘
                     │ SQL Query (parameterized)
                     │ pool.query('INSERT INTO ...', [values])
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                           │
│  Database: {DB_NAME}                                             │
│  User: {DB_USER}                                                 │
│                                                                  │
│  1. Execute Query:                                               │
│     - INSERT INTO orders (...) VALUES (...)                      │
│     - Check constraints (NOT NULL, UNIQUE, etc.)                 │
│                                                                  │
│  2. Return Result:                                               │
│     - Rows inserted/updated/deleted                              │
│     - Error (if any)                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │ Query Result
                     │ { rows: [{ id: 1, ... }] }
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    RESPONSE FLOW                                 │
│                                                                  │
│  Model → Returns data to Controller                              │
│  Controller → Formats response: { success: true, data: {...} }   │
│  Route → Sends HTTP response (status 200/201/400/500)            │
│  Express → Serializes JSON, sends to client                      │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP Response
                     │ Status: 201 Created
                     │ Body: { success: true, data: {...} }
                     │
┌────────────────────▼────────────────────────────────────────────┐
│                    FRONTEND PROCESSING                           │
│                                                                  │
│  1. Fetch API receives response                                  │
│  2. Parse JSON                                                   │
│  3. Check response.success                                       │
│  4. Update React state (or React Query cache)                    │
│  5. UI re-renders                                                │
│  6. Show toast notification (success/error)                      │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow for Specific Operations

#### Order Creation:
```
User Input (Acha.tsx)
  → Validate form
  → Construct payload
  → POST /api/orders
    → OrderController.create
      → Validate fields
      → Order.create(data)
        → SQL INSERT INTO orders
          → PostgreSQL returns new order
        → Return order data
      → Return { success: true, data: order }
  → Frontend receives response
  → Show success toast
  → Close modal
```

#### Product Search:
```
User types in SearchBar
  → Debounce (300ms)
  → SearchContext.performSearch(query)
    → searchProducts(query)
      → GET /api/products (fetch all)
      → Client-side filtering (exact/partial/fuzzy)
      → Return sorted results
    → Update SearchContext state
  → SearchBar shows suggestions
  → User clicks result
    → Navigate to /search?search={query}
    → SearchResults page displays results
```

#### Admin Content Edit:
```
Admin hovers over section
  → Edit button appears
  → Admin clicks edit
    → Modal opens with current data
    → Admin modifies content
    → Admin saves
      → Upload images (if any) → POST /api/upload/image
      → Update content → POST /api/hero (or sectionContent)
        → Backend updates database
        → Returns updated data
      → Frontend updates state
      → React Query invalidates cache (if used)
      → UI re-renders with new content
```

---

## 9. DEPLOYMENT CONSIDERATIONS

### 9.1 Production Checklist

**Backend:**
- [ ] Set production database credentials in `.env`
- [ ] Configure CORS for production domain
- [ ] Set up file upload directory persistence
- [ ] Enable HTTPS
- [ ] Set up process manager (PM2, systemd)
- [ ] Configure database backups
- [ ] Set up logging (Winston, etc.)
- [ ] Add rate limiting
- [ ] Enable helmet.js (security headers)

**Frontend:**
- [ ] Build production bundle (`npm run build`)
- [ ] Set `VITE_API_BASE_URL` to production API URL
- [ ] Configure static file serving
- [ ] Set up CDN for assets (optional)
- [ ] Enable compression (gzip)

**Database:**
- [ ] Run migrations on production database
- [ ] Verify all tables created
- [ ] Set up automated backups
- [ ] Configure connection pooling limits
- [ ] Enable SSL connections (if needed)

---

### 9.2 Environment Setup

**Development:**
```
Frontend: http://localhost:8080 (or 5173)
Backend:  http://localhost:3000
Database: localhost:5432
```

**Production (Example):**
```
Frontend: https://example.com
Backend:  https://api.example.com (or same domain)
Database: production-postgres-server:5432
```

---

## 10. CONCLUSION

This system is a **full-stack e-commerce platform** with:
- **Frontend:** React + TypeScript, modern UI components
- **Backend:** Node.js + Express, RESTful API
- **Database:** PostgreSQL with flexible schema
- **Features:** Product browsing, search, ordering, admin management

**Architecture Strengths:**
- Clean separation of concerns (routes → controllers → models)
- React Query for efficient data fetching
- Flexible content management (JSONB sections)
- Backward compatibility handling

**Areas for Improvement:**
- Standardize admin authorization (enforce on all routes)
- Implement server-side search for scalability
- Add database foreign keys for data integrity
- Improve error handling consistency
- Add comprehensive input validation
- Consider cloud storage for images

**Overall Assessment:**
The system is **functional and production-ready** with the noted improvements. The codebase follows modern patterns and is maintainable.

---

**END OF DOCUMENT**

