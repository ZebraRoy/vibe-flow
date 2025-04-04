import { QASharedStore, ChatMessage } from "../types"
import { streamLlm } from "../utils/callLlm"
import { Stream } from "openai/streaming"
import { ChatCompletionChunk } from "openai/resources"

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
