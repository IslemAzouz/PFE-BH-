import express from "express"
import { saveChat } from "../controllers/chatbotController.js"

const router = express.Router()

router.post("/", saveChat)

export default router
