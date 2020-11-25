import Discord from 'discord.js';

import config from '../load-config';
import commands from '../command-manager';

export default function MessageListener(message: Discord.Message): void {
    console.log('message received!');
}
