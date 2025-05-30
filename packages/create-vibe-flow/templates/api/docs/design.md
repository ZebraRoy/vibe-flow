# Design Doc: Your Project Name

> Please DON'T remove notes for AI

## Requirements

> Notes for AI: Keep it simple and clear.
> If the requirements are abstract, write concrete user stories

## Flow Design

> Notes for AI:
>
> 1. Consider the design patterns of agent, map-reduce, rag, and workflow. Apply them if they fit.
> 2. Present a concise, high-level description of the workflow.

### Applicable Design Pattern:

1. Map the file summary into chunks, then reduce these chunks into a final summary.
2. Agentic file finder
   - _Context_: The entire summary of the file
   - _Action_: Find the file

### Flow high-level Design:

1. **First Node**: This node is for ...
2. **Second Node**: This node is for ...
3. **Third Node**: This node is for ...

```mermaid
flowchart TD
    firstNode[First Node] --> secondNode[Second Node]
    secondNode --> thirdNode[Third Node]
```

## Utility Functions

> Notes for AI:
>
> 1. Understand the utility function definition thoroughly by reviewing the doc.
> 2. Include only the necessary utility functions, based on nodes in the flow.

1. **Call LLM** (`src/utils/callLlm.ts`)

   - _Input_: prompt (str)
   - _Output_: response (str)
   - Generally used by most nodes for LLM tasks

2. **Embedding** (`src/utils/getEmbedding.ts`)
   - _Input_: str
   - _Output_: a vector of 3072 floats
   - Used by the second node to embed text

## Node Design

### Shared Memory

> Notes for AI: Try to minimize data redundancy

The shared memory structure is organized as follows:

```typescript
interface SharedMemory {
  key: string;
}
```

### Node Steps

1. First Node

- _Purpose_: Provide a short explanation of the node’s function
- _Steps_:
  - _prep_: Read "key" from the shared store
  - _exec_: Call the utility function
  - _post_: Write "key" to the shared store

2. Second Node
   ...

### API Design

> Notes for AI:
>
> 1. Understand the API design thoroughly by reviewing the doc.
> 2. Include only the necessary API design, based on nodes in the flow.
> 3. Pass the request parameters to the shared store.
> 4. Get the response from the shared store. If it is a stream, return the stream.
> 5. API should using one of the Flows defined in `src/flow.ts`

1. **First API** (`src/router/first.ts`)

- _Purpose_: Provide a short explanation of the API’s function
- _Request_:
  - _key_: string
- _Response_:
  - _value_: string
- _Flow_: `createQaFlow`

2. **Second API** (`src/router/second.ts`)
   ...
