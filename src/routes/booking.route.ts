import { bookingRoom, cancelBooking, getBookingById } from "../controller/booking.controller";
import authMiddleware from "../middleware/user.middleware";
import { Router } from "express";

const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, bookingRoom);
bookingRouter.get("/", authMiddleware, getBookingById);
bookingRouter.put("/:bookingId/cancel", authMiddleware, cancelBooking);

export default bookingRouter;