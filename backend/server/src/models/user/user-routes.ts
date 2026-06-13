import * as express from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user-service";
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { isAuthenticated, AuthRequest } from "../../middleware/auth-handlers";

// Configure multer for file uploads
// In app.ts, uploadsDir is relative to __dirname (dist/src)
// Here, we are in dist/src/models/user
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Nur Bilddateien erlaubt'))
    } else {
      cb(null, true)
    }
  }
});

export const userRouter = express.Router();

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await UserService.login(email, password);

    if (result.success) {
        res.status(StatusCodes.OK).json({
            user: result.user,
            accessToken: result.token,
            message: "Login erfolgreich"
        });
    } else {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: result.message });
    }
});

userRouter.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const result = await UserService.register(email, password);

    if (result.success) {
        res.status(StatusCodes.CREATED).json({
            user: result.user,
            accessToken: result.token,
            message: "Registrierung erfolgreich"
        });
    } else {
        const status = result.message?.includes('erforderlich') ? StatusCodes.BAD_REQUEST : StatusCodes.CONFLICT;
        res.status(status).json({ message: result.message });
    }
});

userRouter.put("/profile/image", isAuthenticated, upload.single('image'), (req: AuthRequest, res) => {
    const userId = req.user!.id;

    if (!req.file) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: "Kein Bild hochgeladen" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const result = UserService.updateProfileImage(userId, imagePath);

    if (result.success) {
        res.status(StatusCodes.OK).json({ message: "Profilbild aktualisiert", image: imagePath });
    } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: result.message });
    }
});
