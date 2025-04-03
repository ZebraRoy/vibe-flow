import { createFlow } from 'vibe-flow'
import { GetQuestionNode, AnswerNode } from './nodes'

export function createQaFlow() {
  // Create nodes
  const getQuestionNode = createNode(GetQuestionNode)
  const answerNode = createNode(AnswerNode)

  // Connect nodes in sequence
  getQuestionNode.next(answerNode)

  // Create flow starting with input node
  return getQuestionNode;
}