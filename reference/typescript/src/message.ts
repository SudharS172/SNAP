import type { 
  SNAPMessage, 
  Part, 
  AgentID, 
  Payment,
  TextPart,
  DataPart,
  FilePart,
  ImagePart,
  AudioPart,
  VideoPart
} from './types.js';
import { SNAPMessageSchema } from './types.js';
import { generateMessageId, canonicalizeObject } from './identity.js';

/**
 * Message builder for creating SNAP messages
 */
export class MessageBuilder {
  private message: Partial<SNAPMessage>;

  constructor(from: AgentID) {
    this.message = {
      id: generateMessageId(),
      version: '1.0',
      from,
      timestamp: new Date().toISOString(),
      parts: []
    };
  }

  /**
   * Set the recipient agent
   */
  to(recipient: AgentID): this {
    this.message.to = recipient;
    return this;
  }

  /**
   * Set conversation context
   */
  context(contextId: string): this {
    this.message.context = contextId;
    return this;
  }

  /**
   * Add payment information
   */
  payment(payment: Payment): this {
    this.message.payment = payment;
    return this;
  }

  /**
   * Add metadata
   */
  metadata(metadata: Record<string, any>): this {
    this.message.metadata = { ...this.message.metadata, ...metadata };
    return this;
  }

  /**
   * Add a text part
   */
  text(content: string, options?: {
    format?: 'plain' | 'markdown' | 'html';
    language?: string;
    encoding?: 'utf-8' | 'base64';
  }): this {
    const part: TextPart = {
      type: 'text',
      content,
      ...(options?.encoding && { encoding: options.encoding }),
      ...(options && {
        metadata: {
          ...(options.format && { format: options.format }),
          ...(options.language && { language: options.language })
        }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add a data part
   */
  data(content: Record<string, any>, options?: {
    schema?: Record<string, any>;
    format?: 'json' | 'xml' | 'yaml';
  }): this {
    const part: DataPart = {
      type: 'data',
      content,
      ...(options?.schema && { schema: options.schema }),
      ...(options?.format && {
        metadata: { format: options.format }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add a file part
   */
  file(content: {
    uri?: string;
    bytes?: string;
    name: string;
    mimeType: string;
    size?: number;
    hash?: string;
  }, options?: {
    description?: string;
  }): this {
    const part: FilePart = {
      type: 'file',
      content,
      ...(options?.description && {
        metadata: { description: options.description }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add an image part
   */
  image(content: {
    uri?: string;
    bytes?: string;
    mimeType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    width?: number;
    height?: number;
    alt?: string;
  }, options?: {
    caption?: string;
  }): this {
    const part: ImagePart = {
      type: 'image',
      content,
      ...(options?.caption && {
        metadata: { caption: options.caption }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add an audio part
   */
  audio(content: {
    uri?: string;
    bytes?: string;
    mimeType: 'audio/mpeg' | 'audio/wav' | 'audio/ogg' | 'audio/webm';
    duration?: number;
    sampleRate?: number;
  }, options?: {
    title?: string;
    artist?: string;
  }): this {
    const part: AudioPart = {
      type: 'audio',
      content,
      ...(options && {
        metadata: {
          ...(options.title && { title: options.title }),
          ...(options.artist && { artist: options.artist })
        }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add a video part
   */
  video(content: {
    uri?: string;
    bytes?: string;
    mimeType: 'video/mp4' | 'video/webm' | 'video/quicktime';
    duration?: number;
    width?: number;
    height?: number;
    frameRate?: number;
  }, options?: {
    title?: string;
    description?: string;
  }): this {
    const part: VideoPart = {
      type: 'video',
      content,
      ...(options && {
        metadata: {
          ...(options.title && { title: options.title }),
          ...(options.description && { description: options.description })
        }
      })
    };
    
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Add a custom part
   */
  part(part: Part): this {
    this.message.parts!.push(part);
    return this;
  }

  /**
   * Set custom message ID
   */
  id(messageId: string): this {
    this.message.id = messageId;
    return this;
  }

  /**
   * Set custom timestamp
   */
  timestamp(timestamp: string): this {
    this.message.timestamp = timestamp;
    return this;
  }

  /**
   * Build and validate the message
   */
  build(): SNAPMessage {
    if (!this.message.parts || this.message.parts.length === 0) {
      throw new Error('Message must have at least one part');
    }

    const result = SNAPMessageSchema.parse(this.message);
    return result;
  }

  /**
   * Build message for signing (without signature field)
   */
  buildForSigning(): Omit<SNAPMessage, 'signature'> {
    const message = this.build();
    const { signature, ...messageForSigning } = message;
    return messageForSigning;
  }
}

/**
 * Message utilities
 */
export class MessageUtils {
  /**
   * Create a simple text message
   */
  static text(from: AgentID, content: string, to?: AgentID): SNAPMessage {
    const builder = new MessageBuilder(from).text(content);
    if (to) builder.to(to);
    return builder.build();
  }

  /**
   * Create a data message
   */
  static data(from: AgentID, content: Record<string, any>, to?: AgentID): SNAPMessage {
    const builder = new MessageBuilder(from).data(content);
    if (to) builder.to(to);
    return builder.build();
  }

  /**
   * Create an error response message
   */
  static error(from: AgentID, errorMessage: string, to?: AgentID): SNAPMessage {
    const builder = new MessageBuilder(from)
      .text(`Error: ${errorMessage}`)
      .metadata({ type: 'error' });
    
    if (to) builder.to(to);
    return builder.build();
  }

  /**
   * Extract text content from message parts
   */
  static extractText(message: SNAPMessage): string[] {
    return message.parts
      .filter((part): part is TextPart => part.type === 'text')
      .map(part => part.content);
  }

  /**
   * Extract data content from message parts
   */
  static extractData(message: SNAPMessage): Record<string, any>[] {
    return message.parts
      .filter((part): part is DataPart => part.type === 'data')
      .map(part => part.content);
  }

  /**
   * Get all file parts from message
   */
  static extractFiles(message: SNAPMessage): FilePart[] {
    return message.parts.filter((part): part is FilePart => part.type === 'file');
  }

  /**
   * Get all image parts from message
   */
  static extractImages(message: SNAPMessage): ImagePart[] {
    return message.parts.filter((part): part is ImagePart => part.type === 'image');
  }

  /**
   * Check if message has payment
   */
  static hasPayment(message: SNAPMessage): boolean {
    return !!message.payment;
  }

  /**
   * Get payment amount from message
   */
  static getPaymentAmount(message: SNAPMessage): number | null {
    return message.payment?.amount ?? null;
  }

  /**
   * Check if message is in a conversation context
   */
  static hasContext(message: SNAPMessage): boolean {
    return !!message.context;
  }

  /**
   * Get message size estimate in bytes
   */
  static estimateSize(message: SNAPMessage): number {
    return new Blob([JSON.stringify(message)]).size;
  }

  /**
   * Validate message structure
   */
  static validate(message: any): SNAPMessage {
    return SNAPMessageSchema.parse(message);
  }

  /**
   * Create canonical representation for signing
   */
  static canonicalize(message: Omit<SNAPMessage, 'signature'>): string {
    return canonicalizeObject(message);
  }

  /**
   * Check if message is expired (based on timestamp)
   */
  static isExpired(message: SNAPMessage, maxAgeMinutes: number = 5): boolean {
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return diffMinutes > maxAgeMinutes;
  }

  /**
   * Create a reply message
   */
  static reply(originalMessage: SNAPMessage, from: AgentID): MessageBuilder {
    return new MessageBuilder(from)
      .to(originalMessage.from)
      .context(originalMessage.context || originalMessage.id)
      .metadata({ 
        replyTo: originalMessage.id,
        type: 'reply'
      });
  }

  /**
   * Create a payment request message
   */
  static paymentRequest(
    from: AgentID, 
    to: AgentID, 
    amount: number, 
    description: string
  ): SNAPMessage {
    return new MessageBuilder(from)
      .to(to)
      .text(description)
      .payment({
        amount,
        currency: 'SEMNET',
        from: to,
        to: from,
        memo: description,
        status: 'pending'
      })
      .metadata({ type: 'payment-request' })
      .build();
  }
}

/**
 * Convenience function to create a message builder
 */
export function createMessage(from: AgentID): MessageBuilder {
  return new MessageBuilder(from);
}