import express, { Request, Response, Express } from "express"
import { createQaFlow, createStreamingQaFlow } from "./flow"
import { QASharedStore, ChatRequest, ChatResponse } from "./types"
import { chatCache } from "./utils/chatCache"

const app: Express = express()
const port = process.env.PORT || 3000
const router = express.Router()

// Middleware for JSON parsing
app.use(express.json())

// Regular chat endpoint
router.post("/chat", function (req: Request, res: Response) {
  (async () => {
    try {
      const { message, conversationId } = req.body as ChatRequest

      if (!message) {
        return res.status(400).json({ error: "Message is required" })
      }

      // Initialize shared state
      const shared: QASharedStore = {
        question: message,
        conversationId,
      }

      // Create and run the QA flow
      const qaFlow = createQaFlow()
      await qaFlow.run(shared)

      // Return response
      const response: ChatResponse = {
        answer: shared.answer || "No answer generated",
        conversationId: shared.conversationId || "",
      }

      res.json(response)
    }
    catch (error) {
      console.error("Error processing chat request:", error)
      res.status(500).json({ error: "An error occurred while processing your request" })
    }
  })()
})

// Streaming chat endpoint
router.post("/chat/stream", function (req: Request, res: Response) {
  (async () => {
    try {
      const { message, conversationId } = req.body as ChatRequest

      if (!message) {
        return res.status(400).json({ error: "Message is required" })
      }

      // Initialize shared state
      const shared: QASharedStore = {
        question: message,
        conversationId,
      }

      // Create and run the streaming QA flow to get the stream
      const streamingQaFlow = createStreamingQaFlow()
      await streamingQaFlow.run(shared)

      // Set streaming headers
      res.setHeader("Content-Type", "text/event-stream")
      res.setHeader("Cache-Control", "no-cache")
      res.setHeader("Connection", "keep-alive")
      if (shared.conversationId) {
        res.setHeader("X-Conversation-ID", shared.conversationId)
      }

      // Handle the stream
      if (shared.stream) {
        let fullResponse = ""

        try {
          for await (const chunk of shared.stream) {
            const content = chunk.choices[0]?.delta?.content || ""
            if (content) {
              // Accumulate the full response
              fullResponse += content

              // Send each chunk as an SSE event
              res.write(`data: ${JSON.stringify({ content })}\n\n`)
            }
          }

          // Store the complete assistant response in chat history
          if (shared.conversationId && fullResponse) {
            chatCache.addMessage(shared.conversationId, {
              role: "assistant",
              content: fullResponse,
              timestamp: Date.now(),
            })
          }

          // End the stream with a done event
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`)
          res.end()
        }
        catch (error) {
          console.error("Streaming error:", error)
          res.write(`data: ${JSON.stringify({ error: "An error occurred during streaming" })}\n\n`)
          res.end()
        }
      }
      else {
        res.status(500).json({ error: "Failed to get response stream" })
      }
    }
    catch (error) {
      console.error("Error processing streaming chat request:", error)
      res.status(500).json({ error: "An error occurred during streaming" })
    }
  })()
})

// Mount API routes with prefix
app.use("/api", router)

// Start the server
export function startServer() {
  return app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

// Export the app for testing
export { app }
