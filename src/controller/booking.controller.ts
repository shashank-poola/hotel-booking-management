import type { Request, Response } from "express";
import { bookingSchema } from "../schema/user.schema";
import prisma from "../../database/src";
import { type AuthenticatedRequest } from "../middleware/user.middleware";

