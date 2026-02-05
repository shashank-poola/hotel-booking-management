import { reviewByCustomer } from "../controller/review.controller";
import { Router } from "express";

const reviewRouter = Router()

reviewRouter.post("/", reviewByCustomer);

export default reviewRouter;