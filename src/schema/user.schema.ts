import { z } from "zod";

export const signUpSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum(["customer", "owner"]),
    phone: z.string().optional()
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const hotelSchema = z.object({
    name: z.string(),
    description: z.string(),
    city: z.string(),
    country: z.string(),
    amenities: z.array(z.string()).optional(),
});

export const roomSchema = z.object({
    roomNumber: z.string(),
    roomType: z.string(),
    pricePerNight: z.number().positive(),
    maxOccupancy: z.number().positive(),
});

export const bookingSchema = z.object({
    hotelId: z.string().uuid(),
    roomId: z.string().uuid(),
    checkInDate: z.coerce.date(),
    checkOutDate: z.coerce.date(),
    guests: z.number().int().positive(),
}).refine(
    (data) => data.checkOutDate > data.checkInDate,
    {
        message: "check out date must be after check in date",
        path: ["checkOutDate"]
    }
);

export const reviewSchema = z.object({
    hotelId: z.string().uuid(),
    bookingId: z.string().uuid(),
    review: z.number().int().min(1).max(5),
    comment: z.string().optional()
});

