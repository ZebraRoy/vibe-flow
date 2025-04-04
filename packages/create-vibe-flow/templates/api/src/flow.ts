import { createNode } from "vibe-flow"
import { GetHistoryNode, AnswerNode, StreamResponseNode } from "./nodes"

export function createQaFlow() {
  // Create nodes
  const getHistoryNode = createNode(GetHistoryNode)
  const answerNode = createNode(AnswerNode)

  // Connect nodes in sequence
  getHistoryNode.next(answerNode)

  // Create flow starting with get history node
  return getHistoryNode
}

// New flow for streaming responses
export function createStreamingQaFlow() {
  // Create nodes
  const getHistoryNode = createNode(GetHistoryNode)
  const streamResponseNode = createNode(StreamResponseNode)

  // Connect nodes in sequence
  getHistoryNode.next(streamResponseNode)

  // Create flow starting with get history node
  return getHistoryNode
}
