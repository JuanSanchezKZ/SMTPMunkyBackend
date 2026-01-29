import * as crypto from 'crypto';

const ALG = 'aes-256-gcm';

/**
 * Función segura para obtener bytes aleatorios.
 * Accede directamente al método del módulo importado para evitar 
 * conflictos con el scope global en entornos de producción.
 */
function getSecureRandomBytes(size: number): Buffer {
  try {
    return crypto.randomBytes(size);
  } catch (error) {
    // Fallback por si el entorno es extremadamente restrictivo
    const bytes = new Uint8Array(size);
    crypto.randomFillSync(bytes);
    return Buffer.from(bytes);
  }
}

function keyFromEnv(): Buffer {
  const key = process.env.ENCRYPTION_KEY || '';
  if (key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return Buffer.from(key.slice(0, 32));
}

export function encryptString(plain: string): string {
  const key = keyFromEnv();
  
  // Usamos nuestra función segura para el IV
  const iv = getSecureRandomBytes(12);
  
  const cipher = crypto.createCipheriv(ALG, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

export function decryptString(payload: string): string {
  const key = keyFromEnv();
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted payload');
  
  const iv = Buffer.from(ivB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  
  return dec.toString('utf8');
}