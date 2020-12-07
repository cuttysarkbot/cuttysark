import { Schema } from 'mongoose';
import encrypt from 'mongoose-encryption';

import { debug } from '../utils/generic-utils';

export default (encKey: string, signKey: string): Schema => {
    debug('ClipManifestSchema', 'Generating clip manifest schema...');

    const schema = new Schema({
        // hash of "{namespaceId};{token}"
        _id: String,
        // something like personal{userId} or guild{userId}
        namespaceId: {
            required: true,
            type: String,
        },
        // id of clip creator (encrypted)
        owner: {
            required: true,
            type: String,
        },
        // clip token (encrypted)
        token: {
            required: true,
            type: String,
        },
        // clip content (encrypted)
        content: String,
        // list of clip attachment ids (encrypted)
        attachments: {
            required: true,
            type: [String],
        },
    });
    schema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: signKey,
        encryptedFields: ['owner', 'token', 'content', 'attachments'],
    });
    return schema;
};
