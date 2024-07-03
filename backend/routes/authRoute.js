import express from "express"
import  jwt  from "jsonwebtoken"
import multer from "multer";
import { login, logout, signUp, authUser } from "../controllers/auth.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Error: "You are not authenticated" });
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if (err) {
                return res.status(403).json({ Error: "Token is not valid" });
            } else {
                req.firstName = decoded.firstName;
                req.userId = decoded.userId;
                next();
            }
        });
    }
};

router.post('/signup', upload.single('profilePicture'), signUp)
router.post("/login", login);
router.get("/user", verifyUser, authUser );
router.get("/logout", logout);

export default router;


