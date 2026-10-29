# HotelPro

HotelPro is a MERN hotel browsing and booking application. Guests can browse active hotel listings, create an account, sign in, submit a booking request, and view their bookings.

## Requirements

- Node.js and npm
- MongoDB Atlas cluster (or a compatible MongoDB connection string)

## Configuration

Create `Back-end/.env` with the backend settings below. Keep this file local and do not commit credentials or secrets.

```env
PORT=5001
MONGODB_URI=<your MongoDB connection string>
JWT_SECRET=<a long random secret>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
# Optional, only if using Back-end/resetTestPassword.js:
TEST_USER_PASSWORD=<new password for the test account>
```

The frontend reads the API base URL from `Front-end/frontend/.env.local`. Start from the example:

```env
VITE_API_URL=http://localhost:5001/api
```

Vite environment variables are bundled into the browser; never put MongoDB credentials or JWT signing secrets in a `VITE_` variable.

## Run locally

Open two terminals from the project root.

Backend:

```sh
cd Back-end
npm install
npm run dev
```

Frontend:

```sh
cd "Front-end/frontend"
npm install
npm run dev
```

Open `http://localhost:5173`. The backend health endpoint is `http://localhost:5001/`. Ensure the MongoDB Atlas cluster is running and its Network Access rules permit the development machine.

## Main API routes

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a guest account |
| `POST` | `/api/auth/login` | Public | Sign in and receive a bearer token |
| `GET` | `/api/auth/me` | Authenticated | Get the current account |
| `GET` | `/api/hotels` | Public | List active hotels |
| `GET` | `/api/hotels/:id` | Public | Get one active hotel |
| `POST` | `/api/hotels` | Admin | Create a hotel |
| `POST` | `/api/bookings` | Authenticated | Create a booking |
| `GET` | `/api/bookings/my` | Authenticated | List the signed-in guest's bookings |

The booking API validates dates and guest count and calculates a listed total from the hotel's nightly price. It does not check date availability or process payment.

## Verification

```sh
cd "Front-end/frontend"
npm run build
npm run lint
```

See [PROJECT_REPORT.md](./PROJECT_REPORT.md) for the architecture, data models, API examples, live workflow test results, screenshots, and limitations.
