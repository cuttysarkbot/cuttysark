import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import {
    sendMessage,
    sendError,
    sendUserPermError,
} from '../utils/message-utils';

const Remove: Command = {
    name: 'remove',
    triggers: ['remove', 'delete'],
    desc: 'Remove a clip',
    syntax: '[clip name]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Remove', 'Remove command executed');

        const clipToken = args.toLowerCase().trim();

        if (clipToken.length === 0) {
            await sendError(
                `please specify the name of the clip you want to delete, like this: \`${options.prefixAndTrigger} my really cool clip name\``,
                message.channel,
            );
            return;
        }

        const clipManifest = await storage.getClip(
            options.namespaceSettings.namespaceId,
            clipToken,
        );

        if (clipManifest === null) {
            await sendError("that clip doesn't exist", message.channel);
            return;
        }

        if (
            message.author.id !== clipManifest.owner &&
            options.runType === 'guild' &&
            !message.member?.hasPermission('ADMINISTRATOR')
        ) {
            await sendUserPermError(message.channel);
            return;
        }

        try {
            debug('Remove', 'Deleting clip...');
            await storage.removeClip(
                options.namespaceSettings.namespaceId,
                clipToken,
            );

            await sendMessage('clip deleted', message.channel);
        } catch (error) {
            await sendError(
                'there was an error while deleting the clip',
                message.channel,
            );
        }
    },
};

export default Remove;
