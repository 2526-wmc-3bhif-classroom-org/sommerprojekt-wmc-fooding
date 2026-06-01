import 'dotenv/config';
import * as express from "express";
import { DB } from "./db/database";
import { userRouter } from "./models/user/user-routes";
import { productRouter } from "./models/product/product-routes";
import { inventoryRouter } from "./models/inventory_item/inventory-item-routes";
import { recipeRouter } from "./models/recipe/recipe-routes";
import { shoppingListRouter } from "./models/shopping_list_item/shopping-list-item-routes";
import * as cors from 'cors';
import * as path from 'path';

const uploadsDir = path.join(__dirname, 'uploads');

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

if (process.env.NODE_ENV !== 'test') {
  DB.createDBConnection();
}

app.use(cors());

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.use('/auth', userRouter);
app.use('/products', productRouter);
app.use('/inventory-items', inventoryRouter);
app.use('/recipes', recipeRouter);
app.use('/shopping-list', shoppingListRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
  });
}
