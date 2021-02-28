import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendComplex } from '../utils/message-utils';

const Vote: Command = {
    name: 'vote',
    triggers: ['vote'],
    desc: 'get link to vote for me',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Vote', 'Vote command executed');

        await sendComplex(
            {
                title: `thanks for choosing to support me! click here to vote!`,
                url: config.voteURL,
            },
            message.channel,
        );
    },
};

export default Vote;
