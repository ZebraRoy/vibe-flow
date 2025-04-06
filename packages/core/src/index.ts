export interface BaseNode<S> {
  run: (shared: S) => Promise<string | undefined>
  next: <T extends BaseNode<S>>(nextNode: T, action?: string) => BaseNode<S>
  on: <T extends BaseNode<S>>(action: string, nextNode: T) => BaseNode<S>
}

export interface NodeParams<P, R, S> {
  prep: (shared: S) => Promise<P>
  exec: (payload: P) => Promise<R>
  post: (shared: S, payload: P, result: R) => Promise<string | undefined>
  maxRetries?: number
  retryDelay?: number
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
}: NodeParams<P, R, S>) {
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
  const result: BaseNode<S> = {
    run: async (shared: S) => {
      const payload = await prep(shared)
      const result = await execWithRetry(payload)
      const output = await post(shared, payload, result)
      const nextNode = output ? successor[output] : undefined
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

export function createFlow<NS, S>({
  prep,
  post,
  maxRetries,
  retryDelay,
  flow,
}: NodeParams<NS, {
  action: string | undefined
  result: NS
}, S> & {
  flow: () => BaseNode<NS>
}) {
  return createNode({
    prep,
    exec: async (prepRes: NS) => {
      const flowNode = flow()
      const action = await flowNode.run(prepRes)
      return {
        action,
        result: prepRes,
      }
    },
    post,
    maxRetries,
    retryDelay,
  })
}
