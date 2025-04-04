import "dotenv/config"
import { startServer } from "./server"

// Start the API server
function main(): void {
  const server = startServer()

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("Shutting down server...")
    server.close(() => {
      console.log("Server shutdown complete")
      process.exit(0)
    })
  })
}

// Run the main function
main()
