import { reviewByCustomer } from "../controller/review.controller";
import authMiddleware from "../middleware/user.middleware";
import { Router } from "express";

const reviewRouter = Router()

reviewRouter.post("/", authMiddleware, reviewByCustomer);

export default reviewRouter;