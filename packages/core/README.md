# @vibe-flow/node

Vibe Flow Node is a library for building nodes in the Vibe Flow framework. It will be used to work with vibe coding.

## Installation

```bash
pnpm add @vibe-flow/node
```

## Concepts

This package is built around the concept of nodes.

Nodes are the building blocks of a flow. They are responsible for executing a single task and returning a result.

Nodes can be linked together to form a flow.

### Basic

Nodes are defined by the `createNode` function. It takes a `prep`, `exec`, and `post` function.

```ts
const node = createNode({
  prep: async (shared) => {},
  exec: async (payload) => {},
  post: async (shared, payload, result) => {},
});
```

When building a node system, you should define a type for the `shared` object.
It is much easier for LLMs to work with shared memory than to work with the entire context.

```ts
type SharedMemory = {
  // input
  filepathList: string[];
  // output
  fileContent: Partial<Record<string, Buffer>>;
};

const readFileNode = createNode({
  prep: async (shared) => {
    return {
      filepathList: shared.filepathList,
    };
  },
  exec: async (payload) => {
    const { filepathList } = payload;
    const fileContent: Partial<Record<string, Buffer>> = {};
    for (const filepath of filepathList) {
      const content = await readFile(filepath);
      fileContent[filepath] = content;
    }
    return fileContent;
  },
  post: async (shared, payload, result) => {
    for (const filepath in result) {
      shared.fileContent[filepath] = result[filepath];
    }
    return "completed";
  },
});

const sharedMemory: SharedMemory = {
  filepathList: ["file1.txt", "file2.txt"],
  fileContent: {},
};

await readFileNode.run(sharedMemory);

console.log(sharedMemory.fileContent);
```

### Next

Nodes can be linked together to form a flow.

```ts
const nodeA = createNode({
  prep: async (shared) => {},
  exec: async (payload) => {
    console.log("nodeA");
  },
  post: async (shared, payload, result) => {
    return "default";
  },
});

const nodeB = createNode({
  prep: async (shared) => {},
  exec: async (payload) => {
    console.log("nodeB");
  },
  post: async (shared, payload, result) => {
    return;
  },
});

nodeA.next(nodeB);

await nodeA.run(sharedMemory); // nodeA -> nodeB
```

### On

Nodes can be linked together to form a flow with conditions.

```ts
const nodeA = createNode({
  prep: async (shared) => {},
  exec: async (payload) => {},
  post: async (shared, payload, result) => {
    if (shared.condition) {
      return "condition";
    }
    return "default";
  },
});

nodeA.on("condition", nodeB);

const sharedMemory = {
  condition: true,
};

await nodeA.run(sharedMemory); // nodeA -> nodeB
```
