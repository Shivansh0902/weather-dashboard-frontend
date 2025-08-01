# Weather Dashboard

[![Front-end: Svelte](https://img.shields.io/badge/Front--end-Svelte-ff3e00?logo=svelte)](https://svelte.dev)  
[![Back-end: FastAPI](https://img.shields.io/badge/Back--end-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)  
[![Deploy: Render](https://img.shields.io/badge/Deploy-Render-18A0FB?logo=render)](https://render.com)  
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**A Progressive Web App for real-time weather and 5-day forecasts**, featuring:
- Interactive min/max temperature chart  
- Embedded map for geographic context  
- “Favourites” list and unit toggling (°C/°F)  
- Offline support & installable as a PWA  

**Live Demo:** https://weather-dashboard-frontend-dfi2.onrender.com  
**Backend API:** https://weather-dashboard-backend-kxei.onrender.com  

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Demo](#demo)  
4. [Installation](#installation)  
5. [Configuration](#configuration)  
6. [Usage](#usage)  
7. [PWA & Offline Support](#pwa--offline-support)  
8. [Contributing](#contributing)  
9. [License](#license)  

## Features

- **Search & Geolocation Autosuggest**  
  Start typing any city name and get instant location suggestions (city, state, country) powered by OpenWeatherMap’s geocoding API.

- **Current Weather Display**  
  Shows city & country, weather icon & description, current temperature, min/max temperatures, “feels like,” humidity, and wind speed.

- **5-Day Interactive Forecast Chart**  
  A responsive line chart (Chart.js) plotting daily min / max temperatures over the next five days—visualize trends at a glance.

- **Embedded Map View**  
  A Leaflet map centered on the selected location, with a marker and popup displaying the city name.

- **Favourites List**  
  Save your favorite cities into localStorage and switch between them with a single click.

- **Unit Toggle (°C / °F)**  
  Seamlessly switch between metric and imperial units; all displays and charts update accordingly.

- **Theme Switcher (Dark / Light)**  
  Toggle between dark and light modes, with your preference persisted and synced via URL parameters.

- **PWA & Offline Support**  
  Installable as a Progressive Web App, caches static assets and last‐fetched weather so you can view your dashboard offline.

- **URL State Sync**  
  Automatically encodes `city`, `units`, and `theme` in the URL query string for easy sharing and bookmarking.

## Tech Stack & Architecture

### Frontend
- **Framework**: Svelte v5 + Vite  
- **Styling**: Tailwind CSS (utility-first) + CSS custom properties for theming  
- **Charts**: Chart.js (`chart.js/auto`) for the 5-day min/max temperature line chart  
- **Maps**: Leaflet + OpenStreetMap tiles for the embedded city map  
- **Utilities**:  
  - Lodash’s `debounce` for type-ahead geocoding  
  - Browser Geolocation API as a fallback  
  - `localStorage` for “Favourites” persistence  
  - URLSearchParams to sync `city`, `units`, `theme` in the URL  
- **PWA**:  
  - `vite-plugin-pwa` to generate a service worker  
  - Caches static assets and last API response for offline use  
  - `beforeinstallprompt` hook for “Install App” button  

### Backend
- **Language & Framework**: Python 3.13 + FastAPI  
- **Server**: Uvicorn ASGI  
- **Env Management**: python-dotenv (`.env` for `OPENWEATHER_API_KEY`)  
- **HTTP Client**: `requests` to call OpenWeatherMap  
- **Endpoints**:  
  - `/weather` – current weather  
  - `/forecast` – 5-day grouped forecast  
  - `/geocode` – autocomplete suggestions  
  - `/healthz` – simple health check for uptime pings  
- **CORS**: `CORSMiddleware` to allow the frontend  

### External APIs & Services
- **OpenWeatherMap** – free tier for weather, forecast, geocoding  
- **Render.com** – hosting both frontend (static) and backend (Hobby Free)  
- **UptimeRobot** / **GitHub Actions** – keep-alive pings to prevent spin-down  

### High-Level Architecture
1. **User** → Svelte SPA  
2. SPA → FastAPI endpoints (`/weather`, `/forecast`, `/geocode`)  
3. FastAPI → OpenWeatherMap (weather & geocode)  
4. Responses flow back & are:  
   - Rendered in UI  
   - Cached by the service worker for offline  
   - Stored in `localStorage` if “Favourited”  

## Installation

> ⚙️ These instructions will get you a local copy of the project up and running on your machine for development and testing purposes.

### Prerequisites

- **Node.js** v16+ and **npm** (or Yarn)  
- **Python** 3.13+  
- A free **OpenWeatherMap** API key (sign up at https://home.openweathermap.org/users/sign_up)  

---

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/weather-dashboard.git
cd weather-dashboard
```
### 2. Backend Setup (FastAPI)
    Create & activate a virtual environment
    cd backend
    python3 -m venv venv
    source venv/bin/activate      # macOS/Linux
    # venv\Scripts\activate       # Windows PowerShell

### 3. Configure environment variables
   Copy the example and add your key:
    cp .env.example .env

    Edit .env and set:
    OPENWEATHER_API_KEY=your_openweathermap_api_key_here

### 4. Run the development server
    uvicorn main:app --reload
    
    The API will be available at http://127.0.0.1:8000
    Health check: http://127.0.0.1:8000/healthz

3. Frontend Setup (Svelte + Vite)
Install dependencies
cd ../frontend

npm install
# or yarn
# yarn install

Configure environment variables

Create a .env file in /frontend:

cp .env.local.example .env.local

Edit .env.local and set:
VITE_API_BASE_URL=http://127.0.0.1:8000

Run the development server

npm run dev
# or yarn dev
Your app will be live at http://localhost:5173 (or the port shown in your console).

4. Build for Production
Backend: no build step required—just deploy your /backend folder to your favorite host (e.g. Render, Heroku).
Frontend:
cd frontend
npm run build
# or yarn build
The production-ready files will be in frontend/dist/—deploy these as a static site (e.g. to Render static site, Netlify, Vercel).

5. Verify Everything
API:
curl http://127.0.0.1:8000/healthz
should return { "status": "ok" }.
Frontend:
Visit your local dev URL and confirm:
You can search for a city
Current weather, chart, and map load correctly
Favourites and PWA “Install” prompt work
Once both servers are running, your dashboard will fetch data from the locally served API and you’re all set for development!

## Configuration

### Backend (`/backend/.env`)
| Variable                | Description                                 | Example                              |
|-------------------------|---------------------------------------------|--------------------------------------|
| `OPENWEATHER_API_KEY`   | Your OpenWeatherMap API key                 | `abcdef1234567890abcdef1234567890`   |

### Frontend (`/frontend/.env.local`)
| Variable                | Description                                 | Default                              |
|-------------------------|---------------------------------------------|--------------------------------------|
| `VITE_API_BASE_URL`     | Base URL of your deployed or local backend  | `http://127.0.0.1:8000`              |

> After editing, restart your servers so the changes take effect.

---

## Usage

1. **Start both servers** (see [Installation](#installation)).  
2. **Open** your browser at `http://localhost:5173`.  
3. **Search** for a city or allow geolocation to auto-load your local weather.  
4. **Select** from the dropdown to fetch current weather, 5-day chart, and map.  
5. **Toggle** °C/°F or Dark/Light theme—your choice is synced in the URL.  
6. **Add** cities to your Favourites bar for one-click recall.  
7. **Install** the PWA via the “Install App” button to view cached data offline.

---

## PWA & Offline Support

- **Service Worker** (via `vite-plugin-pwa`) caches:  
  - All static assets (JS, CSS, icons)  
  - Last successful `/weather` & `/forecast` API responses  
- **Offline Behavior**:  
  - App shell loads even without network.  
  - Displays the most recent fetched weather & forecast.  
  - Disables “Get Weather” if no cache exists for the queried city.  
- **Clearing Cache**:  
  - Open DevTools → Application → Clear storage → “Unregister service worker” & “Clear site data”.

---

## Contributing

We welcome community contributions!  

1. **Fork** the repo and create a feature branch:  
   ```bash
   git checkout -b feature/my-new-feature
