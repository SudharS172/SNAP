/**
 * @fileoverview SNAP Protocol TypeScript Reference Implementation
 * @version 1.0.0
 * @license MIT
 */

// Export all types
export * from './types.js';

// Export identity utilities
export * from './identity.js';

// Export message utilities
export * from './message.js';

// Export task system
export * from './task.js';

// Re-export commonly used functions for convenience
export {
  // Identity
  generateAgentIdentity,
  AgentIdentity,
  generateMessageId,
  generateContextId,
  validateAgentId,
  
  // Cryptography
  signMessage,
  verifySignature,
  hashContent
} from './identity.js';

export {
  // Message building
  MessageBuilder,
  MessageUtils,
  createMessage
} from './message.js';

// MessageBuilder, MessageUtils, createMessage are already exported above from identity.js

// Version constant
export const SNAP_VERSION = '1.0' as const;

// Protocol constants
export const PROTOCOL_PREFIX = 'snap:agent:' as const;

/**
 * Utility function to check if an object looks like a SNAP message
 */
export function isSNAPMessage(obj: any): boolean {
  return obj && 
         typeof obj.id === 'string' &&
         obj.version === '1.0' &&
         obj.from &&
         obj.timestamp &&
         Array.isArray(obj.parts) &&
         obj.parts.length > 0;
}

/**
 * Utility function to get the protocol version
 */
export function getProtocolVersion(): string {
  return SNAP_VERSION;
}

/**
 * Utility function to create an agent ID from UUID
 */
export function createAgentId(uuid: string): string {
  return `${PROTOCOL_PREFIX}${uuid}`;
}