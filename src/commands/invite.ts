import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendMessage } from '../utils/message-utils';

const Invite: Command = {
    name: 'invite',
    triggers: ['invite'],
    desc: 'get bot invite link',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Invite', 'Invite command executed');

        sendMessage(
            `invite ${config.name}:\n${config.inviteLink}`,
            message.channel,
        );
    },
};

export default Invite;
