import express, { Request, Response, Express } from "express"
import path from "path"
import apiRouter from "./routers"

const app: Express = express()
const port = process.env.PORT || 3000

// Middleware for JSON parsing
app.use(express.json())

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "../public")))

// Mount API routes with prefix
app.use("/api", apiRouter)

// Route for the root path to serve the index.html
app.get("/", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
})

// Start the server
export function startServer() {
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

// Export the app for testing
export { app }
