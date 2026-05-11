import * as express from "express";
import * as jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import * as bcrypt from 'bcrypt';
import { UserRepository } from "../models/user/user-repository";
import 'dotenv/config';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { isAuthenticated, AuthRequest } from "../middleware/auth-handlers";

// Configure multer for file uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


//no ai use here just almost the same like in the fruit backend the teacher gave us
export const authRouter = express.Router();
const getSecretKey = () => (process.env.JWT_SECRET || 'fallback-key').trim();

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

    const token = jwt.sign({ user: userClaims }, getSecretKey(), { expiresIn: '7d' });

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

    const token = jwt.sign({ user: userClaims }, getSecretKey(), { expiresIn: '7d' });

    res.status(StatusCodes.CREATED).json({
        user: userClaims,
        accessToken: token,
        message: "Registrierung erfolgreich"
    });
});

authRouter.put("/profile/image", isAuthenticated, upload.single('image'), (req: AuthRequest, res) => {
    const userId = req.user!.id;

    if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Kein Bild hochgeladen" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    try {
        const success = UserRepository.updateImage(userId, imagePath);
        if (success) {
            res.status(StatusCodes.OK).json({ message: "Profilbild aktualisiert", image: imagePath });
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Update" });
        }
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Fehler beim Update des Profilbildes" });
    }
});
