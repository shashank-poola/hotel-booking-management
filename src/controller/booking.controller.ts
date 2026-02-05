import type { Request, Response } from "express";
import { bookingSchema } from "../schema/user.schema";
import prisma from "../../database/src";
import { BookingStatus } from "@prisma/client";
import { type AuthenticatedRequest } from "../middleware/user.middleware";

export const bookingRoom = async ( req: Request, res: Response ) => {
    try {
        const { user } = req as AuthenticatedRequest;

        if (!user) {
            res.status(401).json({
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
            })
            return;
        }

        if ( user.role !== "customer" ) {
            res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
            return;
        }

        const parsed  = bookingSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const { roomId, checkInDate, checkOutDate, guests } = parsed.data;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const room = await prisma.room.findUnique({
            where: {
                id: roomId
            }, 
            include: {
                hotel: true,
            },
        });

        if (!room) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "ROOM_NOT_FOUND"
            })
            return;
        }

        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            return res.status(400).json({
              success: false,
              data: null,
              error: "INVALID_DATES",
            });
          }

        if (guests < room.maxOccupancy) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_CAPACITY"
            })
            return;
        }

        const MS_PER_DAY = 1000 * 60 * 60 * 24;
        const nights = (checkOut.getTime() - checkIn.getTime()) / MS_PER_DAY;
        const totalPrice = nights * Number(room.pricePerNight);

        let booking;
        try {
          booking = await prisma.$transaction(async (tx) => {
            const overlapping = await tx.booking.findFirst({
              where: {
                roomId,
                status: "confirmed",
                checkInDate: { lt: checkOut },
                checkOutDate: { gt: checkIn },
              },
            });
    
            if (overlapping) {
              throw new Error("ROOM_NOT_AVAILABLE");
            }
    
            return tx.booking.create({
              data: {
                userId: user.id,
                hotelId: room.hotelId,
                roomId,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                guests,
                totalPrice,
                status: "confirmed",
                bookingDate: new Date(),
              },
            });
          });
        } catch (error) {
            res.status(500).json({
                "success": false,
                "data": null,
                "error": "INTERNAL_SERVER_ERROR"
            })
            return;
        }

        return res.status(200).json({
            "success": true,
            "data": {
                id: booking.id,
                userId: booking.userId,
                roomId: booking.roomId,
                hotelId: booking.hotelId,
                checkInDate: booking.checkInDate,
                checkOutDate: booking.checkOutDate,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                bookingDate: booking.bookingDate,
            },
            "error": null
        });
    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
        return;
    };
};

export const getBookingById = async ( req: Request, res: Response ) => {
    try {
        const { user } = ( req as AuthenticatedRequest);

        if (!user) {
            res.status(401).json({
                "success": false,
                "data": null,
                "error": "UNAUTHORIZED"
            })
            return;
        }

        if ( user.role !== "customer") {
            res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
            return;
        }

        const { status } = req.query;

        const bookings = await prisma.booking.findMany({
            where: {
                userId: user.id,
                ...(status && { status: status as BookingStatus })
            },
            include: {
                hotel: true,
                room: true
            },
            orderBy: {
                bookingDate: "desc"
            }
        })

        const response = bookings.map((booking) => ({
            id: booking.id,
            roomId: booking.roomId,
            hotelId: booking.hotelId,
            hotelName: booking.hotel.name,
            roomNumber: booking.room.roomNumber,
            roomType: booking.room.roomType,
            checkInDate: booking.checkInDate,
            checkOutDate: booking.checkOutDate,
            guests: booking.guests,
            totalPrice: booking.totalPrice,
            status: booking.status,
            bookingDate: booking.bookingDate
        }));

        return res.status(200).json({
            "success": true,
            "data": response,
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

export const cancelBooking = async ( req: Request, res: Response ) => {

}