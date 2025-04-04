import { Router } from "express"
import chatRouter from "./chat"

// Create main router
const router: Router = Router()

// Mount individual routers
router.use("/chat", chatRouter)

// Export the main router
export default router
