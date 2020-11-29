import Discord from 'discord.js';

import config from '../load-config';
import { debug } from '../utils/generic-utils';

export default async function ReadyListener(
    client: Discord.Client,
): Promise<void> {
    if (config.activity) {
        client.user?.setPresence({
            activity: config.activity,
            status: 'online',
        });
    }
    debug('ReadyListener', 'Ready!');
}
