import {
  createCipheriv,
  createDecipheriv,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
  randomBytes,
  constants,
  createVerify,
  createSign,
} from 'crypto';

function generateRSAKeyPair(): {
  publicKey: string;
  privateKey: string;
} {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, // Secure key length
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return { publicKey, privateKey };
}
function aesEncrypt(
  message: string,
): { encryptedMessage: string; iv: string; secretKey: Buffer } {
  const secretKey = randomBytes(32); // AES-256 key
  const iv = randomBytes(16); // IV
  const cipher = createCipheriv('aes-256-cbc', secretKey, iv);
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encryptedMessage: encrypted,
    iv: iv.toString('hex'),
    secretKey,
  };
}

function rsaEncryptAESKey(aesKey: Buffer, publicKey: string): string {
  console.log(
    '🔍 DEBUG: Public Key Used for Encryption:',
    publicKey.substring(0, 50) + '...',
  );

  return publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    },
    aesKey,
  ).toString('base64');
}

function rsaDecryptAESKey(encryptedAESKey: string, privateKey: string): Buffer {
  try {
    console.log(
      '🔍 DEBUG: Private Key Used for Decryption:',
      privateKey.substring(0, 50) + '...',
    );

    const decryptedAESKey = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING, // ✅ Ensure OAEP padding is used
      },
      Buffer.from(encryptedAESKey, 'base64'),
    );

    console.log(
      '✅ DEBUG: Successfully Decrypted AES Key:',
      decryptedAESKey.toString('hex'),
    );
    return decryptedAESKey;
  } catch (error) {
    console.error('❌ ERROR: RSA Decryption Failed:', error.message);
    throw new Error('RSA decryption failed');
  }
}

function aesDecrypt(
  encryptedMessage: string,
  iv: string,
  secretKey: Buffer,
): string {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    secretKey,
    Buffer.from(iv, 'hex'),
  );
  let decrypted = decipher.update(encryptedMessage, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function signMessage(message: string, privateKey: string): string {
  console.log('🔍 DEBUG: Signing Message (UTF-8):', message);

  const sign = createSign('SHA256');
  sign.update(Buffer.from(message, 'utf-8')); // ✅ Use Buffer for consistency
  sign.end();

  return sign.sign(privateKey, 'base64'); // ✅ Return base64 signature
}

function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  console.log('🔍 DEBUG: Verifying Message (UTF-8):', message);

  const verifier = createVerify('SHA256');
  verifier.update(Buffer.from(message, 'utf-8')); // ✅ Use the same buffer format
  verifier.end();

  console.log(
    '🔍 DEBUG: Signature Before Verification:',
    signature.substring(0, 50) + '...',
  );

  const isValid = verifier.verify(publicKey, signature, 'base64');

  console.log(`✅ DEBUG: Signature Verification Result: ${isValid}`);
  return isValid;
}

export {
  generateRSAKeyPair,
  aesEncrypt,
  rsaEncryptAESKey,
  rsaDecryptAESKey,
  aesDecrypt,
  signMessage,
  verifySignature,
};
