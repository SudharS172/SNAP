# SNAP Protocol - Core Implementation

The **Semantic Network Agent Protocol (SNAP)** is an open-source communication standard for AI agents. This repository contains the core protocol specification and reference implementations.

## 🎯 What is SNAP?

SNAP enables AI agents to communicate with rich, multi-modal messages while maintaining cryptographic security and economic incentives. Think of it as HTTP for AI agents.

### Key Features

- **🔐 Cryptographic Identity** - Ed25519 keypairs for agent authentication
- **📝 Multi-Modal Messages** - Text, data, files, images, audio, video
- **⏱️ Asynchronous Tasks** - Long-running operations with progress tracking  
- **💰 Native Payments** - Built-in SEMNET token transactions
- **🌐 JSON-RPC Transport** - Standard request/response and streaming
- **✅ Schema Validation** - Zod-based message validation

## 🚀 Quick Start

### Installation

```bash
npm install @snap-protocol/core
```

### Basic Usage

```typescript
import { AgentIdentity, createMessage } from '@snap-protocol/core';

// Generate agent identity
const agent = AgentIdentity.generate();
console.log(`Agent ID: ${agent.identity.id}`);

// Create a message
const message = createMessage(agent.exportPublic())
  .text('Hello, SNAP Protocol!')
  .data({ timestamp: new Date().toISOString() })
  .build();

// Sign the message
const signature = agent.signObject(message);
console.log('Message created and signed!');
```

## 📁 Repository Structure

```
snap-protocol-core/
├── specification/           # Protocol specification documents
│   ├── core/               # Core protocol features
│   └── extensions/         # Optional extensions
├── reference/              # Reference implementations
│   ├── typescript/         # TypeScript/JavaScript
│   └── python/            # Python (planned)
├── examples/              # Usage examples
│   ├── basic-agent/       # Simple agent communication
│   ├── multi-modal/       # Rich content examples
│   └── payment-flow/      # Payment integration
└── schemas/              # JSON Schema definitions
```

## 🛠️ Reference Implementations

### TypeScript/JavaScript

Full-featured implementation with:
- Complete type safety with TypeScript
- Zod schema validation
- Ed25519 cryptography via tweetnacl
- Browser and Node.js support

[→ TypeScript Documentation](./reference/typescript/README.md)

### Python *(Coming Soon)*

Python implementation with:
- Pydantic models for validation
- Cryptography library integration
- AsyncIO support for streaming

## 📖 Protocol Specification

The SNAP protocol is defined in human-readable markdown documents:

- **[Core Protocol](./specification/core/)** - Message format, identity, transport
- **[Extensions](./specification/extensions/)** - Tasks, streaming, payments

## 🎮 Try It Now


Build messages, simulate tasks, and export code examples in your browser.

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

### Task Management

```typescript
// Create a task
const taskRequest = TaskManager.create(message)
  .priority('high')
  .timeout(300)
  .callback('https://your-app.com/webhooks/task-status')
  .build();

// Track progress
const task = TaskManager.createTask(taskRequest, agent);
task = TaskManager.startProcessing(task, 'Initializing...');
task = TaskManager.updateProgress(task, 0.5, 'Processing data...');
task = TaskManager.complete(task, resultMessage);
```

### Payment Integration

```typescript
const paymentMessage = MessageUtils.paymentRequest(
  serviceProvider,
  client,
  50, // 50 SEMNET tokens
  'Premium analysis service'
);

// Process payment flow...
```

## 🔧 Development

```bash
# Clone the repository
git clone https://github.com/snap-protocol/core

# Install dependencies
cd reference/typescript
npm install

# Build
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

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
- [x] Multi-modal message support
- [x] Task system with progress tracking
- [x] Interactive playground
- [ ] Python reference implementation
- [ ] Go reference implementation
- [ ] WebSocket transport layer
- [ ] Advanced streaming features
- [ ] Plugin system for extensions


## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

SNAP Protocol is inspired by:
- **JSON-RPC 2.0** for transport standardization
- **ActivityPub** for decentralized communication patterns  
- **OpenAI API** for AI-first design principles
- **WebRTC** for peer-to-peer communication concepts

---

**Built with ❤️ for the AI agent ecosystem**
