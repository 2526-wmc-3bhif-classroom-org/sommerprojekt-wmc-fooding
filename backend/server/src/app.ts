import * as express from "express";
import { DB } from "./db/database";
import { authRouter } from "./routers/auth-router";
import { productRouter } from "./models/product/product-routes";
import * as cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = Number(process.env.PORT) || 3000;


try {
  DB.createDBConnection();
  console.log("food.db connection established");
} catch (error) {
  console.error("FAILED to connect to DB:", error);
}


app.use(cors());
app.use(express.json());


app.use('/auth', authRouter);
app.use('/products', productRouter);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// hilfe von AI, wegen start problemen
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
