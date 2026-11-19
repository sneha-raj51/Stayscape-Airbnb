# StayScape — Installation & Deployment Guide

This guide provides end-to-end instructions for running StayScape locally, configuring cloud services, and deploying to production environments.

---

## 1. Prerequisites

- **Node.js**: `v18.0.0` or higher (recommended: `v20.x` or `v22.x`)
- **Package Manager**: `npm` (v9+)
- **Database**: Local MongoDB instance (`mongodb://localhost:27017`) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.

---

## 2. Local Development Setup

### Step 1: Clone or Navigate to the Project Root
```bash
cd Airbnb
```

### Step 2: Configure Backend Environment
Navigate to the `backend` directory and create the `.env` file:
```bash
cd backend
cp .env.example .env
```

Review and adjust variables in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/stayscape
JWT_SECRET=stayscape_super_secret_jwt_key_2026_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Cloudinary (Optional - local storage will be used if left blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Step 3: Install Backend Dependencies & Run Tests
```bash
npm install
npm test
```
*All 34 automated unit & integration tests should pass.*

### Step 4: Configure Frontend Environment
In a separate terminal, navigate to the `frontend` directory:
```bash
cd ../frontend
cp .env.example .env
```

Review variables in `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000

# Google Maps API Key (Optional - OpenStreetMap with directions is used if left blank)
VITE_GOOGLE_MAPS_API_KEY=
```

### Step 5: Install Frontend Dependencies & Start App
```bash
npm install
npm run dev
```

The frontend development server starts on `http://localhost:3000`.

### Step 6: Start Backend Server
In the backend terminal:
```bash
npm run dev
```
The REST API server starts on `http://localhost:5000`.

---

## 3. Third-Party Service Configurations

### 3.1 MongoDB Atlas (Cloud Database)
1. Register for a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Database Access**, create a database user with password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) or specific server IPs.
5. In **Database** > **Connect** > **Drivers**, copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/stayscape?retryWrites=true&w=majority
   ```
6. Update `MONGODB_URI` in `backend/.env`.

### 3.2 Cloudinary (Cloud Image Hosting)
1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. From the Dashboard, copy **Cloud Name**, **API Key**, and **API Secret**.
3. Paste them into `backend/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. If omitted, StayScape automatically stores photos inside `backend/uploads/` without crashing.

### 3.3 Google Maps (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project.
2. Enable the **Maps Embed API**.
3. Create an API Key and restrict it to your domain.
4. Add to `frontend/.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
5. If omitted, StayScape automatically renders an interactive OpenStreetMap view with an instant "Get Directions" navigation shortcut.

---

## 4. Production Deployment

### 4.1 Deploying Backend on Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In **Environment Variables**, provide:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A strong random secret)
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
   - (Optional) `CLOUDINARY_*` credentials

### 4.2 Deploying Frontend on Vercel
1. Import your project repository into [Vercel](https://vercel.com/).
2. Configure settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com`
4. The included `frontend/vercel.json` ensures all client-side routes resolve properly to `/index.html`.

---

## 5. Troubleshooting & FAQ

| Problem | Cause | Resolution |
| :--- | :--- | :--- |
| **CORS blocked on requests** | `CLIENT_URL` doesn't match frontend origin | Update `CLIENT_URL` in `backend/.env` to match the exact frontend port or domain. |
| **Session cookie not stored** | `secure: true` on HTTP connection | In local development, ensure `NODE_ENV=development` so cookies are sent over non-HTTPS connections. |
| **Mongo buffering timed out** | MongoDB daemon is not running | Start your local MongoDB server via `mongod` or verify network access in MongoDB Atlas. |
| **Image upload fails** | File exceeds 5MB or invalid type | Upload only JPEG, PNG, or WEBP images under 5MB. |
