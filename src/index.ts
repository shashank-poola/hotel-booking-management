import express from "express";
import type { Request, Response } from "express";
import mainRouter from "./routes";

const app = express();

const PORT = 3000;

app.use(express.json());

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

