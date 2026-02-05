import type { Request, Response } from "express";
import prisma from "../../database/src";
import { reviewSchema } from "../schema/user.schema";
import { type AuthenticatedRequest } from "../middleware/user.middleware";

export const reviewByCustomer = async( req: Request, res: Response ) => {
    
}