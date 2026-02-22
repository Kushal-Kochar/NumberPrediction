# Number Lookup Application

A web application for looking up number combinations from Excel files with authentication and admin approval system.

## Features

- 📊 Excel file upload and parsing
- 🔍 Number search with multiple combination results
- 🎨 Highlight matching values across combinations
- 🔐 User authentication with admin approval
- 👤 Admin panel for managing user signup requests

## GitHub Pages Hosting

### URLs Structure

When hosted on GitHub Pages, your URLs will be:

**Base URL:** `https://[your-username].github.io/[repository-name]/`

**Example URLs:**
- Main App: `https://yourusername.github.io/number-lookup-app/`
- Login: `https://yourusername.github.io/number-lookup-app/login.html`
- Signup: `https://yourusername.github.io/number-lookup-app/signup.html`
- Admin Panel: `https://yourusername.github.io/number-lookup-app/admin.html`

### Admin Login Credentials

- **Username:** `KushalNeha@1602`
- **Password:** `KushalNeha@1602`

## How to Deploy to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name your repository (e.g., `number-lookup-app`)
4. Make it **Public** (required for free GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Files to GitHub

**Option A: Using GitHub Web Interface**
1. In your new repository, click "uploading an existing file"
2. Drag and drop all your files:
   - `index.html`
   - `login.html`
   - `signup.html`
   - `admin.html`
   - `style.css`
   - `script.js`
   - `auth.js`
3. Click "Commit changes"

**Option B: Using Git Command Line**
```bash
# Navigate to your project folder
cd "C:\Users\Kushal.Kochar\OneDrive - Reliance Corporate IT Park Limited\Desktop\android"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: Number Lookup App"

# Add your GitHub repository as remote
git remote add origin https://github.com/[your-username]/[repository-name].git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for GitHub to build your site

### Step 4: Access Your Live Website

Your site will be available at:
```
https://[your-username].github.io/[repository-name]/
```

GitHub will show you the exact URL in the Pages settings.

## Important Notes

### Authentication & Data Storage

- The app uses **localStorage** (browser storage)
- Each user's data is stored in their own browser
- Admin credentials are stored in localStorage
- **Data is NOT shared across devices/browsers**
- If you clear browser data, all users and sessions will be lost

### For Production Use

For a production environment with shared data across users:
- Consider using a backend (Firebase, Supabase, or custom API)
- Store user data in a database
- Implement server-side authentication
- Use secure session management

### File Structure

```
repository/
├── index.html          (Main app - protected)
├── login.html          (User login)
├── signup.html         (User signup)
├── admin.html          (Admin panel)
├── style.css           (Styles)
├── script.js           (Main app logic)
├── auth.js             (Authentication logic)
└── README.md           (This file)
```

## Usage

1. **New Users:** Visit `signup.html` to create an account
2. **Admin:** Visit `admin.html` to approve/reject signup requests
3. **Users:** After approval, login at `login.html` to access the app
4. **Main App:** Upload Excel file and search for numbers

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers

## License

This project is for personal use.

