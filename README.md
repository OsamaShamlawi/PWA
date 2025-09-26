# Finance Management App

A full-stack finance management application with AI chatbot integration.

## Features

- **User Authentication**: Secure login and registration system
- **AI Chatbot**: OpenAI-powered financial assistant 
- **Credit Card Management**: Track multiple credit cards
- **Transaction Management**: Manual transaction entry and tracking
- **Advanced Filtering**: Filter transactions by category and credit card
- **Real-time Analytics**: Financial insights and statistics
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18.2.0
- TypeScript 5.2.2
- Vite 4.4.9
- Tailwind CSS
- React Router Dom
- Axios

### Backend
- Node.js with Express 4.18.2
- SQLite3 5.1.6
- OpenAI API 4.0.0
- JWT Authentication
- bcrypt password hashing

## Setup

### Backend
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create `.env` file with your OpenAI API key:
   ```
   PORT=5000
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ```
4. Start server: `node server.js`

### Frontend
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Usage

1. Register a new account or login
2. Access the AI chatbot for financial advice
3. Add your credit cards
4. Track transactions manually
5. Use advanced filtering to analyze spending patterns
6. View real-time analytics

## Network Access

The application supports network access for mobile devices:
- Frontend: http://localhost:5173/ (local) or http://your-ip:5173/ (network)
- Backend: http://localhost:5000/ (local) or http://your-ip:5000/ (network)

## License

Private project for hackathon use.