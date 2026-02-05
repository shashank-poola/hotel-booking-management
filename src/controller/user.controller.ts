import type { Request, Response } from "express";
import prisma from "../../database/src";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { signUpSchema, loginSchema } from "../schema/user.schema";

export const JWT_SECRET = process.env.JWT_SECRET;

export const signUp = async ( req: Request, res: Response ) => {
    try {
        const { success, data } = signUpSchema.safeParse(req.body)

        if(!success) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const { name, email, password, role="customer" } = data;
        
        const exisiting = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (exisiting) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "EMAIL_ALREADY_EXISTS"
            })
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data : {
                email,
                password : hashedPassword,
                role: role || "customer",
                name
            }
        });

        res.status(201).json({
            "success": true,
            "data": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "phone": user.phone
            },
            "error": null
        });
    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "SERVER_ERROR"
        })
        return;
    };
};

export const login = async (req: Request, res: Response ) => {
    try {
        const { success, data } = loginSchema.safeParse(req.body)

        if(!success) {
            res.status(400).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (!user) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "INVALID_REQUEST"
            })
            return;
        }

        const verifiedPass = await bcrypt.compare(password, user.password);

        if (!verifiedPass) {
            res.status(404).json({
                "success": false,
                "data": null,
                "error": "INVALID_CREDENTIALS"
            })
            return;
        }

        if (!JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({
            id: user.id,
            role: user.role    
        }, JWT_SECRET);

        res.status(200).json({
            "success": true,
            "data": {
                "token": token,
                "user": {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            },
            "error": null
        })
        return;

    } catch (error) {
        res.status(500).json({
            "success": false,
            "data": null,
            "error": "SERVER_ERROR"
        })
        return;
    };
};

