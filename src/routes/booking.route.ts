import { bookingRoom, cancelBooking, getBookingById } from "../controller/booking.controller";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter.post("/", bookingRoom);
bookingRouter.get("/", getBookingById);
bookingRouter.put("/:bookingId/cancel", cancelBooking);

export default bookingRouter;