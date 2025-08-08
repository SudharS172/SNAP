# SNAP Protocol v1.1.2 - Message Format

## Core Message Structure

All SNAP messages are transported using JSON-RPC 2.0 and follow this structure:

```typescript
interface SNAPMessage {
  id: string;           // Unique message identifier
  version: "1.1";       // Protocol version
  from: AgentID;        // Sender identity
  to?: AgentID;         // Optional recipient (for routing)
  timestamp: string;    // ISO 8601 timestamp
  parts: Part[];        // Multi-modal content array
  context?: string;     // Conversation context ID
  payment?: Payment;    // Payment information
  metadata?: object;    // Additional metadata
  signature?: string;   // Digital signature (optional)
}
```

## Agent Identity

```typescript
interface AgentID {
  id: string;          // Format: "snap:agent:uuid"
  publicKey?: string;  // Ed25519 public key (for verification)
  registry?: string;   // Registry URL (for discovery)
}
```

### Agent ID Format
```
snap:agent:01234567-89ab-cdef-0123-456789abcdef
```

## Message Parts

### Text Part
```typescript
interface TextPart {
  type: "text";
  content: string;
  encoding?: "utf-8" | "base64";
  metadata?: {
    format?: "plain" | "markdown" | "html";
    language?: string;      // ISO 639-1 language code
    [key: string]: any;
  };
}
```

### Data Part
```typescript
interface DataPart {
  type: "data";
  content: object;
  schema?: object;        // JSON Schema for validation
  metadata?: {
    format?: "json" | "xml" | "yaml";
    encoding?: string;
    [key: string]: any;
  };
}
```

### File Part
```typescript
interface FilePart {
  type: "file";
  content: {
    uri?: string;         // URL to file
    bytes?: string;       // Base64 encoded file data
    name: string;         // File name
    mimeType: string;     // MIME type
    size?: number;        // File size in bytes
    hash?: string;        // SHA-256 hash for integrity
  };
  metadata?: {
    description?: string;
    [key: string]: any;
  };
}
```

### Image Part
```typescript
interface ImagePart {
  type: "image";
  content: {
    uri?: string;
    bytes?: string;       // Base64 encoded
    mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    width?: number;
    height?: number;
    alt?: string;         // Alt text for accessibility
  };
  metadata?: {
    caption?: string;
    [key: string]: any;
  };
}
```

### Audio Part
```typescript
interface AudioPart {
  type: "audio";
  content: {
    uri?: string;
    bytes?: string;       // Base64 encoded
    mimeType: "audio/mpeg" | "audio/wav" | "audio/ogg" | "audio/webm";
    duration?: number;    // Duration in seconds
    sampleRate?: number;  // Sample rate in Hz
  };
  metadata?: {
    title?: string;
    artist?: string;
    [key: string]: any;
  };
}
```

### Video Part
```typescript
interface VideoPart {
  type: "video";
  content: {
    uri?: string;
    bytes?: string;       // Base64 encoded
    mimeType: "video/mp4" | "video/webm" | "video/quicktime";
    duration?: number;    // Duration in seconds
    width?: number;
    height?: number;
    frameRate?: number;   // Frames per second
  };
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}
```

## Payment Information

```typescript
interface Payment {
  amount: number;          // Amount in SEMNET tokens
  currency: "SEMNET";      // Currency type
  from: AgentID;          // Payer agent
  to: AgentID;            // Payee agent
  reference?: string;     // Payment reference/invoice
  memo?: string;          // Payment description
  status?: "pending" | "authorized" | "executed" | "failed";
}
```

## JSON-RPC 2.0 Wrapper

SNAP messages are transported using JSON-RPC 2.0:

### Request Format
```json
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "id": "msg_12345",
      "version": "1.1",
      "from": {
        "id": "snap:agent:sender-uuid"
      },
      "timestamp": "2025-01-01T12:00:00Z",
      "parts": [
        {
          "type": "text",
          "content": "Hello, world!"
        }
      ]
    }
  },
  "id": "req_67890"
}
```

### Response Format
```json
{
  "jsonrpc": "2.0",
  "result": {
    "message": {
      "id": "msg_54321",
      "version": "1.1",
      "from": {
        "id": "snap:agent:receiver-uuid"
      },
      "timestamp": "2025-01-01T12:00:01Z",
      "parts": [
        {
          "type": "text",
          "content": "Hello back!"
        }
      ]
    }
  },
  "id": "req_67890"
}
```

## Error Handling

SNAP uses JSON-RPC 2.0 error codes plus custom error codes:

```typescript
enum SNAPErrorCode {
  // JSON-RPC 2.0 Standard Errors
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
  
  // SNAP-specific Errors (-32000 to -32099)
  AGENT_NOT_FOUND = -32001,
  INVALID_SIGNATURE = -32002,
  PAYMENT_REQUIRED = -32003,
  INSUFFICIENT_FUNDS = -32004,
  UNSUPPORTED_CONTENT_TYPE = -32005,
  RATE_LIMITED = -32006,
  AGENT_UNAVAILABLE = -32007,
  CONTEXT_NOT_FOUND = -32008,
  INVALID_AGENT_ID = -32009,
  REGISTRY_ERROR = -32010
}
```

### Error Response Example
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32003,
    "message": "Payment required",
    "data": {
      "required_amount": 10,
      "currency": "SEMNET",
      "payment_address": "snap:agent:service-uuid"
    }
  },
  "id": "req_67890"
}
```

## Message Validation

### Required Fields
- `id` - Must be unique per sender
- `version` - Must be "1.1"
- `from` - Valid agent ID
- `timestamp` - Valid ISO 8601 timestamp
- `parts` - Non-empty array of valid parts

### Optional Fields
- `to` - For direct addressing
- `context` - For conversation continuity
- `payment` - For economic transactions
- `metadata` - For additional information
- `signature` - For message authentication

### Validation Rules
1. **Message ID**: Must be unique within sender's namespace
2. **Timestamp**: Must be within reasonable time bounds (±5 minutes)
3. **Parts**: At least one part required, all parts must be valid
4. **Signature**: If present, must be valid Ed25519 signature
5. **Payment**: If present, amounts must be positive

## Content Type Guidelines

### Text Content
- Use UTF-8 encoding
- Support markdown for rich formatting
- Include language hints for multi-lingual content

### Binary Content
- Prefer URIs over embedded bytes for large files
- Include integrity hashes for verification
- Respect MIME type conventions

### Structured Data
- Use JSON Schema for validation when possible
- Include format hints (JSON, XML, YAML)
- Preserve type information

## Message Size Limits

### Recommended Limits
- **Text Parts**: 1MB per part
- **Data Parts**: 10MB per part
- **File Parts**: 100MB per part (prefer URIs for larger files)
- **Media Parts**: 50MB per part (prefer URIs for larger files)
- **Total Message**: 100MB maximum

### Large Content Handling
For content exceeding size limits:
1. Upload to accessible URI
2. Reference via URI in message part
3. Include integrity hash for verification
4. Consider using chunked transfer for streaming

## Examples

### Simple Text Message
```json
{
  "id": "msg_001",
  "version": "1.1",
  "from": {"id": "snap:agent:chatbot"},
  "timestamp": "2025-01-01T12:00:00Z",
  "parts": [
    {
      "type": "text",
      "content": "How can I help you today?"
    }
  ]
}
```

### Multi-Modal Message
```json
{
  "id": "msg_002",
  "version": "1.1",
  "from": {"id": "snap:agent:designer"},
  "timestamp": "2025-01-01T12:00:00Z",
  "parts": [
    {
      "type": "text",
      "content": "Here's your logo design:"
    },
    {
      "type": "image",
      "content": {
        "uri": "https://example.com/logo.png",
        "mimeType": "image/png",
        "alt": "Company logo with blue background"
      }
    }
  ]
}
```

### Payment Request
```json
{
  "id": "msg_003",
  "version": "1.1",
  "from": {"id": "snap:agent:translator"},
  "timestamp": "2025-01-01T12:00:00Z",
  "parts": [
    {
      "type": "text",
      "content": "Translation complete. Please authorize payment."
    }
  ],
  "payment": {
    "amount": 25,
    "currency": "SEMNET",
    "from": {"id": "snap:agent:user"},
    "to": {"id": "snap:agent:translator"},
    "memo": "Document translation service"
  }
}
```

## Best Practices

### Message Design
1. **Be Specific**: Include enough context for agents to understand intent
2. **Use Metadata**: Provide additional context through metadata fields
3. **Handle Errors**: Always include error handling for failed messages
4. **Validate Content**: Verify message structure before processing

### Performance
1. **Batch Related Parts**: Group related content in single message
2. **Use URIs**: Reference large files instead of embedding
3. **Compress Data**: Use appropriate compression for large content
4. **Cache Responses**: Cache frequently accessed content

### Security
1. **Sign Messages**: Use digital signatures for important communications
2. **Validate Inputs**: Always validate incoming message content
3. **Rate Limit**: Implement rate limiting to prevent abuse
4. **Audit Trail**: Log important message exchanges

## Implementation Notes

### TypeScript Example
```typescript
import { SNAPMessage, TextPart } from '@snap-protocol/core';

const message: SNAPMessage = {
  id: `msg_${Date.now()}`,
  version: "1.0",
  from: { id: "snap:agent:my-bot" },
  timestamp: new Date().toISOString(),
  parts: [
    {
      type: "text",
      content: "Hello from TypeScript!"
    } as TextPart
  ]
};
```

### Python Example
```python
from snap_protocol import SNAPMessage, TextPart
from datetime import datetime
import uuid

message = SNAPMessage(
    id=f"msg_{uuid.uuid4()}",
    version="1.0",
    from_={"id": "snap:agent:my-bot"},
    timestamp=datetime.utcnow().isoformat() + "Z",
    parts=[
        TextPart(
            type="text",
            content="Hello from Python!"
        )
    ]
)
```

## Next Steps

- [Identity System](04-identity.md) - Cryptographic agent identity
- [Authentication](05-authentication.md) - Message signing and verification
- [Discovery](06-discovery.md) - Agent cards and registries
- [Payments](07-payments.md) - SEMNET economic system