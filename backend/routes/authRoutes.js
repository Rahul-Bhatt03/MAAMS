import express from 'express'
import {registerUser,loginUser, getUserProfile, getUserByRole} from '../controllers/authControler.js'
import protect from '../middleware/authMiddleware.js'

const router=express.Router()

router.post('/signup',registerUser)
router.post('/login',loginUser)
router.get('/profile/:userId',protect,getUserProfile)
router.get('/role/:role',protect,getUserByRole)

export default router