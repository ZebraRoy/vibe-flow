# Vibe Flow

Vibe Flow is a Node.js framework for building flow-based applications with a focus on "vibe coding". It provides a simple, flexible API for creating nodes that can be linked together to form flows.

## Packages

This monorepo contains the following packages:

- **vibe-flow**: Core library for creating and managing flow nodes
- **create-vibe-flow**: CLI tool to bootstrap Vibe Flow projects

## Getting Started

You can quickly create a new Vibe Flow project using:

```bash
npm create vibe-flow@latest
# or
yarn create vibe-flow
# or
pnpm create vibe-flow
```

## Core Concepts

Vibe Flow is built around the concept of nodes:

- **Nodes** are the building blocks of a flow
- Each node is responsible for executing a single task and returning a result
- Nodes can be linked together to form complex flows
- Flows control data transformation and application logic

### Creating a Node

```typescript
import { createNode } from "vibe-flow";

type SharedMemory = {
  input: string;
  output: string;
};

const processNode = createNode({
  prep: async (shared) => {
    // Prepare data from shared memory
    return { inputValue: shared.input };
  },
  exec: async (payload) => {
    // Process the data
    return payload.inputValue.toUpperCase();
  },
  post: async (shared, payload, result) => {
    // Store result in shared memory
    shared.output = result;
    return "completed";
  },
});

// Use the node
const memory: SharedMemory = { input: "hello world", output: "" };
await processNode.run(memory);
console.log(memory.output); // "HELLO WORLD"
```

### Linking Nodes

Nodes can be linked to form flows:

```typescript
// Basic linking
nodeA.next(nodeB);

// Conditional linking
nodeA.on("condition", nodeB);
```

## Templates

The `create-vibe-flow` package includes templates for:

- API projects
- CLI applications
- Electron apps
- Fullstack applications

## Requirements

- Node.js >=22.14.0
- pnpm >=10.7.0

## License

MIT © ZebraRoy
