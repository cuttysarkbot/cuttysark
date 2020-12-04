import Command from '../structs/command';

import { debug } from '../utils/generic-utils';

const Create: Command = {
    name: 'create',
    triggers: ['create', 'new', 'add'],
    desc: 'Create a new clip',
    syntax: '[clip name]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Create', 'Create command executed');
    },
};

export default Create;
