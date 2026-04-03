import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-key';

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

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, SECRET_KEY) as any;
        
        // Match the structure from auth-router.ts sign() call: { user: userClaims }
        (req as AuthRequest).user = decoded.user;

        next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Ungültiger oder abgelaufener Token" });
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
