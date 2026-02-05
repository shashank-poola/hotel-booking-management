import hotelRouter from "./hotel.route";
import authRouter from "./user.route";
import bookingRouter from "./booking.route";
import { Router } from "express";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/hotels", hotelRouter);
mainRouter.use("/bookings", bookingRouter)

export default mainRouter;