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
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return { publicKey, privateKey };
}
function aesEncrypt(
  message: string,
): { encryptedMessage: string; iv: string; secretKey: Buffer } {
  const secretKey = randomBytes(32);
  const iv = randomBytes(16);
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
    const decryptedAESKey = privateDecrypt(
      {
        key: privateKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(encryptedAESKey, 'base64'),
    );

    return decryptedAESKey;
  } catch (error) {
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
  const sign = createSign('SHA256');
  sign.update(Buffer.from(message, 'utf-8'));
  sign.end();

  return sign.sign(privateKey, 'base64');
}

function verifySignature(
  message: string,
  signature: string,
  publicKey: string,
): boolean {
  const verifier = createVerify('SHA256');
  verifier.update(Buffer.from(message, 'utf-8'));
  verifier.end();

  const isValid = verifier.verify(publicKey, signature, 'base64');

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
