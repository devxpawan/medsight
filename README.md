# Med Vision Share

## Features
- User authentication (JWT-based)
- Share medicine records with images (up to 3 per record)
- Add details: medicine name, illness, notes
- Browse recent medicine records
- Edit/delete own records

## Tech Stack
- **Client**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Server**: Node.js, Express, MongoDB (Mongoose)
- **Auth**: JWT, bcryptjs

## Getting Started
```bash
# Install dependencies
cd client && npm install
cd ../server && npm install

# Run development servers
cd client && npm run dev
cd ../server && npm run dev
```