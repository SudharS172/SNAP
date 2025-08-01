import nacl from 'tweetnacl';
const { sign, verify, box, randomBytes } = nacl;
import { nanoid } from 'nanoid';
import type { AgentID } from './types.js';

/**
 * Generate a new agent identity with Ed25519 keypair
 */
export function generateAgentIdentity(): {
  identity: AgentID;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} {
  const keypair = sign.keyPair();
  const uuid = generateUUID();
  
  return {
    identity: {
      id: `snap:agent:${uuid}`,
      publicKey: encodeBase64(keypair.publicKey)
    },
    privateKey: keypair.secretKey,
    publicKey: keypair.publicKey
  };
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  const bytes = randomBytes(16);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  // Format as UUID string
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generate a unique message ID
 */
export function generateMessageId(): string {
  return `msg_${nanoid()}`;
}

/**
 * Generate a unique context ID
 */
export function generateContextId(): string {
  return `ctx_${nanoid()}`;
}

/**
 * Sign a message with Ed25519 private key
 */
export function signMessage(message: string, privateKey: Uint8Array): string {
  const messageBytes = new TextEncoder().encode(message);
  const signature = sign.detached(messageBytes, privateKey);
  return encodeBase64(signature);
}

/**
 * Verify a message signature with Ed25519 public key
 */
export function verifySignature(
  message: string, 
  signature: string, 
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = decodeBase64(signature);
    const publicKeyBytes = decodeBase64(publicKey);
    
    return sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

/**
 * Validate agent ID format
 */
export function validateAgentId(id: string): boolean {
  const regex = /^snap:agent:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return regex.test(id);
}

/**
 * Extract UUID from agent ID
 */
export function extractUUID(agentId: string): string | null {
  const match = agentId.match(/^snap:agent:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/);
  return match ? match[1] : null;
}

/**
 * Encode bytes to base64
 */
export function encodeBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

/**
 * Decode base64 to bytes
 */
export function decodeBase64(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

/**
 * Hash content using SHA-256
 */
export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return encodeBase64(hashArray);
}

/**
 * Generate a secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  const bytes = randomBytes(length);
  return encodeBase64(bytes).slice(0, length);
}

/**
 * Create a canonical string representation of an object for signing
 */
export function canonicalizeObject(obj: any): string {
  // Sort keys recursively and stringify
  const sortedObj = sortKeysRecursive(obj);
  return JSON.stringify(sortedObj);
}

function sortKeysRecursive(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortKeysRecursive);
  }
  
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  
  for (const key of keys) {
    sorted[key] = sortKeysRecursive(obj[key]);
  }
  
  return sorted;
}

/**
 * Agent identity utilities
 */
export class AgentIdentity {
  constructor(
    public readonly identity: AgentID,
    private readonly privateKey: Uint8Array,
    public readonly publicKey: Uint8Array
  ) {}

  /**
   * Sign a message with this agent's private key
   */
  sign(message: string): string {
    return signMessage(message, this.privateKey);
  }

  /**
   * Sign an object by creating canonical representation
   */
  signObject(obj: any): string {
    const canonical = canonicalizeObject(obj);
    return this.sign(canonical);
  }

  /**
   * Export public identity (safe to share)
   */
  exportPublic(): AgentID {
    return {
      ...this.identity,
      publicKey: encodeBase64(this.publicKey)
    };
  }

  /**
   * Export private key (keep secure!)
   */
  exportPrivateKey(): string {
    return encodeBase64(this.privateKey);
  }

  /**
   * Import agent identity from private key
   */
  static fromPrivateKey(identity: AgentID, privateKeyBase64: string): AgentIdentity {
    const privateKey = decodeBase64(privateKeyBase64);
    
    // Extract public key from private key (Ed25519 property)
    const publicKey = privateKey.slice(32);
    
    return new AgentIdentity(identity, privateKey, publicKey);
  }

  /**
   * Generate new agent identity
   */
  static generate(): AgentIdentity {
    const { identity, privateKey, publicKey } = generateAgentIdentity();
    return new AgentIdentity(identity, privateKey, publicKey);
  }
}