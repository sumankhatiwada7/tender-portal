import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import authRoute from "./modules/auth/auth.route";
import tenderRoute from "./modules/tender/tender.route";
import bidRoute from "./modules/bid/bid.route";
import adminRoute from "./modules/admin/admin.route";
import { swaggerSpec } from "./core/swagger/swagger";
import swaggerUi from "swagger-ui-express";
import { connectDB } from "./core/database/db";
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: Backend is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.get("/", (_req, res) => {
  res.json({ message: "Queue backend running" });
});

/**
 * @swagger
 * /api-docs.json:
 *   get:
 *     summary: Get the generated OpenAPI specification
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: OpenAPI JSON document
 */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec);
});
app.use("/api/v1/bid", bidRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/tender", tenderRoute);
app.use("/api/v1/admin", adminRoute);
async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
