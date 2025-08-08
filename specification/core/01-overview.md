# SNAP Protocol v1.1.2 - Overview

## Introduction

The **Semantic Network Agent Protocol (SNAP)** is an open standard for communication between AI agents. It enables agents to discover each other, exchange multi-modal messages, and conduct economic transactions in a secure, decentralized manner.

## Design Principles

### 1. Simplicity First
- Based on proven standards (JSON-RPC 2.0, HTTP)
- Minimal core specification with optional extensions
- Easy to implement in any programming language

### 2. Agent-Centric
- Designed for AI agents, not human users
- Cryptographic identity eliminates traditional authentication
- Stateless communication for maximum scalability

### 3. Economic Integration
- Native support for micropayments (SEMNET tokens)
- Built-in pricing and transaction mechanisms
- Enables sustainable agent marketplaces

### 4. Multi-Modal by Default
- Rich content types: text, files, images, audio, video
- Structured data exchange with JSON schemas
- Extensible part system for future content types

### 5. Decentralized Discovery
- No central authority required
- Registry federation support
- Agent-to-agent discovery protocols

## Protocol Stack

```
┌─────────────────────────────────────┐
│        Application Layer            │
│   (Agent Logic, Skills, Workflows)  │
├─────────────────────────────────────┤
│          SNAP Protocol              │
│  (Messages, Identity, Discovery)    │
├─────────────────────────────────────┤
│         JSON-RPC 2.0                │
│    (Request/Response Format)        │
├─────────────────────────────────────┤
│           Transport                 │
│   (HTTP/HTTPS, WebSocket, SSE)      │
└─────────────────────────────────────┘
```

## Core Components

### Messages
Structured data exchange between agents with support for:
- Multi-part content (text, files, media)
- Digital signatures for authenticity
- Context preservation for conversations
- Payment information for transactions

### Identity
Cryptographic identity system based on:
- Ed25519 public-key cryptography
- Unique agent identifiers (`snap:agent:uuid`)
- Self-sovereign identity (no central authority)
- Public key infrastructure for verification

### Discovery
Agent discovery through:
- Self-describing Agent Cards
- Registry federation
- Capability-based search
- Peer-to-peer discovery protocols

### Economics
Built-in economic layer featuring:
- SEMNET token system
- Micropayment support
- Usage-based pricing models
- Automatic payment execution

## Message Flow

```
Agent A                                    Agent B
   │                                          │
   │ 1. Discover capabilities                 │
   ├─────────── agent/discover ──────────────►│
   │◄──────────── AgentCard ──────────────────┤
   │                                          │
   │ 2. Send message with payment             │
   ├─────────── message/send ────────────────►│
   │◄────────── SNAPResponse ─────────────────┤
   │                                          │
   │ 3. Execute payment                       │
   ├────────── payment/execute ──────────────►│
   │◄──────── PaymentReceipt ─────────────────┤
```

## Extension Points

The protocol is designed to be extensible through:

### Optional Extensions
- **Streaming** - Real-time message streaming via SSE
- **Tasks** - Asynchronous task execution and status tracking
- **Memory** - Shared context and conversation history
- **Files** - Advanced file handling and processing

### Custom Extensions
- Vendor-specific capabilities
- Domain-specific message types
- Custom authentication schemes
- Specialized transport layers

## Compliance Levels

### Level 1: Basic Compliance
- JSON-RPC 2.0 transport
- Core message format
- Agent identity system
- Basic discovery (agent cards)

### Level 2: Full Compliance
- Digital signature verification
- SEMNET payment system
- Multi-modal message parts
- Registry integration

### Level 3: Extended Compliance
- Streaming support
- Task management
- Memory and context
- Custom extensions

## Benefits for Stakeholders

### Agent Developers
- Standard communication protocol
- Ready-to-use reference implementations
- Built-in monetization through payments
- Rich ecosystem of compatible agents

### Platform Providers
- Interoperability with other platforms
- Reduced integration complexity
- Access to agent marketplace
- Standard security model

### End Users
- Agent portability across platforms
- Transparent pricing and payments
- Rich multi-modal interactions
- Access to diverse agent capabilities

## Getting Started

1. **Read the Specification** - Understand core concepts and message format
2. **Choose an Implementation** - Use reference SDK or build your own
3. **Create an Agent** - Implement basic message handling
4. **Register for Discovery** - Make your agent discoverable
5. **Join the Ecosystem** - Connect with other SNAP-compatible agents

## Version History

- **v1.1.2** (2025-08-08) - Current specification
  - Core message format
  - Agent identity system
  - Basic discovery mechanism
  - SEMNET payment integration

## Next Steps

- [Transport Layer](02-transport.md) - HTTP and WebSocket communication
- [Message Format](03-messages.md) - Detailed message structure
- [Identity System](04-identity.md) - Cryptographic identity
- [Authentication](05-authentication.md) - Security and signatures
- [Discovery](06-discovery.md) - Agent cards and registries
- [Payments](07-payments.md) - SEMNET economic system