import 'dotenv/config';
import * as express from "express";
import { DB } from "./db/database";
import { authRouter } from "./routers/auth-router";
import { productRouter } from "./models/product/product-routes";
import { inventoryRouter } from "./models/inventory_item/inventory-item-routes";
import {recipeRouter} from "./models/recipe/recipe-routes";
import { shoppingListRouter } from "./models/shopping_list_item/shopping-list-item-routes";
import * as cors from 'cors';

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
