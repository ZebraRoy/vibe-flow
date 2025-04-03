import { callLlm } from './utils/callLlm'
import { QASharedStore } from './types'
import PromptSync from 'prompt-sync'

const prompt = PromptSync()

export const GetQuestionNode = {

  async prep() {},

  async exec(): Promise<string> {
    // Get question directly from user input
    const userQuestion = prompt('Enter your question: ') || ''
    return userQuestion
  },

  async post(
    shared: QASharedStore,
    _: unknown,
    execRes: string,
  ): Promise<string | undefined> {
    // Store the user's question
    shared.question = execRes
    return 'default' // Go to the next node
  }
}

export const AnswerNode = {
  async prep(shared: QASharedStore): Promise<string> {
    // Read question from shared
    return shared.question || ''
  },

  async exec(question: string): Promise<string> {
    // Call LLM to get the answer
    return await callLlm(question)
  },

  async post(
    shared: QASharedStore,
    _: unknown,
    execRes: string,
  ): Promise<string | undefined> {
    // Store the answer in shared
    shared.answer = execRes
    return undefined
  }
}