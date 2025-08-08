# SNAP Protocol Changelog

## Version 1.1.2 - Agent Internet Edition (2025-08-08)

### Major Features

#### 🆕 User Identity System
- Added `UserID` schema for human users in the agent network
- Users can now send/receive messages and make payments
- Messages support both agent-to-agent and user-to-agent communication

#### 🎥 Conversation Streaming
- New `ConversationStreamEvent` for real-time visibility into agent communications
- Users can watch their AI agents work in real-time
- Track latency and costs per interaction
- Stream filters to control what users see

#### 📊 Enhanced Status Streaming  
- Better status events showing what agents are doing
- Progress tracking (0-100%) for long operations
- Current action descriptions ("Searching for flights...")
- Pause/cancel capabilities

#### 🔗 Account Linking (Optional)
- Agents can request to link user accounts (Gmail, Amazon, etc)
- Link status tracking (pending, linked, expired, revoked)
- Enables agents to access existing user services

#### 🔍 Vector Search Optimization
- Redesigned AgentCard for better vector search
- Single comprehensive description field
- Keywords array for search optimization  
- Simplified capabilities list

#### 🚦 Rate Limiting (Optional)
- Agents can declare rate limits
- Request limits per time window
- Cost limits in SEMNET credits
- Fixed or sliding window strategies

### API Changes

#### New Types
- `UserIDSchema` - User identity
- `AccountLinkRequestSchema` - Account linking requests
- `AccountLinkStatusSchema` - Link status tracking
- `RateLimitSchema` - Rate limiting configuration
- `ConversationStreamEventSchema` - Agent conversation events
- `StreamSubscriptionSchema` - Stream subscription management

#### Updated Types
- `SNAPMessageSchema` - Now supports version "1.0" or "1.1"
- `AgentCardSchema` - Added keywords, simplified capabilities, rate limits
- `PaymentSchema` - Supports user-to-agent payments
- `StreamEventSchema` - Added conversation event type

#### New Methods
- `account/link` - Request account linking
- `account/status` - Check link status  
- `account/revoke` - Revoke account access
- `stream/subscribe` - Subscribe to conversations
- `stream/filter` - Update stream filters

### Breaking Changes
- None - Full backward compatibility with v1.0

### Migration Guide
- Existing v1.0 agents continue to work
- To use new features, update version to "1.1" in messages
- Add keywords and update description for better search
- Implement account linking only if needed