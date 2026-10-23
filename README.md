EventEase
==========

EventEase is a web-based event management application for creating, managing, and participating in events.

Features
--------

- User registration and login
- View available events
- Create, edit, and cancel events
- Participant registration
- MongoDB data storage
- Responsive user interface

Technology Stack
----------------

- Frontend: React, Vite, JavaScript, CSS
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Deployment: Render
- Version Control: Git and GitHub

Live Demo
---------

https://eventease-1-4qc5.onrender.com

GitHub Repository
-----------------

https://github.com/manojdev-817/EventEase

Local Setup
-----------

Requirements:
- Node.js and npm
- MongoDB database

1. Clone the repository:

   `git clone https://github.com/manojdev-817/EventEase.git`

2. Open the project folder:

   `cd EventEase`

3. Install backend dependencies:

   `cd server`

   `npm install`

4. Create a `server/.env` file containing your own database connection string and JWT secret:

   `MONGO_URI=your_mongodb_connection_string`

   `JWT_SECRET=your_secret_key`

   `CLIENT_URL=http://localhost:5173`

5. Start the backend:

   `npm start`

6. Open another terminal and install frontend dependencies:

   `cd client`

   `npm install`

7. Create `client/.env` with:

   `VITE_API_URL=http://localhost:5000/api`

8. Start the frontend:

   `npm run dev`

Security
--------

Never commit environment files, passwords, or database credentials to GitHub.
