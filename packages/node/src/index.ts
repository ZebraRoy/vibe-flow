interface BaseNode<S> {
  run: (shared: S) => Promise<string>
  next: <T extends BaseNode<S>>(nextNode: T, action?: string) => BaseNode<S>
  on: <T extends BaseNode<S>>(action: string, nextNode: T) => BaseNode<S>
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function createNode<P, R, S>({
  prep,
  exec,
  post,
  maxRetries = 1,
  retryDelay = 0,
}: {
  prep: (shared: S) => Promise<P>
  exec: (payload: P) => Promise<R>
  post: (shared: S, payload: P, result: R) => Promise<string>
  maxRetries?: number
  retryDelay?: number
}) {
  let retryCount = 0
  const successor: Partial<Record<string, BaseNode<S>>> = {}
  const execWithRetry = async (payload: P) => {
    try {
      return await exec(payload)
    }
    catch (_error) {
      if (retryCount < maxRetries) {
        retryCount++
        await sleep(retryDelay)
        return await execWithRetry(payload)
      }
      throw _error
    }
  }
  return () => {
    const result: BaseNode<S> = {
      run: async (shared: S) => {
        const payload = await prep(shared)
        const result = await execWithRetry(payload)
        const output = await post(shared, payload, result)
        const nextNode = successor[output]
        if (nextNode) {
          return await nextNode.run(shared)
        }
        return output
      },
      next: <T extends BaseNode<S>>(nextNode: T, action = "default") => {
        successor[action] = nextNode
        return nextNode
      },
      on: <T extends BaseNode<S>>(action: string, nextNode: T) => {
        successor[action] = nextNode
        return result
      },
    }
    return result
  }
}
