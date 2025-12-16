# Ceyluxe Backend

Express + Firebase Admin backend that mirrors the data model used by the Vite frontend. Provides REST APIs for packages, categories, bookings, customized packages, customers, analytics, and local image uploads.

## Quick start
1. Copy `.env.example` to `.env` and fill Firebase Admin creds. Private key should keep `\n` newlines.
2. Install deps: `npm install`
3. Run dev server: `npm run dev` (defaults to port 4000). Production: `npm start`.
4. API base URL: `http://localhost:4000/api`

## Endpoints (summary)
- `GET /health`
- `GET/POST/PUT/DELETE /api/packages`
- `GET /api/packages/:id`
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST /api/bookings`
- `GET/POST /api/customers`
- `GET/POST /api/customized-packages`
- `GET /api/customized-packages/:id`
- `PATCH /api/customized-packages/:id/status`
- `GET /api/analytics`
- `POST /api/uploads/local` (multipart, field `image`)

Local uploads are exposed at `/uploads/<filename>`.
