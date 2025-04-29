import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
//import { SECRET_KEY } from '$env/static/private';
//const key = crypto.createHash('sha256').update(SECRET_KEY).digest(); 


export function encrypt(key: string, text: string) {
    const iv = crypto.randomBytes(16);
    //if (!SECRET_KEY) {
    //    throw new Error('SECRET_KEY environment variable is not set');
    //}
    //const cipher = crypto.createCipheriv(algorithm, Buffer.from(SECRET_KEY, 'hex'), iv);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(key: string, text: string) {
    //if (!SECRET_KEY) {
    //    throw new Error('SECRET_KEY environment variable is not set');
    //}
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    //const decipher = crypto.createDecipheriv(algorithm, Buffer.from(SECRET_KEY, 'hex'), iv);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
