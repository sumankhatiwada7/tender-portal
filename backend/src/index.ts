import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoute from "./modules/auth/auth.route";
import tenderRoute from "./modules/tender/tender.route";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({ message: "Queue backend running" });
});
app.use('/api/v1/auth',authRoute);
app.use('/api/v1/tender',tenderRoute);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
