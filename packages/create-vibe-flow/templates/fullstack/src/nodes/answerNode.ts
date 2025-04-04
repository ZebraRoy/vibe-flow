import { QASharedStore, ChatMessage } from "../types"
import { callLlm } from "../utils/callLlm"
import { chatCache } from "../utils/chatCache"

export const AnswerNode = {
  async prep(shared: QASharedStore): Promise<{
    question: string
    history: ChatMessage[]
    conversationId: string
  }> {
    return {
      question: shared.question || "",
      history: shared.history || [],
      conversationId: shared.conversationId || "",
    }
  },

  async exec(params: {
    question: string
    history: ChatMessage[]
    conversationId: string
  }): Promise<string> {
    // Instead of formatting history as a string, pass the messages array directly
    if (params.history.length > 0) {
      // Use the direct message array approach
      return await callLlm(params.history)
    }

    // If no history, just use the question
    return await callLlm(params.question)
  },

  async post(
    shared: QASharedStore,
    _: unknown,
    execRes: string,
  ): Promise<string | undefined> {
    // Store the answer in shared
    shared.answer = execRes

    // Add the assistant's response to the conversation history
    if (shared.conversationId) {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: execRes,
        timestamp: Date.now(),
      }
      chatCache.addMessage(shared.conversationId, assistantMessage)
    }

    return undefined
  },
}
