import * as express from "express";
import { DB } from "./db/database";
import { authRouter } from "./routers/auth-router";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Database initialization
const db = DB.createDBConnection();
db.close();
console.log("food.db created");

// Middleware
app.use(express.json());

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Routes
app.use('/auth', authRouter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});