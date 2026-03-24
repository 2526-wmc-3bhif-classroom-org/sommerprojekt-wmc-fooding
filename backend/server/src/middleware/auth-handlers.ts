import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-key';

export interface AuthRequest extends Request {
    payload?: JwtPayload;
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error("No bearer token available");
        }

        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
        (req as AuthRequest).payload = decoded;

        next();
    } catch (err) {
        res.status(401).send(`Bitte authentifizieren! ${err}`);
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = (req as AuthRequest).payload;
        if (payload && payload.user && payload.user.role === 'admin') {
            next();
        } else {
            res.status(401).send('Admin-Rolle erforderlich');
        }
    } catch (err) {
        res.status(401).send('Authentifizierung erforderlich');
    }
};
