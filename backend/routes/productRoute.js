import express from "express"
import multer from "multer";
import { addProduct } from "../controllers/product.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/addProduct', upload.single('productPicture'), addProduct)


export default router;