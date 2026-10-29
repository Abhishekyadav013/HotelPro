# HotelPro frontend

HotelPro is a React/Vite hotel-browsing and booking interface. It uses the existing Express API for hotel listings and details, guest registration and login, creating bookings, and viewing the signed-in guest's bookings.

## Run locally

1. Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the backend API URL. For the local backend, use:

   ```text
   VITE_API_URL=http://localhost:5001/api
   ```

2. Install frontend dependencies if needed:

   ```sh
   npm install
   ```

3. Start the frontend:

   ```sh
   npm run dev
   ```

The backend should allow the frontend origin (`http://localhost:5173`) through CORS and be reachable at the configured API URL.

## Available guest flows

- Browse active hotels and open a hotel detail page.
- Register with a name, email, and password, then log in.
- Submit a booking with check-in, check-out, and guest count.
- View bookings returned for the signed-in account.

The frontend stores the API-issued bearer token in browser `sessionStorage` for the current tab session. The backend does not provide payment processing or availability checking; the booking form does not claim either feature.

## Verify

```sh
npm run build
npm run lint
```
