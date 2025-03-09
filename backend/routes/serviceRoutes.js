import express from "express"
import { upload } from "../config/cloudinary.js"
import { createService, deleteService, getAllServices, getServicesById, updateService } from "../controllers/serviceController.js"
import protect from "../middleware/authMiddleware.js"

const router=express.Router()

router.get("/",getAllServices)
router.get("/:id",getServicesById)

//protected routes that requires token
router.post("/",protect,upload.single('image'),createService)
router.put("/:id",protect,upload.single('image'),updateService)
router.delete("/:id",protect,deleteService)

export default router