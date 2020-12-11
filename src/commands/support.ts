import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendComplex } from '../utils/message-utils';

const Support: Command = {
    name: 'support',
    triggers: ['support', 'feedback'],
    desc: 'get link to the support server',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Support', 'Support command executed');

        await sendComplex(
            {
                title: `click here to join the ${config.name} support server`,
                url: config.supportServer,
            },
            message.channel,
        );
    },
};

export default Support;
