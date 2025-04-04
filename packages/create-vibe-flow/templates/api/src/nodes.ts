import { QASharedStore, ChatMessage } from "./types"
import { callLlm, streamLlm } from "./utils/callLlm"
import { chatCache } from "./utils/chatCache"
import { Stream } from "openai/streaming"
import { ChatCompletionChunk } from "openai/resources"

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

// Stream response node to fetch the stream from OpenAI
export const StreamResponseNode = {
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
  }): Promise<Stream<ChatCompletionChunk>> {
    // Get the stream from OpenAI
    if (params.history.length > 0) {
      // Use the direct message array approach
      return await streamLlm(params.history)
    }
    else {
      // If no history, just use the question
      return await streamLlm(params.question)
    }
  },

  async post(
    shared: QASharedStore,
    _: unknown,
    stream: Stream<ChatCompletionChunk>,
  ): Promise<string | undefined> {
    // Store the stream in shared state for the route handler to use
    shared.stream = stream
    return undefined
  },
}
