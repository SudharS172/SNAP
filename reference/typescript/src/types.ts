import { z } from 'zod';

// ==========================================
// User Identity
// ==========================================

export const UserIDSchema = z.object({
  id: z.string().regex(/^snap:user:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
  publicKey: z.string(),
  name: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

export type UserID = z.infer<typeof UserIDSchema>;

// ==========================================
// Agent Identity
// ==========================================

export const AgentIDSchema = z.object({
  id: z.string().regex(/^snap:agent:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
  publicKey: z.string().optional(),
  registry: z.string().url().optional()
});

export type AgentID = z.infer<typeof AgentIDSchema>;

// ==========================================
// Message Parts
// ==========================================

export const TextPartSchema = z.object({
  type: z.literal('text'),
  content: z.string(),
  encoding: z.enum(['utf-8', 'base64']).optional(),
  metadata: z.object({
    format: z.enum(['plain', 'markdown', 'html']).optional(),
    language: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type TextPart = z.infer<typeof TextPartSchema>;

export const DataPartSchema = z.object({
  type: z.literal('data'),
  content: z.record(z.any()),
  schema: z.record(z.any()).optional(),
  metadata: z.object({
    format: z.enum(['json', 'xml', 'yaml']).optional(),
    encoding: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type DataPart = z.infer<typeof DataPartSchema>;

export const FilePartSchema = z.object({
  type: z.literal('file'),
  content: z.object({
    uri: z.string().url().optional(),
    bytes: z.string().optional(),
    name: z.string(),
    mimeType: z.string(),
    size: z.number().optional(),
    hash: z.string().optional()
  }).refine(data => data.uri || data.bytes, {
    message: "Either uri or bytes must be provided"
  }),
  metadata: z.object({
    description: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type FilePart = z.infer<typeof FilePartSchema>;

export const ImagePartSchema = z.object({
  type: z.literal('image'),
  content: z.object({
    uri: z.string().url().optional(),
    bytes: z.string().optional(),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
    width: z.number().optional(),
    height: z.number().optional(),
    alt: z.string().optional()
  }).refine(data => data.uri || data.bytes, {
    message: "Either uri or bytes must be provided"
  }),
  metadata: z.object({
    caption: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type ImagePart = z.infer<typeof ImagePartSchema>;

export const AudioPartSchema = z.object({
  type: z.literal('audio'),
  content: z.object({
    uri: z.string().url().optional(),
    bytes: z.string().optional(),
    mimeType: z.enum(['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']),
    duration: z.number().optional(),
    sampleRate: z.number().optional()
  }).refine(data => data.uri || data.bytes, {
    message: "Either uri or bytes must be provided"
  }),
  metadata: z.object({
    title: z.string().optional(),
    artist: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type AudioPart = z.infer<typeof AudioPartSchema>;

export const VideoPartSchema = z.object({
  type: z.literal('video'),
  content: z.object({
    uri: z.string().url().optional(),
    bytes: z.string().optional(),
    mimeType: z.enum(['video/mp4', 'video/webm', 'video/quicktime']),
    duration: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    frameRate: z.number().optional()
  }).refine(data => data.uri || data.bytes, {
    message: "Either uri or bytes must be provided"
  }),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).catchall(z.any()).optional()
});

export type VideoPart = z.infer<typeof VideoPartSchema>;

export const PartSchema = z.discriminatedUnion('type', [
  TextPartSchema,
  DataPartSchema,
  FilePartSchema,
  ImagePartSchema,
  AudioPartSchema,
  VideoPartSchema
]);

export type Part = z.infer<typeof PartSchema>;

// ==========================================
// Payment
// ==========================================

export const PaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.literal('SEMNET'),
  from: z.union([AgentIDSchema, UserIDSchema]),
  to: z.union([AgentIDSchema, UserIDSchema]),
  reference: z.string().optional(),
  memo: z.string().optional(),
  status: z.enum(['pending', 'authorized', 'executed', 'failed']).optional()
});

export type Payment = z.infer<typeof PaymentSchema>;

// ==========================================
// Core Message
// ==========================================

export const SNAPMessageSchema = z.object({
  id: z.string(),
  version: z.enum(['1.0', '1.1']).default('1.1'),
  from: z.union([AgentIDSchema, UserIDSchema]),
  to: z.union([AgentIDSchema, UserIDSchema]).optional(),
  timestamp: z.string().datetime(),
  parts: z.array(PartSchema).min(1),
  context: z.string().optional(),
  payment: PaymentSchema.optional(),
  metadata: z.record(z.any()).optional(),
  signature: z.string().optional()
});

export type SNAPMessage = z.infer<typeof SNAPMessageSchema>;

// ==========================================
// JSON-RPC 2.0 Wrapper
// ==========================================

export const JSONRPCIdSchema = z.union([z.string(), z.number(), z.null()]);
export type JSONRPCId = z.infer<typeof JSONRPCIdSchema>;

export const JSONRPCRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string(),
  params: z.record(z.any()).optional(),
  id: JSONRPCIdSchema
});

export type JSONRPCRequest = z.infer<typeof JSONRPCRequestSchema>;

export const JSONRPCErrorSchema = z.object({
  code: z.number(),
  message: z.string(),
  data: z.any().optional()
});

export type JSONRPCError = z.infer<typeof JSONRPCErrorSchema>;

export const JSONRPCResponseSchema = z.object({
  jsonrpc: z.literal('2.0'),
  result: z.any().optional(),
  error: JSONRPCErrorSchema.optional(),
  id: JSONRPCIdSchema
}).refine(data => !!(data.result !== undefined) !== !!(data.error !== undefined), {
  message: "Response must have either result or error, not both"
});

export type JSONRPCResponse = z.infer<typeof JSONRPCResponseSchema>;

// ==========================================
// Error Codes
// ==========================================

export enum SNAPErrorCode {
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

// ==========================================
// Account Linking (Optional)
// ==========================================

export const AccountLinkRequestSchema = z.object({
  userId: z.string().regex(/^snap:user:[0-9a-f-]{36}$/),
  agentId: z.string().regex(/^snap:agent:[0-9a-f-]{36}$/),
  serviceName: z.string(),
  linkingUrl: z.string().url(),
  expiresAt: z.string().datetime().optional()
});

export type AccountLinkRequest = z.infer<typeof AccountLinkRequestSchema>;

export const AccountLinkStatusSchema = z.object({
  userId: z.string(),
  agentId: z.string(),
  serviceName: z.string(),
  status: z.enum(['pending', 'linked', 'expired', 'revoked']),
  linkedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional()
});

export type AccountLinkStatus = z.infer<typeof AccountLinkStatusSchema>;

// ==========================================
// Agent Discovery
// ==========================================

export const AgentSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  inputSchema: z.record(z.any()).optional(),
  outputSchema: z.record(z.any()).optional(),
  examples: z.array(z.string()).optional(),
  pricing: z.object({
    model: z.enum(['free', 'per-request', 'per-minute', 'subscription']),
    cost: z.number().optional(),
    currency: z.literal('SEMNET').optional()
  }).optional()
});

export type AgentSkill = z.infer<typeof AgentSkillSchema>;

export const AgentCapabilitiesSchema = z.object({
  streaming: z.boolean().default(false),
  tasks: z.boolean().default(false),
  payments: z.boolean().default(false),
  files: z.boolean().default(true),
  maxFileSize: z.number().optional(),
  supportedMimeTypes: z.array(z.string()).optional()
});

export type AgentCapabilities = z.infer<typeof AgentCapabilitiesSchema>;

// Rate limiting schema (optional)
export const RateLimitSchema = z.object({
  requests: z.number().positive(),
  window: z.number().positive(), // window in seconds
  costLimit: z.number().positive().optional(), // max SEMNET credits per window
  strategy: z.enum(['fixed-window', 'sliding-window']).default('fixed-window')
});

export type RateLimit = z.infer<typeof RateLimitSchema>;

export const AgentCardSchema = z.object({
  identity: AgentIDSchema,
  name: z.string(),
  description: z.string(), // Optimized for vector search - comprehensive description
  keywords: z.array(z.string()), // For vector search optimization
  capabilities: z.array(z.string()), // Simple capability list like ["email.send", "email.read"]
  version: z.string(),
  endpoint: z.string().url(),
  skills: z.array(AgentSkillSchema).optional(), // Made optional for simpler agents
  technicalCapabilities: AgentCapabilitiesSchema.optional(), // Renamed for clarity
  pricing: z.object({
    model: z.enum(['free', 'per-request', 'per-minute', 'subscription']),
    cost: z.number().optional(),
    currency: z.literal('SEMNET').optional()
  }).optional(),
  rateLimit: RateLimitSchema.optional(), // Optional rate limiting
  requiresAccountLink: z.boolean().default(false), // Does this agent need account linking?
  metadata: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    homepage: z.string().url().optional(),
    documentation: z.string().url().optional()
  }).optional()
});

export type AgentCard = z.infer<typeof AgentCardSchema>;

// ==========================================
// Task System
// ==========================================

export enum TaskStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',  
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export const TaskSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(TaskStatus),
  progress: z.number().min(0).max(1).optional(), // 0.0 to 1.0
  message: z.string().optional(), // Human readable status
  result: SNAPMessageSchema.optional(), // Final result when complete
  error: z.string().optional(), // Error message if failed
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  estimatedCompletion: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

export type Task = z.infer<typeof TaskSchema>;

export const TaskCreateRequestSchema = z.object({
  message: SNAPMessageSchema,
  callback: z.string().url().optional(), // Webhook URL for status updates
  timeout: z.number().optional(), // Timeout in seconds
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  metadata: z.record(z.any()).optional()
});

export type TaskCreateRequest = z.infer<typeof TaskCreateRequestSchema>;

export const TaskUpdateSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  progress: z.number().min(0).max(1).optional(),
  message: z.string().optional(),
  result: SNAPMessageSchema.optional(),
  error: z.string().optional(),
  estimatedCompletion: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional()
});

export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

// ==========================================
// Streaming System
// ==========================================

export enum StreamEventType {
  MESSAGE = 'message',
  STATUS = 'status', 
  PROGRESS = 'progress',
  ERROR = 'error',
  COMPLETE = 'complete',
  CONVERSATION = 'conversation'
}

// Base stream event schema
export const BaseStreamEventSchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional()
});

// Status stream event - shows what agent is doing
export const StatusStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('status'),
  data: z.object({
    streamId: z.string(),
    status: z.enum(['active', 'paused', 'cancelled']),
    currentAction: z.string(), // "Searching for flights..."
    progress: z.number().min(0).max(1).optional() // 0.5 = 50% done
  })
});

// Conversation stream event - shows agent-to-agent messages
export const ConversationStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('conversation'),
  data: z.object({
    streamId: z.string(),
    direction: z.enum(['outgoing', 'incoming']), // from user's perspective
    from: z.union([AgentIDSchema, UserIDSchema]),
    to: z.union([AgentIDSchema, UserIDSchema]),
    message: SNAPMessageSchema, // The actual SNAP message
    latency: z.number().optional(), // Response time in ms
    cost: z.number().optional() // Cost of this interaction
  })
});

// Progress stream event
export const ProgressStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('progress'),
  data: z.object({
    streamId: z.string(),
    progress: z.number().min(0).max(1),
    message: z.string().optional()
  })
});

// Error stream event
export const ErrorStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('error'),
  data: z.object({
    streamId: z.string(),
    code: z.number(),
    message: z.string(),
    details: z.any().optional()
  })
});

// Message stream event
export const MessageStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('message'),
  data: SNAPMessageSchema
});

// Complete stream event
export const CompleteStreamEventSchema = BaseStreamEventSchema.extend({
  type: z.literal('complete'),
  data: z.object({
    streamId: z.string(),
    result: z.any().optional(),
    summary: z.string().optional()
  })
});

// Union of all stream events
export const StreamEventSchema = z.discriminatedUnion('type', [
  StatusStreamEventSchema,
  ConversationStreamEventSchema,
  ProgressStreamEventSchema,
  ErrorStreamEventSchema,
  MessageStreamEventSchema,
  CompleteStreamEventSchema
]);

export type StreamEvent = z.infer<typeof StreamEventSchema>;
export type StatusStreamEvent = z.infer<typeof StatusStreamEventSchema>;
export type ConversationStreamEvent = z.infer<typeof ConversationStreamEventSchema>;

// Stream subscription schema - for subscribing to conversation streams
export const StreamSubscriptionSchema = z.object({
  userId: z.string().regex(/^snap:user:[0-9a-f-]{36}$/), // User subscribing
  streamTypes: z.array(z.enum([
    'conversations', // Agent-to-agent messages
    'status',        // What agent is doing
    'progress',      // Progress updates
    'errors'         // Problems that occur
  ])),
  filter: z.object({
    agents: z.array(z.string()).optional(), // Only these agents
    excludeAgents: z.array(z.string()).optional(), // Not these
    minCost: z.number().optional(), // Only show interactions above this cost
    maxCost: z.number().optional() // Only show interactions below this cost
  }).optional()
});

export type StreamSubscription = z.infer<typeof StreamSubscriptionSchema>;

// ==========================================
// Extended JSON-RPC Methods
// ==========================================

export const SNAPMethodSchema = z.enum([
  // Core message methods
  'message/send',
  'message/stream',
  
  // Agent discovery
  'agent/discover',
  'agent/register',
  'agent/update',
  'agent/remove',
  
  // Account linking methods (optional)
  'account/link',        // Request account linking
  'account/status',      // Check link status
  'account/revoke',      // Revoke account link
  
  // Task methods
  'task/create',
  'task/status',
  'task/update',
  'task/cancel',
  'task/list',
  
  // Payment methods
  'payment/authorize',
  'payment/execute',
  'payment/status',
  'payment/refund',
  
  // Stream methods
  'stream/start',
  'stream/send',
  'stream/end',
  'stream/subscribe',    // Subscribe to conversation streams
  'stream/unsubscribe',  // Unsubscribe from streams
  'stream/filter',       // Update stream filters
  'stream/pause',        // Pause a stream
  'stream/resume'        // Resume a stream
]);

export type SNAPMethod = z.infer<typeof SNAPMethodSchema>;