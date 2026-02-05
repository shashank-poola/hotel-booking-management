import type { Request, Response } from "express";
import { hotelSchema, roomSchema } from "../schema/user.schema";
import prisma from "../../database/src";
import { type AuthenticatedRequest } from "../middleware/user.middleware";

export const createHotel = async (req: Request, res: Response) => {
    try {
        const { user } = req as AuthenticatedRequest;

        if (user.role !== "owner") {
            res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
            return;
        }

        const { success, data } = hotelSchema.safeParse(req.body);

        const { id: ownerId } = user;

        if (!success) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const { name, description, city, country, amenities } = data

        const hotel = await prisma.hotel.create({
            data: {
                ownerId,
                name, 
                description,
                city,
                country,
                amenities,
            },
        });

        res.status(200).json({
            "success": true,
            "data": {
                "id": hotel.id,
                "ownerId": ownerId,
                "name": hotel.name,
                "description": hotel.description,
                "city": hotel.city,
                "country": hotel.country,
                "amenities": hotel.amenities,
                "rating": hotel.rating,
                "totalReviews": hotel.totalReviews
            },
            "error": null
        })
        return;

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
        return;
    }
}

export const roomsInHotels = async ( req: Request, res: Response ) => {
    try {
        const { hotelId } = req.params;

        if (!hotelId || typeof hotelId !== "string") {
            return res.status(400).json({
                success: false,
                data: null,
                error: "INVALID_HOTEL_ID"
            });
        }

        const parsed = roomSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            });
            return;
        }

        const hotel = await prisma.hotel.findUnique({
            where: {
                id: hotelId
            }
        });

        if (!hotel) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "HOTEL_NOT_FOUND"
            })
            return;
        }

        const { roomNumber, roomType, pricePerNight, maxOccupancy } = parsed.data;

        const exisitingRoom = await prisma.room.findFirst({
            where: {
                hotelId,
                roomNumber
            },
        });

        if (!exisitingRoom) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "ROOM_ALREADY_EXISTS"
            })
            return;
        }

        const room = await prisma.room.create({
            data: {
                hotelId,
                roomNumber,
                roomType,
                pricePerNight,
                maxOccupancy
            }
        });

        res.status(201).json({
            "success": true,
            "data": {
                "id": room.id,
                "hotelId": room.hotelId,
                "roomNumber": room.roomNumber,
                "roomType": room.roomType,
                "pricePerNight": room.pricePerNight,
                "maxOccupany": room.maxOccupancy
            },
            "error": null
        })
        return;

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
    }
}

export const getHotels = async ( req: Request, res: Response ) => {
    try {
        const user = (req as AuthenticatedRequest).user.role;

        if (!user) {
            res.status(401).json({
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
            })
            return;
        }

        const { city , country, minPrice, maxPrice, minRating } = req.query;

        const hotels = await prisma.hotel.findMany({
            include: { rooms: true}
        });

        const filteredHotels = hotels.filter(hotel => hotel.rooms.length > 0).map(hotel => ({
            id: hotel.id,
            name: hotel.name,
            description: hotel.description,
            city: hotel.city,
            country: hotel.country,
            amenities: hotel.amenities,
            rating: hotel.rating,
            totalReviews: hotel.totalReviews,
            minPricePerNight: Math.min(...hotel.rooms.map(r => r.pricePerNight.toNumber()))
        })).filter(hotels => {
            if (city && hotels.city !== city) return false;
            if (country && hotels.country !== country) return false;
            if (minPrice && hotels.minPricePerNight < Number(minPrice)) return false;
            if (minPrice && hotels.minPricePerNight > Number(minPrice)) return false;
            if (minPrice && hotels.rating.toNumber() < Number(minPrice)) return false;
            return true;
        })

        return res.status(200).json({
            "success": true,
            "data": filteredHotels,
            "error": null
        })

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
        return;
    }
}

export const getDetailedHotels = async (req: Request, res: Response ) => {
    try {

        const hotel = await prisma.hotel.findUnique({
            include: {
                rooms: true
            },
            where: {
                id: req.params.hotelId as string
            }
        })

        if (!hotel) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "HOTEL_NOT_FOUND"
            })
            return;
        }

        res.status(201).json({
            "success": true,
            "data": {
                id: hotel.id,
                name: hotel.name,
                description: hotel.description,
                city: hotel.city,
                country: hotel.country,
                amenities: hotel.amenities,
                rating: hotel.rating,
                totalReviews: hotel.totalReviews,
                rooms: hotel.rooms.map(room => ({
                    id: room.id,
                    roomNumber: room.roomNumber,
                    roomType: room.roomType,
                    pricePerNight: room.pricePerNight,
                    maxOccupancy: room.maxOccupancy
                }))
            },
            "error": null
        })
        return;


    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
        return;
    };
};