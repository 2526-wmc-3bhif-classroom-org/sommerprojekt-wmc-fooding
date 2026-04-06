import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import 'dotenv/config';

// ai help because there were a lot of trouble with the tokens
const getSecretKey = () => (process.env.JWT_SECRET || 'fallback-key').trim();

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "No bearer token available" });
        }

        const token = authHeader.replace('Bearer ', '').trim();
        if (!token || token === 'null' || token === 'undefined') {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Token is empty or invalid string" });
        }

        const decoded = jwt.verify(token, getSecretKey()) as any;
        
        (req as AuthRequest).user = decoded.user;

        next();
        // also here because of major problems. Ai was used for bug search
    } catch (err: any) {
        console.error("JWT Verification Error:", err.message);
        let message = "Ungültiger oder abgelaufener Token";
        if (err.name === 'TokenExpiredError') {
            message = "Token ist abgelaufen - Bitte logge dich neu ein";
        } else if (err.name === 'JsonWebTokenError') {
            message = "Token-Signatur ist ungültig oder Token ist korrupt";
        }
        return res.status(StatusCodes.UNAUTHORIZED).json({ message });
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;
    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(StatusCodes.FORBIDDEN).json({ message: 'Admin-Rolle erforderlich' });
    }
};
