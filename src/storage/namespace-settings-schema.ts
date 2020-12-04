import { Schema } from 'mongoose';
import encrypt from 'mongoose-encryption';

import { debug } from '../utils/generic-utils';
import DefaultNamespaceSettings from './default-namespace-settings';

export default (encKey: string, signKey: string): Schema => {
    debug('NamespaceSettingsSchema', 'Generating namespace settings schema...');

    // all fields encrypted
    const schema = new Schema({
        _id: String,
        // should clip prefixes be used with clips from this namespace
        clipPrefixEnabled: {
            type: Boolean,
            default: DefaultNamespaceSettings.clipPrefixEnabled,
        },
        deleteClipRequest: {
            type: Boolean,
            default: DefaultNamespaceSettings.deleteClipRequest,
        },
        customPrefix: String,
    });
    schema.plugin(encrypt, {
        encryptionKey: encKey,
        signingKey: signKey,
    });
    return schema;
};
