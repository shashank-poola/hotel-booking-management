import { login, signUp } from "../controller/user.controller";
import authMiddleware from "../middleware/user.middleware";
import { Router } from "express";

const authRouter = Router()

authRouter.post("/signup", signUp)
authRouter.post("/login", login)

export default authRouter;