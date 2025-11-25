# Rannen Auto Motors - Setup Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Database and Application
```bash
npm run dev:full
```

### 3. Access the Application
- **Frontend:** `http://localhost:8080`
- **Database API:** `http://localhost:3001`
- **Login as admin:** `admin` / `admin123`

## ⚠️ Important: Two Servers Required

### Database Server (JSON Server)
```bash
npm run db
```
- **Port:** 3001
- **URL:** http://localhost:3001
- **Purpose:** Store all data changes

### Application Server (React)
```bash
npm run dev
```
- **Port:** 8080
- **URL:** http://localhost:8080
- **Purpose:** User interface

## 🔧 Troubleshooting

### Problem: Changes not visible in other browsers
**Cause:** Database server not running
**Solution:**
1. Run `npm run db`
2. Verify http://localhost:3001 is working
3. Restart the application

### Problem: Connection error
**Cause:** Server not available
**Solution:**
1. Ensure `npm run db` is running
2. Wait 5 seconds
3. Reload the page

## Database Features

### ✅ Real Database Storage
- **JSON Server** - Lightweight database server
- **RESTful API** - Full CRUD operations
- **Data Persistence** - All changes saved to database
- **Real-time Updates** - Changes visible to all users

### ✅ Admin Capabilities
- **Product Management** - Add, edit, delete products
- **Image Upload** - Upload and manage product images
- **Price Management** - Edit prices and discounts
- **Section Content** - Edit titles and descriptions
- **Search Options** - Manage dropdown options
- **Database Storage** - All changes saved to database

## Features

### ✅ Admin Panel
- **Product Management** - Add, edit, delete products
- **Image Upload** - Upload and manage product images
- **Price Management** - Edit prices and discounts
- **Section Content** - Edit titles and descriptions
- **Search Options** - Manage dropdown options
- **Real-time Updates** - Changes visible immediately

### ✅ User Features
- **Product Catalog** - Browse all products
- **Product Details** - Detailed product pages
- **Search & Filter** - Find products easily
- **Responsive Design** - Works on all screen sizes
- **Modern UI** - Clean and professional design

### ✅ Data Persistence
- **localStorage** - All changes saved locally
- **Cross-session** - Data persists between visits
- **No Database Required** - Works out of the box
- **Easy Migration** - Can upgrade to database later

## Architecture

### Frontend
- **React + TypeScript** - Modern UI framework
- **Tailwind CSS** - Responsive styling
- **React Router** - Page navigation
- **localStorage** - Data persistence

### Admin Features
- **Product Images** - Upload/remove product images
- **Product Details** - Edit names, prices, discounts
- **Section Titles** - Modify page titles and descriptions
- **Search Options** - Add/remove dropdown values
- **Discount Management** - Add/edit/remove discounts

## Usage

### For Admins
1. **Login** with admin credentials
2. **Edit Products** - Click on any product to edit
3. **Upload Images** - Use the upload button
4. **Modify Content** - Edit titles, descriptions, prices
5. **Save Changes** - All changes are saved automatically

### For Users
1. **Browse Products** - View all available products
2. **Product Details** - Click on product images
3. **Search & Filter** - Use the search dropdowns
4. **Responsive Design** - Works on mobile and desktop

## Troubleshooting

### Common Issues
1. **App Not Loading** - Check if all dependencies are installed
2. **Admin Not Working** - Make sure you're logged in as admin
3. **Images Not Showing** - Check if images are properly uploaded

### Solutions
- **Clear Browser Cache** - If you see old data
- **Check Console** - For any JavaScript errors
- **Restart Dev Server** - If changes don't appear

## Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── api/           # API functions (localStorage)
├── lib/           # Utility functions
└── assets/        # Static assets
```

### Key Files
- `src/pages/HuilesAuto.tsx` - Main products page
- `src/pages/ProductDetail.tsx` - Product detail page
- `src/api/client.ts` - Data management functions
- `src/components/Header.tsx` - Navigation header

## Support

For any issues or questions:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Make sure you're using a modern browser
4. Clear browser cache if needed