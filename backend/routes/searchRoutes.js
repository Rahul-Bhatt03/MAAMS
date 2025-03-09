import express from 'express'
import { searchDatabase } from '../controllers/searchController.js'

const router=express.Router()

router.get('/search',searchDatabase)

export default router