const config = require('../services/config_customer');
const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    key = config.qr_aes_encryption_key; // key is 32 characters long

const IV_LENGTH = 16; // For AES, this is always 16

// Function to encrypt text
function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Function to decrypt text
function decrypt(text) {
    const textParts = text.split(':');
    const iv = new Buffer(textParts.shift(), 'hex');
    const encryptedText = new Buffer(textParts.join(':'), 'hex');

    console.log('Encrypted text:', encryptedText);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}

module.exports = {encrypt, decrypt};