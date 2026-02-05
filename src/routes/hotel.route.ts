import { createHotel, getDetailedHotels, getHotels, roomsInHotels } from "../controller/hotel.controller";
import { Router } from "express";
import authMiddleware from "../middleware/user.middleware";

const hotelRouter = Router()

hotelRouter.post("/", authMiddleware, createHotel);
hotelRouter.post("/:hotelId/rooms", authMiddleware, roomsInHotels)
hotelRouter.get("/", authMiddleware, getHotels);
hotelRouter.get("/:hotelId", getDetailedHotels);

export default hotelRouter;
