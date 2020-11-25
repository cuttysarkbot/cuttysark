import Discord from 'discord.js';

import config from '../load-config';

export default function ReadyListener(client: Discord.Client): void {
    if (config.activity) {
        client.user?.setPresence({
            activity: config.activity,
            status: 'online',
        });
    }
    console.log('Ready!');
}
