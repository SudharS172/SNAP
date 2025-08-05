# @semnet/snap-protocol

TypeScript implementation of SNAP (Semantic Network Agent Protocol) v1.1 - The foundation for the Agent Internet.

[![npm version](https://badge.fury.io/js/semnet-snap-protocol.svg)](https://www.npmjs.com/package/semnet-snap-protocol)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Installation

```bash
npm install semnet-snap-protocol
```

## What's New in v1.1 - Agent Internet Edition

### 🆕 User Identity
Users can now participate directly in the agent network:

```typescript
import { UserID } from '@semnet/snap-protocol';

const user: UserID = {
  id: "snap:user:alice-123",
  publicKey: "ed25519:...",
  name: "Alice"
};
```

### 🎥 Conversation Streaming
Watch agent-to-agent conversations in real-time:

```typescript
import { ConversationStreamEvent } from '@semnet/snap-protocol';

// Subscribe to conversations
const subscription = {
  userId: "snap:user:alice-123",
  streamTypes: ["conversations", "status"],
  filter: {
    agents: ["snap:agent:flight-booking"]
  }
};

// Receive conversation events
const event: ConversationStreamEvent = {
  type: "conversation",
  data: {
    direction: "outgoing",
    from: userAI,
    to: flightAgent,
    message: snapMessage,
    latency: 150,
    cost: 0.02
  }
};
```

### 🔗 Account Linking (Optional)
Connect existing accounts to the agent network:

```typescript
import { AccountLinkRequest } from '@semnet/snap-protocol';

const linkRequest: AccountLinkRequest = {
  userId: "snap:user:alice-123",
  agentId: "snap:agent:gmail",
  serviceName: "google",
  linkingUrl: "https://gmail.com/link-snap-agent"
};
```

### 🔍 Vector Search Optimization
Agent cards optimized for discovery:

```typescript
import { AgentCard } from '@semnet/snap-protocol';

const agentCard: AgentCard = {
  identity: agentId,
  name: "Email Pro",
  description: "Send emails, read emails, search emails, Gmail Outlook Yahoo",
  keywords: ["email", "gmail", "outlook", "messaging"],
  capabilities: ["email.send", "email.read", "email.search"],
  endpoint: "https://email.agents.semnet.dev",
  version: "2.0.0",
  requiresAccountLink: true,
  rateLimit: {
    requests: 100,
    window: 60
  }
};
```

## Quick Start

```typescript
import { 
  AgentIdentity, 
  createMessage,
  SNAPMessage,
  UserID,
  AgentID
} from '@semnet/snap-protocol';

// Create agent identity
const agent = AgentIdentity.generate();
console.log(`Agent ID: ${agent.identity.id}`);

// Create a user
const user: UserID = {
  id: "snap:user:alice-123",
  publicKey: "ed25519:...",
  name: "Alice"
};

// Build a message from user to agent
const message = createMessage(user)
  .to(agent.exportPublic())
  .text('Book me a flight to NYC tomorrow')
  .build();

// Agent responds with options
const response = createMessage(agent.exportPublic())
  .to(user)
  .text('Found 3 flights to NYC tomorrow:')
  .data({
    flights: [
      { airline: "Delta", time: "08:00", price: 250 },
      { airline: "United", time: "10:30", price: 220 },
      { airline: "JetBlue", time: "14:00", price: 195 }
    ]
  })
  .payment({
    amount: 0.05,
    currency: "SEMNET",
    from: user,
    to: agent.exportPublic(),
    status: "executed",
    memo: "Flight search service"
  })
  .build();

// Sign the message
const signature = agent.signObject(response);
```

## Core Features

- ✅ **User & Agent Identity** - Both humans and AI agents in one network
- ✅ **Conversation Streaming** - Real-time visibility into agent communications
- ✅ **Multi-Modal Messages** - Text, data, files, images, audio, video
- ✅ **Built-in Payments** - SEMNET token integration
- ✅ **Account Linking** - Connect existing services (optional)
- ✅ **Rate Limiting** - Prevent abuse (optional)
- ✅ **Vector Search Ready** - Optimized agent discovery
- ✅ **Full TypeScript** - Complete type safety with Zod validation

## Message Types

### User to Agent
```typescript
const message: SNAPMessage = {
  id: "msg_123",
  version: "1.1",
  from: { id: "snap:user:alice", publicKey: "..." },
  to: { id: "snap:agent:assistant" },
  timestamp: new Date().toISOString(),
  parts: [
    { type: "text", content: "Help me plan a trip" }
  ]
};
```

### Agent to Agent
```typescript
const message: SNAPMessage = {
  id: "msg_456",
  version: "1.1",
  from: { id: "snap:agent:user-ai" },
  to: { id: "snap:agent:flight-booking" },
  timestamp: new Date().toISOString(),
  parts: [
    { type: "text", content: "Search flights NYC tomorrow" }
  ],
  payment: {
    amount: 0.1,
    currency: "SEMNET",
    from: userAI,
    to: flightAgent,
    status: "pending"
  }
};
```

## Streaming Events

Monitor agent activity in real-time:

```typescript
// Status updates
{
  type: "status",
  data: {
    streamId: "stream_123",
    status: "active",
    currentAction: "Searching for flights...",
    progress: 0.5
  }
}

// Conversation monitoring
{
  type: "conversation",
  data: {
    direction: "outgoing",
    from: userAI,
    to: weatherAgent,
    message: snapMessage,
    latency: 120,
    cost: 0.01
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm run test

# Watch mode
npm run dev
```

## Documentation

Full documentation at [https://protocol.semnet.dev](https://protocol.semnet.dev)

## Examples

See the [examples directory](../../examples/) for:
- Basic agent communication
- User-to-agent interactions
- Conversation streaming
- Account linking flows
- Payment processing

## License

Apache 2.0 License - Part of the SEMNET Agent Internet Project