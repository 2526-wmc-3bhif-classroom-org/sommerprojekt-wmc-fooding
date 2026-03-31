import * as express from "express";
import * as jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import * as bcrypt from 'bcrypt';
import { UserRepository } from "../models/user/user-repository";
import 'dotenv/config';


//no ai use here just almost the same like in the fruit backend the teacher gave us
export const authRouter = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'fallback-key';

authRouter.post("/login", (req, res) => {
    const { email, password } = req.body;

    const user = UserRepository.findByEmail(email);
    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Benutzer existiert nicht' });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Falsches Passwort' });
    }

    const userClaims = {
        email: user.email,
        id: user.user_id,
        role: user.role || 'user'
    };

    const token = jwt.sign({ user: userClaims }, SECRET_KEY, { expiresIn: '1h' });

    res.status(StatusCodes.OK).json({
        user: userClaims,
        accessToken: token,
        message: "Login erfolgreich"
    });
});

authRouter.post("/register", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email und Passwort erforderlich' });
    }

    const existingUser = UserRepository.findByEmail(email);
    if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({ message: 'Email bereits registriert' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const userId = UserRepository.create({ email, password_hash });

    const userClaims = {
        email: email,
        id: userId,
        role: 'user'
    };

    const token = jwt.sign({ user: userClaims }, SECRET_KEY, { expiresIn: '1h' });

    res.status(StatusCodes.CREATED).json({
        user: userClaims,
        accessToken: token,
        message: "Registrierung erfolgreich"
    });
});
