import { createHotel, getDetailedHotels, getHotels, roomsInHotels } from "../controller/hotel.controller";
import { Router } from "express";
import authMiddleware from "../middleware/user.middleware";

const hotelRouter = Router()

hotelRouter.post("/hotels", authMiddleware, createHotel);
hotelRouter.post("/hotels/:hotelId/rooms", authMiddleware, roomsInHotels)
hotelRouter.get("/hotels", authMiddleware, getHotels)
hotelRouter.get("/hotels/:hotelId", getDetailedHotels)

export default hotelRouter;
