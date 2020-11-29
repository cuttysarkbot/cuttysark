import Discord from 'discord.js';

import config from '../load-config';
import { debug } from '../utils/generic-utils';
import StorageConnector from '../storage/storage-connector';
import commands from '../command-manager';

export default async function MessageListener(
    storage: StorageConnector,
    message: Discord.Message,
): Promise<void> {
    debug('MessageListener', `Message received: ${message.content}`);

    const namespaceSettings = await storage.getNamespaceSettings(
        `guild${message.guild?.id}`,
    );

    debug('MessageListener', JSON.stringify(namespaceSettings));
}
