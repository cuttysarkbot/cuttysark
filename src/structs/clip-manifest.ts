import { Document } from 'mongoose';

export default interface ClipManifest {
    _id?: string;
    namespaceId: string;
    owner: string;
    token: string;
    content: string;
    attachments: string[];
}
