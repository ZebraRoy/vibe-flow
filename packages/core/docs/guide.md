# How to use vibe-flow

## Basic of Node

```typescript
import { createNode } from "vibe-flow";
import prompt from "prompt-sync";
import { callLlm } from "./utils/callLlm";

interface SharedStore {
  question?: string;
  answer?: string;
}

const getQuestionNode = createNode({
  // prep takes input from shared, it never return the whole shared to avoid side effects
  prep: async () => {},
  // exec takes input from prep, it never takes input from shared
  exec: async () => {
    const question = prompt("Enter a question: ");
    return question;
  },
  // always set the output of the node in the post function
  post: async (shared: SharedStore, _, question: string) => {
    shared.question = question;
    // Return the next action name. Most of the time we should return "default" if no branching after this node
    return "default";
  },
});

const answerNode = createNode({
  prep: async (shared: SharedStore) => {
    return shared.question;
  },
  exec: async (question: string) => {
    return await callLlm(question);
  },
  post: async (shared: SharedStore, _, answer: string) => {
    shared.answer = answer;
    return undefined;
  },
});

// create flow

getQuestionNode.on("answer", answerNode);

// run flow

const shared: SharedStore = {};

await getQuestionNode.run(shared);

console.log(`Question: ${shared.question}`);
console.log(`Answer: ${shared.answer}`);
```

## Flow

We can create a flow by connecting nodes using `on` and `next` method. `on` is used to connect nodes with conditional edges and `next` is used to connect nodes with default edges. `.on('default', nextNode)` is equivalent to `.next(nextNode)`.

```typescript
// Define some shared state type
interface SharedState {
  username: string;
  isLoggedIn: boolean;
  data?: any;
}

// Create an authentication node
const authNode = createNode<{ username: string }, boolean, SharedState>({
  prep: async (shared) => ({ username: shared.username }),
  exec: async (payload) => {
    // Simulate authentication
    return payload.username === "validUser";
  },
  post: async (shared, payload, result) => {
    shared.isLoggedIn = result;
    return result ? "success" : "failure";
  },
});

// Create a data fetching node
const fetchDataNode = createNode<void, any, SharedState>({
  prep: async (shared) => {
    return;
  },
  exec: async () => {
    // Simulate fetching data
    return { items: ["item1", "item2"] };
  },
  post: async (shared, _, result) => {
    shared.data = result;
    return "default";
  },
});

// Create an error node
const errorNode = createNode<void, void, SharedState>({
  prep: async () => {
    return;
  },
  exec: async () => {
    return;
  },
  post: async () => "retry",
});

// Create a completion node
const completeNode = createNode<void, void, SharedState>({
  prep: async () => {
    return;
  },
  exec: async () => {
    return;
  },
  post: async () => undefined, // End the flow
});

// Connect nodes using both methods
authNode.on("success", fetchDataNode);
authNode.on("failure", errorNode);
errorNode.next(authNode); // 'retry' action from errorNode automatically connects to authNode
fetchDataNode.next(completeNode); // 'complete' action from fetchDataNode connects to completeNode

// Execute the flow
const runFlow = async () => {
  const shared: SharedState = { username: "validUser", isLoggedIn: false };
  const result = await authNode.run(shared);
  console.log("Flow result:", result);
  console.log("Final state:", shared);
};

// If you want to reuse the flow, you can create a flow node using `createFlow` function
// it is mostly used if you have two flow with different shared state

interface AnotherSharedState {
  username: string;
  isLoggedIn: boolean;
  someOtherData: string;
}

const authFlow = createFlow({
  // prep takes input from shared, and convert it to the shared state of the flow
  prep: async (shared: AnotherSharedState) => {
    return {
      username: shared.username,
      isLoggedIn: shared.isLoggedIn,
    };
  },
  // flow takes the input from prep and returns the flow node
  flow: () => authNode,
  post: async (shared, payload, result) => {
    const { result: prepRes } = payload;
    shared.isLoggedIn = prepRes.isLoggedIn;
    shared.username = prepRes.username;
    return "default";
  },
});

const shared: SharedState = {
  username: "validUser",
  isLoggedIn: false,
  someOtherData: "some data",
};

await authFlow.run(shared);
```
