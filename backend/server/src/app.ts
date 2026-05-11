import 'dotenv/config';
import * as express from "express";
import { DB } from "./db/database";
import { authRouter } from "./routers/auth-router";
import { productRouter } from "./models/product/product-routes";
import { inventoryRouter } from "./models/inventory_item/inventory-item-routes";
import {recipeRouter} from "./models/recipe/recipe-routes";
import { shoppingListRouter } from "./models/shopping_list_item/shopping-list-item-routes";
import * as cors from 'cors';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== 'test') {
  try {
    DB.createDBConnection();
    console.log("food.db connection established");
  } catch (error) {
    console.error("FAILED to connect to DB:", error);
  }
}

// ai help because of bugs
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/inventory-items', inventoryRouter);
app.use('/recipes', recipeRouter);
app.use('/shopping-list', shoppingListRouter);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });
}
