import { EntityRepository, Repository } from 'typeorm';
import { Message } from './messages.entity';
import { User } from 'src/auth/user.entity';
import {
  aesDecrypt,
  aesEncrypt,
  rsaDecryptAESKey,
  rsaEncryptAESKey,
  signMessage,
  verifySignature,
} from '../utils/utils';

@EntityRepository(Message)
export class MessageRepository extends Repository<Message> {
  async createMessage(
    senderId: number,
    receiverId: number,
    message: string,
  ): Promise<Message> {
    const sender = await User.createQueryBuilder('user')
      .where('user.id = :id', { id: senderId })
      .addSelect('user.privateKey')
      .getOne();
    const recipient = await User.findOne({ where: { id: receiverId } });

    if (!sender || !recipient) {
      throw new Error('Sender or recipient not found.');
    }

    const { encryptedMessage, iv, secretKey } = aesEncrypt(message);

    const encryptedAESKey = rsaEncryptAESKey(secretKey, recipient.publicKey);
    console.log('🔍 DEBUG: Signing Message (UTF-8):', message);

    const senderSignature = signMessage(message, sender.privateKey);

    const newMessage = this.create({
      senderId,
      receiverId,
      encryptedMessage,
      iv,
      encryptedAESKey,
      senderSignature,
    });

    return this.save(newMessage);
  }

  async signReceivedMessage(
    messageId: number,
    userId: number,
  ): Promise<Message> {
    // ✅ Find the message
    const message = await this.findOne({ where: { id: messageId } });

    if (!message || message.receiverId !== userId) {
      throw new Error('Message not found or unauthorized.');
    }

    // ✅ Find the recipient to retrieve their private key
    const recipient = await User.findOne({ where: { id: userId } });

    if (!recipient) {
      throw new Error('Recipient not found.');
    }

    // ✅ Sign the message using the recipient’s private key
    const recipientSignature = signMessage(
      message.encryptedMessage,
      recipient.privateKey,
    );

    // ✅ Store recipient's signature in the database
    message.recipientSignature = recipientSignature;

    return this.save(message);
  }

  async findMessagesBetweenUsers(user1: number, user2: number): Promise<any[]> {
    const messages = await this.createQueryBuilder('message')
      .where('(message.senderId = :user1 AND message.receiverId = :user2)', {
        user1,
        user2,
      })
      .orWhere('(message.senderId = :user2 AND message.receiverId = :user1)', {
        user1,
        user2,
      })
      .orderBy('message.createdAt', 'ASC')
      .getMany();

    const users = await User.createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids: [user1, user2] })
      .addSelect(['user.privateKey', 'user.publicKey'])
      .getMany();

    const userMap = new Map(users.map((user) => [user.id, user]));

    return await Promise.all(
      messages.map(async (message) => {
        const sender = userMap.get(message.senderId);
        const recipient = userMap.get(message.receiverId);

        if (!sender || !recipient) {
          console.error('❌ ERROR: Sender or recipient not found.');
          return { ...message, message: '[Decryption Failed]' };
        }

        console.log(
          '🔍 DEBUG: Sender Public Key (truncated):',
          sender.publicKey.substring(0, 50) + '...',
        );

        try {
          const decryptedAESKey = rsaDecryptAESKey(
            message.encryptedAESKey,
            recipient.privateKey,
          );
          console.log(
            '✅ DEBUG: Successfully Decrypted AES Key:',
            decryptedAESKey.toString('hex'),
          );

          const decryptedMessage = aesDecrypt(
            message.encryptedMessage,
            message.iv,
            decryptedAESKey,
          );
          console.log('✅ DEBUG: Decrypted Message:', decryptedMessage);

          console.log('🔍 DEBUG: Verifying Message (UTF-8):', message);

          // ✅ Verify digital signatures
          const isValidSenderSignature = verifySignature(
            decryptedMessage,
            message.senderSignature,
            sender.publicKey,
          );

          const isValidRecipientSignature = message.recipientSignature
            ? verifySignature(
                decryptedMessage,
                message.recipientSignature,
                recipient.publicKey,
              )
            : true; // ✅ If no recipient signature, assume valid

          if (!isValidSenderSignature || !isValidRecipientSignature) {
            console.warn('⚠️ WARNING: Message signature is invalid!');
            return {
              id: message.id,
              senderId: message.senderId,
              receiverId: message.receiverId,
              message: '[Message Verification Failed]', // ❌ Show warning if signature is bad
              senderVerified: isValidSenderSignature,
              recipientVerified: isValidRecipientSignature,
              createdAt: message.createdAt,
            };
          }

          return {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: decryptedMessage, // ✅ Return verified message
            senderVerified: true,
            recipientVerified: true,
            createdAt: message.createdAt,
          };
        } catch (error) {
          console.error('❌ ERROR: Decryption Failed:', error.message);
          return {
            id: message.id,
            senderId: message.senderId,
            receiverId: message.receiverId,
            message: '[Decryption Failed]', // ❌ Fallback if decryption fails
            senderVerified: false,
            recipientVerified: false,
            createdAt: message.createdAt,
          };
        }
      }),
    );
  }
}
