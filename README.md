# SNAP Protocol v1.1 - Agent Internet Edition

The **Semantic Network Agent Protocol (SNAP)** is an open-source communication standard for AI agents. This repository contains the core protocol specification and reference implementations.

[![npm version](https://badge.fury.io/js/semnet-snap-protocol.svg)](https://www.npmjs.com/package/semnet-snap-protocol)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 What is SNAP?

SNAP enables AI agents to communicate with rich, multi-modal messages while maintaining cryptographic security and economic incentives. Think of it as HTTP for AI agents.

### Key Features

- **👤 User & Agent Identity** - Both humans and AI agents in one network
- **🎥 Conversation Streaming** - Real-time visibility into agent communications
- **🔐 Cryptographic Identity** - Ed25519 keypairs for authentication
- **📝 Multi-Modal Messages** - Text, data, files, images, audio, video
- **⏱️ Asynchronous Tasks** - Long-running operations with progress tracking  
- **💰 Native Payments** - Built-in SEMNET token transactions
- **🔗 Account Linking** - Connect existing services (optional)
- **🌐 JSON-RPC Transport** - Standard request/response and streaming
- **✅ Schema Validation** - Zod-based message validation

## 🚀 Quick Start

### Installation

```bash
npm install semnet-snap-protocol
```

### Basic Usage

```typescript
import { AgentIdentity, createMessage, UserID } from 'semnet-snap-protocol';

// Generate agent identity
const agent = AgentIdentity.generate();
console.log(`Agent ID: ${agent.identity.id}`);

// Create a user
const user: UserID = {
  id: "snap:user:alice-123",
  publicKey: "ed25519:...",
  name: "Alice"
};

// User sends message to agent
const message = createMessage(user)
  .to(agent.exportPublic())
  .text('Hello, AI assistant!')
  .build();

// Agent responds
const response = createMessage(agent.exportPublic())
  .to(user)
  .text('Hello Alice! How can I help you today?')
  .build();

// Sign the message
const signature = agent.signObject(response);
```

## 📁 Repository Structure

```
SNAP/
├── specification/           # Protocol specification documents
│   ├── core/               # Core protocol features
│   └── extensions/         # Optional extensions
├── reference/              # Reference implementations
│   ├── typescript/         # TypeScript/JavaScript (@semnet/snap-protocol)
│   └── python/            # Python (coming soon)
├── examples/              # Usage examples
│   ├── basic-agent/       # Simple agent communication
│   ├── multi-modal/       # Rich content examples
│   └── payment-flow/      # Payment integration
├── CHANGELOG.md           # Version history
└── schemas/              # JSON Schema definitions
```

## 🆕 What's New in v1.1

### User Identity System
```typescript
const user: UserID = {
  id: "snap:user:alice-123",
  publicKey: "ed25519:...",
  name: "Alice"
};
```

### Conversation Streaming
```typescript
// Watch agent-to-agent conversations in real-time
const event: ConversationStreamEvent = {
  type: "conversation",
  data: {
    direction: "outgoing",
    from: userAI,
    to: weatherAgent,
    message: snapMessage,
    latency: 120,
    cost: 0.01
  }
};
```

### Vector Search Optimized Agent Cards
```typescript
const agentCard: AgentCard = {
  name: "Email Pro",
  description: "Send emails, read emails, search emails, Gmail Outlook Yahoo",
  keywords: ["email", "gmail", "outlook", "messaging"],
  capabilities: ["email.send", "email.read", "email.search"],
  requiresAccountLink: true,
  rateLimit: { requests: 100, window: 60 }
};
```
## 🛠️ Reference Implementations

### TypeScript/JavaScript

Full-featured implementation with:
- Complete type safety with TypeScript
- User & Agent identity support
- Conversation streaming
- Zod schema validation
- Ed25519 cryptography via tweetnacl
- Browser and Node.js support

### Python *(Coming Soon)*

Python implementation with:
- Pydantic models for validation
- Cryptography library integration
- AsyncIO support for streaming

## 💡 Examples

### Multi-Modal Message
```typescript
const message = createMessage(sender)
  .to(recipient)
  .text('Analysis complete!')
  .data({
    results: { accuracy: 0.94, insights: ['trend detected'] },
    metadata: { model: 'gpt-4', version: '2024-01' }
  })
  .file({
    name: 'report.pdf',
    mimeType: 'application/pdf',
    uri: 'https://storage.example.com/report.pdf'
  })
  .build();
```

### Conversation Streaming
```typescript
// Subscribe to conversations
const subscription = {
  userId: "snap:user:alice-123",
  streamTypes: ["conversations", "status"],
  filter: {
    agents: ["snap:agent:flight-booking"]
  }
};

// Receive real-time updates
stream.on('conversation', (event) => {
  console.log(`${event.data.from.id} → ${event.data.to.id}: Cost ${event.data.cost}`);
});
```

### Payment Integration
```typescript
const paymentMessage = MessageUtils.paymentRequest(
  serviceProvider,
  client,
  50, // 50 SEMNET tokens
  'Premium analysis service'
);
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/SudharS172/SNAP.git

# Install dependencies
cd SNAP/reference/typescript
npm install

# Build
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

## 📋 Roadmap

- [x] Core protocol specification
- [x] TypeScript reference implementation
- [x] User identity system
- [x] Conversation streaming
- [x] Account linking protocol
- [x] Multi-modal message support
- [x] Task system with progress tracking
- [ ] Python reference implementation
- [ ] Go reference implementation
- [ ] WebSocket transport layer
- [ ] End-to-end encryption option

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- **NPM Package**: [semnet-snap-protocol](https://www.npmjs.com/package/semnet-snap-protocol)
- **Documentation**: [protocol.semnet.dev](https://protocol.semnet.dev)
- **SEMNET Platform**: [semnet.dev](https://semnet.dev)

---

**Built with ❤️ for the AI agent ecosystem**
