import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import morgan from "morgan";
//import rateLimit from "express-rate-limit";

import cookieParser from "cookie-parser";
import { initializeSiteConfig } from "./libs/initializeSiteConfig";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cookieParser());
app.set("trust proxy", 1); // trust first proxy

//add rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: (req: any) => (req.user ? 1000 : 100), // limit each user to 1000 requests per windowMs
//   message: "Too many requests, please try again later.",
//   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//   legacyHeaders: true, // Disable the `X-RateLimit-*` headers
//   keyGenerator: (req: any) => req.ip,
// });
//app.use(limiter);

app.get("/gateway-health", (req, res) => {
  res.send({ message: "Welcome to api-gateway!" });
});

// ...existing code...
app.use("/product", proxy("http://localhost:5002"));
app.use("/", proxy("http://localhost:5001"));
// ...existing code...

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig();
    console.log("Site configuration initialized.");
  } catch (error) {
    console.error("Error initializing site configuration:", error);
  }
});
server.on("error", console.error);
