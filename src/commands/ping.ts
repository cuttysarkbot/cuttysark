import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import { sendMessage } from '../utils/message-utils';

const Ping: Command = {
    name: 'ping',
    triggers: ['ping'],
    desc: 'get bot ping',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Ping', 'Ping command executed');

        await sendMessage(
            `pong! my ping is ${message.client.ws.ping}ms.`,
            message.channel,
        );
    },
};

export default Ping;
