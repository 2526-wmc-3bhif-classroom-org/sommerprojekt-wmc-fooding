import 'dotenv/config';
import * as express from "express";
import { DB } from "./db/database";
import { authRouter } from "./routers/auth-router";
import { productRouter } from "./models/product/product-routes";
import { inventoryRouter } from "./models/inventory_item/inventory-item-routes";
import * as cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3000;


try {
  DB.createDBConnection();
  console.log("food.db connection established");
} catch (error) {
  console.error("FAILED to connect to DB:", error);
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


app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// hilfe von AI, wegen start problemen
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
