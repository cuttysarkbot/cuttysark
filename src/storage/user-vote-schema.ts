import { Schema } from 'mongoose';
import encrypt from 'mongoose-encryption';

import { debug } from '../utils/generic-utils';

export default (encKey: string, signKey: string): Schema => {
    debug('UserVoteSchema', 'Generating user vote schema...');

    const schema = new Schema({
        _id: String,
        lastVote: Number,
        lastFetch: Number,
        firstFetch: Number,
    });

    schema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: signKey,
        requireAuthenticationCode: false,
    });
    return schema;
};
