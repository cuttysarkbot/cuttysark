import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendComplex } from '../utils/message-utils';

const Invite: Command = {
    name: 'invite',
    triggers: ['invite'],
    desc: 'get bot invite link',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Invite', 'Invite command executed');

        await sendComplex(
            {
                title: `click here to invite ${config.name} to your server`,
                url: config.inviteLink,
            },
            message.channel,
        );
    },
};

export default Invite;
