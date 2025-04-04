import { OpenAI } from "openai"
import "dotenv/config"
import { ChatMessage } from "../types"
import { Stream } from "openai/streaming"
import { ChatCompletionChunk } from "openai/resources"

export async function callLlm(promptOrMessages: string | ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set")
  }

  const client = new OpenAI({ apiKey })

  // Handle both string prompts and message arrays
  const messages = Array.isArray(promptOrMessages)
    ? promptOrMessages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }))
    : [{ role: "user" as const, content: promptOrMessages }]

  const r = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
  })
  return r.choices[0].message.content || ""
}

export async function streamLlm(promptOrMessages: string | ChatMessage[]): Promise<Stream<ChatCompletionChunk>> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set")
  }

  const client = new OpenAI({ apiKey })

  // Handle both string prompts and message arrays
  const messages = Array.isArray(promptOrMessages)
    ? promptOrMessages.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }))
    : [{ role: "user" as const, content: promptOrMessages }]

  // Return the stream directly
  return client.chat.completions.create({
    model: "gpt-4o",
    messages,
    stream: true,
  })
}
