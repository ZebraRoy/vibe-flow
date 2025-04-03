import { describe, it, expect, vi, afterEach } from "vitest"
import { createNode } from "."

describe("Core", () => {
  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers()
  })
  it("should able to create a node", () => {
    const SomeNode = createNode({
      prep: async () => {},
      exec: async () => {},
      post: async () => "",
    })
    const instance = SomeNode()

    expect(instance).toBeDefined()
  })
  it("should be able to chain nodes", async () => {
    const SomeNode = createNode({
      prep: async () => {},
      exec: async () => {},
      post: async () => "default",
    })
    const SomeNode2 = createNode({
      prep: async () => {},
      exec: async () => {},
      post: async () => "hello",
    })
    const instance = SomeNode()
    const otherNode = SomeNode2()
    instance.next(otherNode)
    const result = await instance.run({})
    expect(result).toBe("hello")
  })
  it("should be able to retry", async () => {
    const mockExec = vi.fn()
    mockExec.mockRejectedValueOnce(new Error("test"))
    mockExec.mockResolvedValueOnce("hello")
    const SomeNode = createNode({
      prep: async () => {},
      exec: mockExec,
      post: async () => "hello",
      maxRetries: 1,
    })
    const instance = SomeNode()
    const result = await instance.run({})
    expect(result).toBe("hello")
    expect(mockExec).toHaveBeenCalledTimes(2)
  })
  it("should be able to retry until reaching max retries", async () => {
    const mockExec = vi.fn()
    mockExec.mockRejectedValue(new Error("test"))
    const SomeNode = createNode({
      prep: async () => {},
      exec: mockExec,
      post: async () => "default",
      maxRetries: 1,
    })
    const instance = SomeNode()
    try {
      await instance.run({})
    }
    catch (error) {
      expect(error).toBeDefined()
    }
    expect(mockExec).toHaveBeenCalledTimes(2)
  })
  it("should be able to retry with delay", async () => {
    vi.useFakeTimers()
    const mockExec = vi.fn()
    mockExec.mockRejectedValueOnce(new Error("test"))
    mockExec.mockResolvedValueOnce("hello")
    const SomeNode = createNode({
      prep: async () => {},
      exec: mockExec,
      post: async () => "hello",
      maxRetries: 1,
      retryDelay: 100,
    })
    const instance = SomeNode()
    const result = instance.run({})
    await vi.advanceTimersByTimeAsync(0)
    // check result is not resolved immediately
    expect(mockExec).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(101)
    // expect result doesn't not be resolved immediately
    expect(result).resolves.toBe("hello")
    expect(mockExec).toHaveBeenCalledTimes(2)
  })
})
