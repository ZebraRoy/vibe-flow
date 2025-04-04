import { v4 as uuidv4 } from "uuid"
import { ChatMessage } from "../types"

// Simple in-memory cache for storing chat history
class ChatCache {
  private conversations: Map<string, ChatMessage[]> = new Map()

  // Create a new conversation and return the ID
  createConversation(): string {
    const conversationId = uuidv4()
    this.conversations.set(conversationId, [])
    return conversationId
  }

  // Get conversation history by ID
  getConversation(conversationId: string): ChatMessage[] | undefined {
    return this.conversations.get(conversationId)
  }

  // Add a message to a conversation
  addMessage(conversationId: string, message: ChatMessage): void {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, [])
    }

    const history = this.conversations.get(conversationId)
    if (history) {
      history.push(message)
    }
  }

  // Check if conversation exists
  hasConversation(conversationId: string): boolean {
    return this.conversations.has(conversationId)
  }
}

// Export a singleton instance
export const chatCache = new ChatCache()
