import { QASharedStore, ChatMessage } from "../types"
import { chatCache } from "../utils/chatCache"

export const GetHistoryNode = {
  async prep(shared: QASharedStore) {
    return {
      message: shared.question || "",
      conversationId: shared.conversationId,
    }
  },

  async exec(params: { message: string, conversationId?: string }): Promise<{
    message: string
    conversationId: string
    history: ChatMessage[]
  }> {
    let conversationId = params.conversationId
    let history: ChatMessage[] = []

    // Create a new conversation if needed
    if (!conversationId || !chatCache.hasConversation(conversationId)) {
      conversationId = chatCache.createConversation()
    }
    else {
      // Get existing conversation history
      const existingHistory = chatCache.getConversation(conversationId)
      if (existingHistory) {
        history = existingHistory
      }
    }

    // Add the user message to history
    const userMessage: ChatMessage = {
      role: "user",
      content: params.message,
      timestamp: Date.now(),
    }
    chatCache.addMessage(conversationId, userMessage)

    return {
      message: params.message,
      conversationId,
      history: [...history, userMessage],
    }
  },

  async post(
    shared: QASharedStore,
    _: unknown,
    execRes: { message: string, conversationId: string, history: ChatMessage[] },
  ): Promise<string | undefined> {
    shared.question = execRes.message
    shared.conversationId = execRes.conversationId
    shared.history = execRes.history
    return "default" // Go to the next node
  },
}
