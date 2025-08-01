# SNAP Protocol - TypeScript Reference Implementation

Official TypeScript implementation of the SNAP Protocol v1.0.

## Installation

```bash
npm install @snap-protocol/core
```

## Quick Start

```typescript
import { AgentIdentity, createMessage } from '@snap-protocol/core';

// Create an agent identity
const agent = AgentIdentity.generate();
console.log(`Agent ID: ${agent.identity.id}`);

// Build a message
const message = createMessage(agent.exportPublic())
  .text('Hello, world!')
  .data({ timestamp: new Date().toISOString() })
  .build();

// Sign the message
const signature = agent.signObject(message);
console.log(`Signature: ${signature}`);
```

## Features

- ✅ **Complete Type Safety** - Full TypeScript support with Zod validation
- ✅ **Cryptographic Identity** - Ed25519 keypair generation and management
- ✅ **Message Building** - Fluent API for creating multi-modal messages
- ✅ **Digital Signatures** - Sign and verify messages
- ✅ **Multi-Modal Content** - Text, data, files, images, audio, video
- ✅ **Payment Support** - Built-in SEMNET payment integration
- ✅ **Validation** - Schema validation for all message types

## API Reference

### Agent Identity

```typescript
import { AgentIdentity, generateAgentIdentity } from '@snap-protocol/core';

// Generate a new identity
const agent = AgentIdentity.generate();

// Or create from existing private key
const agent2 = AgentIdentity.fromPrivateKey(
  { id: 'snap:agent:...', publicKey: '...' },
  'base64-encoded-private-key'
);

// Sign messages
const signature = agent.sign('message content');
const signature2 = agent.signObject({ some: 'data' });
```

### Message Building

```typescript
import { createMessage, MessageUtils } from '@snap-protocol/core';

const message = createMessage(agent.exportPublic())
  .to(recipientAgent.exportPublic())
  .context('conversation-context-id')
  .text('Hello!', { format: 'plain', language: 'en' })
  .data({ key: 'value' }, { schema: jsonSchema })
  .file({
    name: 'document.pdf',
    mimeType: 'application/pdf',
    uri: 'https://example.com/doc.pdf'
  })
  .image({
    uri: 'https://example.com/image.jpg',
    mimeType: 'image/jpeg',
    alt: 'Description'
  })
  .payment({
    amount: 10,
    currency: 'SEMNET',
    from: payer,
    to: payee,
    memo: 'Service payment'
  })
  .metadata({ custom: 'data' })
  .build();
```

### Message Utilities

```typescript
import { MessageUtils } from '@snap-protocol/core';

// Extract content
const textParts = MessageUtils.extractText(message);
const dataParts = MessageUtils.extractData(message);
const files = MessageUtils.extractFiles(message);
const images = MessageUtils.extractImages(message);

// Check message properties
const hasPayment = MessageUtils.hasPayment(message);
const paymentAmount = MessageUtils.getPaymentAmount(message);
const hasContext = MessageUtils.hasContext(message);

// Validate messages
const validMessage = MessageUtils.validate(messageObject);

// Create replies
const reply = MessageUtils.reply(originalMessage, myAgent.exportPublic())
  .text('Thanks for your message!')
  .build();

// Create payment requests
const paymentRequest = MessageUtils.paymentRequest(
  seller, buyer, 100, 'Service description'
);
```

### Cryptography

```typescript
import { 
  signMessage, 
  verifySignature, 
  hashContent,
  generateMessageId,
  generateContextId 
} from '@snap-protocol/core';

// Sign and verify
const signature = signMessage('content', privateKey);
const isValid = verifySignature('content', signature, publicKey);

// Hashing
const hash = await hashContent('data to hash');

// ID generation
const messageId = generateMessageId(); // msg_...
const contextId = generateContextId(); // ctx_...
```

## Message Types

### Text Message
```typescript
const message = createMessage(sender)
  .text('Hello, world!', {
    format: 'markdown',
    language: 'en'
  })
  .build();
```

### Data Message
```typescript
const message = createMessage(sender)
  .data({
    action: 'process',
    parameters: { key: 'value' }
  }, {
    schema: jsonSchema
  })
  .build();
```

### File Message
```typescript
const message = createMessage(sender)
  .file({
    name: 'document.pdf',
    mimeType: 'application/pdf',
    uri: 'https://example.com/doc.pdf',
    size: 1024000,
    hash: 'sha256:...'
  }, {
    description: 'Important document'
  })
  .build();
```

### Multi-Modal Message
```typescript
const message = createMessage(sender)
  .text('Check out this image:')
  .image({
    uri: 'https://example.com/photo.jpg',
    mimeType: 'image/jpeg',
    alt: 'Beautiful sunset'
  }, {
    caption: 'Taken yesterday evening'
  })
  .data({
    location: { lat: 40.7128, lng: -74.0060 },
    timestamp: '2025-01-01T18:30:00Z'
  })
  .build();
```

## Error Handling

```typescript
import { SNAPErrorCode } from '@snap-protocol/core';

try {
  const message = MessageUtils.validate(untrustedMessage);
  // Process valid message
} catch (error) {
  if (error.code === SNAPErrorCode.INVALID_SIGNATURE) {
    console.log('Invalid signature');
  } else if (error.code === SNAPErrorCode.PAYMENT_REQUIRED) {
    console.log('Payment required');
  }
  // Handle other errors
}
```

## Examples

See the [examples directory](../../examples/) for complete working examples:

- [Basic Agent](../../examples/basic-agent/) - Simple agent communication
- [Payment Flow](../../examples/payment-flow/) - Payment processing
- [Multi-Modal](../../examples/multi-modal/) - Rich content handling

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

## License

MIT - see [LICENSE](../../LICENSE) for details.