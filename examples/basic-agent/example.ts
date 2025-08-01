/**
 * Basic SNAP Protocol Example
 * 
 * This example shows how to:
 * 1. Create agent identities
 * 2. Build and sign messages
 * 3. Verify signatures
 * 4. Handle different message types
 */

import {
  AgentIdentity,
  MessageBuilder,
  MessageUtils,
  createMessage,
  verifySignature
} from '../../reference/typescript/src/index.js';

async function main() {
  console.log('🚀 SNAP Protocol Basic Example\n');

  // 1. Create two agent identities
  console.log('1. Creating agent identities...');
  const alice = AgentIdentity.generate();
  const bob = AgentIdentity.generate();

  console.log(`   Alice: ${alice.identity.id}`);
  console.log(`   Bob: ${bob.identity.id}\n`);

  // 2. Alice sends a simple text message to Bob
  console.log('2. Alice sends a text message to Bob...');
  const textMessage = createMessage(alice.exportPublic())
    .to(bob.exportPublic())
    .text('Hello Bob! This is Alice speaking.')
    .build();

  console.log(`   Message ID: ${textMessage.id}`);
  console.log(`   Content: ${MessageUtils.extractText(textMessage)[0]}\n`);

  // 3. Sign the message
  console.log('3. Alice signs the message...');
  const messageForSigning = MessageUtils.canonicalize(textMessage);
  const signature = alice.signObject(textMessage);
  
  const signedMessage = {
    ...textMessage,
    signature
  };

  console.log(`   Signature: ${signature.slice(0, 20)}...\n`);

  // 4. Bob verifies the signature
  console.log('4. Bob verifies the signature...');
  const isValid = verifySignature(
    messageForSigning,
    signature,
    alice.identity.publicKey!
  );

  console.log(`   Signature valid: ${isValid}\n`);

  // 5. Bob sends a multi-modal reply
  console.log('5. Bob sends a multi-modal reply...');
  const replyMessage = MessageUtils.reply(textMessage, bob.exportPublic())
    .text('Hi Alice! Great to hear from you.')
    .data({ 
      mood: 'happy', 
      timestamp: new Date().toISOString(),
      response_time_ms: 150
    })
    .metadata({ 
      sentiment: 'positive',
      confidence: 0.95
    })
    .build();

  console.log(`   Reply ID: ${replyMessage.id}`);
  console.log(`   Text parts: ${MessageUtils.extractText(replyMessage).length}`);
  console.log(`   Data parts: ${MessageUtils.extractData(replyMessage).length}\n`);

  // 6. Alice sends a payment request
  console.log('6. Alice requests payment for a service...');
  const paymentMessage = MessageUtils.paymentRequest(
    alice.exportPublic(),
    bob.exportPublic(),
    25,
    'Translation service: English to Spanish'
  );

  console.log(`   Payment amount: ${paymentMessage.payment?.amount} SEMNET`);
  console.log(`   Payment memo: ${paymentMessage.payment?.memo}\n`);

  // 7. Bob sends a file
  console.log('7. Bob sends a file to Alice...');
  const fileMessage = createMessage(bob.exportPublic())
    .to(alice.exportPublic())
    .text('Here\'s the document you requested.')
    .file({
      name: 'report.pdf',
      mimeType: 'application/pdf',
      uri: 'https://example.com/files/report.pdf',
      size: 1024000,
      hash: 'sha256:abcd1234...'
    }, {
      description: 'Monthly sales report'
    })
    .build();

  const files = MessageUtils.extractFiles(fileMessage);
  console.log(`   File name: ${files[0].content.name}`);
  console.log(`   File size: ${files[0].content.size} bytes`);
  console.log(`   File URI: ${files[0].content.uri}\n`);

  // 8. Demonstrate message validation
  console.log('8. Validating message structure...');
  try {
    MessageUtils.validate(fileMessage);
    console.log('   ✅ Message is valid');
  } catch (error) {
    console.log('   ❌ Message is invalid:', error);
  }

  // 9. Show message sizes
  console.log('\n9. Message size estimates:');
  console.log(`   Text message: ${MessageUtils.estimateSize(textMessage)} bytes`);
  console.log(`   Reply message: ${MessageUtils.estimateSize(replyMessage)} bytes`);
  console.log(`   Payment message: ${MessageUtils.estimateSize(paymentMessage)} bytes`);
  console.log(`   File message: ${MessageUtils.estimateSize(fileMessage)} bytes`);

  console.log('\n✨ Example completed successfully!');
}

// Run the example
main().catch(console.error);