import type { Request, Response } from "express";
import prisma from "../../database/src";
import { bookingSchema, reviewSchema } from "../schema/user.schema";
import { type AuthenticatedRequest } from "../middleware/user.middleware";

export const reviewByCustomer = async( req: Request, res: Response ) => {
    try {
        const { user } = ( req as AuthenticatedRequest );

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

        const parsed = reviewSchema.safeParse(req.body);

        if (!parsed.success) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const { bookingId, rating, comment } = parsed.data;

        const booking = await prisma.booking.findUnique({
            where: {
                id: bookingId
            },
            include: {
                review: true,
                hotel: true
            },
        });

        if (!booking) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "BOOKING_NOT_FOUND"
            })
            return;
        }

        if (booking.userId !== user.id) {
            res.status(403).json({
                "success": false,
                "data": null,
                "error": "FORBIDDEN"
            })
            return;
        }

        if (booking.review) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "ALREADY_REVIEWED"
            })
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkOut = new Date(booking.checkOutDate);

        const canReview = 
            checkOut < today && booking.status === "confirmed";

        if (!canReview) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "BOOKING_NOT_ELIGIBLE"
            })
            return;
        }

        const result = await prisma.$transaction(async (tx) => {

        const review = await tx.review.create({
            data: {
                userId: user.id,
                hotelId: booking.hotelId,
                bookingId: booking.id,
                rating,
                comment,
            },
        });
      
        const oldRating = Number(booking.hotel.rating);
        const totalReviews = booking.hotel.totalReviews;
      
        const newRating =
              ((oldRating * totalReviews) + rating) /
              (totalReviews + 1);
      
        await tx.hotel.update({
            where: { id: booking.hotelId },
            data: {
                rating: newRating,
                totalReviews: { increment: 1 },
            },
        })

        return;
        });

        return res.status(201).json({
            "success": false,
            "data": result,
            "error": null
        });

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "INTERNAL_SERVER_ERROR"
        })
    }
}