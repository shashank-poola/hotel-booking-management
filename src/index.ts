import express from "express";
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import mainRouter from "./routes";

const app = express();

const PORT = 3000;

app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes"
});

app.use(apiLimiter);

app.get("/health", (req: Request, res: Response) => {
    res.status(201).json({
        success: true,
        data: "Server is running fine",
        error: null
    });
});

app.use("/api", mainRouter)

app.listen(3000, () => {
    console.log("Server is running on PORT: 3000")
});

