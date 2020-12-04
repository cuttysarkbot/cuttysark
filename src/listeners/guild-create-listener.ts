import Discord from 'discord.js';

import StorageConnector from '../storage/storage-connector';
import { error, debug } from '../utils/generic-utils';

export default async function GuildCreateListener(
    storage: StorageConnector,
    guild: Discord.Guild,
): Promise<void> {
    debug('GuildCreate', 'Guild added');
    try {
        await storage.createNamespaceSettings(`guild${guild.id}`);
    } catch (error) {
        error(
            'GuildCreateListener',
            `Error creating namespace settings: ${error}`,
        );
    }
}
