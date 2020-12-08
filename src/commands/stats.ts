import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendMessage } from '../utils/message-utils';

const Stats: Command = {
    name: 'stats',
    triggers: ['stats', 'statistics'],
    desc: 'see bot statistics',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Stats', 'Stats command executed');

        const serverCount = message.client.guilds.cache.size;

        sendMessage(
            `hi!
i was created by ${config.developer}
i am currently in ${serverCount} servers
you can invite me to your server by using the \`invite\` command
thanks for sailing with us`,
            message.channel,
        );
    },
};

export default Stats;
