import mongoose from 'mongoose';
import uuid from 'uuid';

import { debug, error } from '../utils/generic-utils';
import { generateClipId } from '../utils/storage-utils';

import ClipManifestSchema from './clip-manifest-schema';
import ClipAttachmentSchema from './clip-attachment-schema';
import NamespaceSettingsSchema from './namespace-settings-schema';

import ClipManifest from '../structs/clip-manifest';
import NamespaceSettings from '../structs/namespace-settings';
import DefaultNamespaceSettings from './default-namespace-settings';

export default class StorageConnector {
    m: mongoose.Mongoose;
    _db: mongoose.Connection | undefined;
    _clipManifest: mongoose.Model<mongoose.Document> | undefined;
    _clipAttachment: mongoose.Model<mongoose.Document> | undefined;
    _namespaceSettings: mongoose.Model<mongoose.Document> | undefined;
    _settingsObjs: Record<string, NamespaceSettings> | undefined;

    constructor() {
        this.m = new mongoose.Mongoose();
    }

    get db(): mongoose.Connection {
        if (!this._db) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        return this._db;
    }
    get ClipManifestModel(): mongoose.Model<mongoose.Document> {
        if (!this._clipManifest) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        return this._clipManifest;
    }
    get ClipAttachmentModel(): mongoose.Model<mongoose.Document> {
        if (!this._clipAttachment) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        return this._clipAttachment;
    }

    get NamespaceSettingsModel(): mongoose.Model<mongoose.Document> {
        if (!this._namespaceSettings) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        return this._namespaceSettings;
    }

    async init(
        mongoUrl: string,
        encKey: string,
        signKey: string,
    ): Promise<void> {
        debug('Storage', 'Initializing storage connector...');
        // Connect and log errors
        await this.m.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        this._db = this.m.connection;

        this.db.on('error', error.bind(error, 'Storage'));

        // Load models
        this._clipManifest = this.m.model(
            'ClipManifest',
            ClipManifestSchema(encKey, signKey),
        );
        this._clipAttachment = this.m.model(
            'ClipAttachment',
            ClipAttachmentSchema(encKey, signKey),
        );
        this._namespaceSettings = this.m.model(
            'NamespaceSettings',
            NamespaceSettingsSchema(encKey, signKey),
        );

        // Load all settings into memory
        this._settingsObjs = {};

        for await (const doc of this.NamespaceSettingsModel.find()) {
            let namespaceSettings: Partial<NamespaceSettings> = {};
            Object.keys(DefaultNamespaceSettings).forEach((key: string) => {
                // set to default if doesn't exist
                namespaceSettings[key] =
                    doc.get(key) || DefaultNamespaceSettings[key];
            });
            namespaceSettings.namespaceId = doc.id;

            this._settingsObjs[doc.id] = namespaceSettings as NamespaceSettings;
        }
        debug('Storage', 'Loaded namespace settings into memory');
    }

    async queryNamespaceSettings(
        namespaceId: string,
    ): Promise<NamespaceSettings> {
        debug('Storage', 'Querying namespace settings...');
        const settingsDoc = await this.NamespaceSettingsModel.findById(
            namespaceId,
        );

        if (settingsDoc) {
            let namespaceSettings: Partial<NamespaceSettings> = {};
            Object.values(DefaultNamespaceSettings).forEach((key: string) => {
                // set to default if doesn't exist
                namespaceSettings[key] =
                    settingsDoc.get(key) || DefaultNamespaceSettings[key];
            });
            namespaceSettings.namespaceId = settingsDoc.id;

            if (!this._settingsObjs) {
                throw new Error(
                    'StorageConnector must be initialized before usage',
                );
            }

            this._settingsObjs[
                settingsDoc.id
            ] = namespaceSettings as NamespaceSettings;
            return namespaceSettings as NamespaceSettings;
        } else {
            throw new Error('Settings for this namespace not found');
        }
    }

    async createNamespaceSettings(
        namespaceId: string,
    ): Promise<NamespaceSettings> {
        debug('Storage', 'Generating and saving namespace settings...');
        // TODO: maybe make this a bit more flexible regarding the schema
        const namespaceDoc = new this.NamespaceSettingsModel({
            _id: namespaceId,
            clipPrefixEnabled: DefaultNamespaceSettings.clipPrefixEnabled,
        });
        namespaceDoc.save();

        if (!this._settingsObjs) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        this._settingsObjs[namespaceId] = DefaultNamespaceSettings;

        return DefaultNamespaceSettings;
    }

    async getNamespaceSettings(
        namespaceId: string,
    ): Promise<NamespaceSettings> {
        debug('Storage', 'Getting namespace settings...');
        if (!this._settingsObjs) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        if (!this._settingsObjs[namespaceId]) {
            try {
                return await this.queryNamespaceSettings(namespaceId);
            } catch (error) {
                return await this.createNamespaceSettings(namespaceId);
            }
        }
        return this._settingsObjs[namespaceId];
    }

    async setNamespaceSettings(
        newSettings: NamespaceSettings,
    ): Promise<NamespaceSettings> {
        debug('Storage', 'Setting namespace settings...');
        // TODO: maybe make this a bit more flexible regarding the schema
        await this.NamespaceSettingsModel.updateOne(
            { _id: newSettings.namespaceId },
            {
                clipPrefixEnabled: newSettings.clipPrefixEnabled,
            },
        );

        if (!this._settingsObjs) {
            throw new Error(
                'StorageConnector must be initialized before usage',
            );
        }
        this._settingsObjs[newSettings.namespaceId] = newSettings;

        return newSettings;
    }

    async getClipAttachment(attachmentId: string): Promise<Buffer | null> {
        debug('Storage', 'Querying clip attachment...');
        const attachmentDoc = await this.ClipAttachmentModel.findById(
            attachmentId,
        );

        if (attachmentDoc) {
            return attachmentDoc.get('data');
        } else {
            return null;
        }
    }

    async getClip(
        namespaceId: string,
        clipToken: string,
    ): Promise<ClipManifest | null> {
        debug('Storage', 'Querying clip manifest...');
        // Generate clip id
        const clipId = generateClipId(namespaceId, clipToken);
        const clipDoc = await this.ClipManifestModel.findById(clipId);

        if (clipDoc) {
            return {
                _id: clipDoc.id,
                namespaceId: clipDoc.get('namespaceId'),
                owner: clipDoc.get('owner'),
                token: clipDoc.get('token'),
                content: clipDoc.get('content'),
                attachments: clipDoc.get('attachments'),
            };
        } else {
            return null;
        }
    }

    async saveAttachment(dataBuffer: Buffer): Promise<string> {
        debug('Storage', 'Saving attachment...');
        const attachmentId = uuid.v4();
        const attachmentDoc = new this.ClipAttachmentModel({
            _id: attachmentId,
            data: dataBuffer,
        });
        attachmentDoc.save();

        return attachmentId;
    }

    async saveClipManifest(clipManifest: ClipManifest): Promise<void> {
        debug('Storage', 'Saving clip manifest...');
        // Generate clip id
        const clipId = generateClipId(
            clipManifest.namespaceId,
            clipManifest.token,
        );
        const clipDoc = new this.ClipManifestModel({
            ...clipManifest,
            _id: clipId,
        });
        clipDoc.save();
    }
}
