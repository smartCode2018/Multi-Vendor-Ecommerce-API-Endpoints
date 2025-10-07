/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from "express";
import "./jobs/product-cron-job";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import router from "./routes/product.routes";

// import swaggerUi from "swagger-ui-express";
// const swaggerDocument = require("./swagger-output.json");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.get("/docs-json", (req, res) => {
//   res.json(swaggerDocument);
// });

//Routes
app.use("/api", router);

// Error handling middleware
app.use(errorMiddleware);

const port = process.env.PORT || 5002;
const server = app.listen(port, () => {
  console.log(`Product service is running at http://localhost:${port}/api`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
  //process.exit(1); // Exit the process on server error
});
