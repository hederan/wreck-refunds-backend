# Wreck Refunds Backend

This is the backend service for the Wreck Refunds application, built with Node.js and Express.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for automatic reloading when files change.

### Production Mode
```bash
npm start
```

## Project Structure

```
src/
  ├── index.js         # Main application entry point
  ├── routes/          # API routes
  ├── controllers/     # Route controllers
  ├── models/          # Data models
  ├── services/        # Business logic
  └── middleware/      # Custom middleware
```

## API Documentation

The API documentation will be available at `/api-docs` once implemented.

## Testing

Run tests using:
```bash
npm test
``` 