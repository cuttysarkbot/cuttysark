import crypto from 'crypto';

export function hash(str: string) {
    return crypto.createHash('sha512').update(str).digest('hex');
}

export function generateClipId(namespaceId: string, clipToken: string): string {
    return hash(`${namespaceId};${clipToken}`);
}
