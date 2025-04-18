import express, { Express } from "express"
import apiRouter from "./routers"

const app: Express = express()
const port = process.env.PORT || 3000

// Middleware for JSON parsing
app.use(express.json())

// Mount API routes with prefix
app.use("/api", apiRouter)

// Start the server
export function startServer() {
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

// Export the app for testing
export { app }
