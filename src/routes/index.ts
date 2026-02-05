import hotelRouter from "./hotel.route";
import authRouter from "./user.route";
import { Router } from "express";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/hotels", hotelRouter);

export default mainRouter;