import { Schema } from 'mongoose';
import encrypt from 'mongoose-encryption';

import { debug } from '../utils/generic-utils';

export default (encKey: string, signKey: string): Schema => {
    debug('ClipAttachmentSchema', 'Generating clip attachment schema...');

    // all fields encrypted
    const schema = new Schema({
        _id: String,
        data: {
            type: Buffer,
            required: true,
        },
    });
    schema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: signKey,
    });
    return schema;
};
