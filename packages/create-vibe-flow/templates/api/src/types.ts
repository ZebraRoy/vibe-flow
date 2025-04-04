import { Response } from "express"
import { Stream } from "openai/streaming"
import { ChatCompletionChunk } from "openai/resources"

export interface QASharedStore {
  question?: string
  answer?: string
  conversationId?: string
  history?: ChatMessage[]
  response?: Response // Proper typing for Express Response
  stream?: Stream<ChatCompletionChunk> // OpenAI stream for streaming responses
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface ChatRequest {
  message: string
  conversationId?: string
}

export interface ChatResponse {
  answer: string
  conversationId: string
}
