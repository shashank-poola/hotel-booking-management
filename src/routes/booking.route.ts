import { bookingRoom, getBookingById } from "../controller/booking.controller";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter.post("/", bookingRoom)
bookingRouter.get("/", getBookingById)

export default bookingRouter;