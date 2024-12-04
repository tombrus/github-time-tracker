const APP_PASSWORD = 'fixed-password';

export async function encrypt(originalText: string): Promise<string> {
    const iv  = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
    const enc = new TextEncoder();

    const keyMaterial = await getKeyMaterial(APP_PASSWORD);
    const key         = await getKey(keyMaterial, iv);

    const encodedData   = enc.encode(originalText);
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        encodedData,
    );

    // Combine the IV with the encrypted data
    const buffer = new Uint8Array(iv.byteLength + encryptedData.byteLength);
    buffer.set(iv, 0);
    buffer.set(new Uint8Array(encryptedData), iv.byteLength);

    return btoa(String.fromCharCode(...buffer));
}

export async function decrypt(encryptedText: string): Promise<string> {
    const data   = atob(encryptedText);
    const buffer = new Uint8Array(data.split('').map(char => char.charCodeAt(0)));

    const iv            = buffer.slice(0, 12);
    const encryptedData = buffer.slice(12);

    const keyMaterial = await getKeyMaterial(APP_PASSWORD);
    const key         = await getKey(keyMaterial, iv);

    const decryptedData = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv,
        },
        key,
        encryptedData,
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedData);
}

async function getKeyMaterial(password: string) {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        enc.encode(password),
        {name: 'PBKDF2'},
        false,
        ['deriveBits', 'deriveKey'],
    );
}

async function getKey(keyMaterial: CryptoKey, iv: Uint8Array) {
    return crypto.subtle.deriveKey(
        {
            name      : 'PBKDF2',
            salt      : iv,
            iterations: 100000,
            hash      : 'SHA-256',
        },
        keyMaterial,
        {
            name  : 'AES-GCM',
            length: 256,
        },
        false,
        ['encrypt', 'decrypt'],
    );
}
