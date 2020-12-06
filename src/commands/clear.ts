import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import {
    sendMessage,
    sendError,
    sendUserPermError,
} from '../utils/message-utils';

const Clear: Command = {
    name: 'clear',
    triggers: ['clear'],
    desc: 'Clear clips',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Clear', 'Clear command executed');

        if (
            options.runType === 'guild' &&
            !message.member?.hasPermission('ADMINISTRATOR')
        ) {
            await sendUserPermError(message.channel);
            return;
        }

        await sendMessage(
            'are you sure you want to clear all clips? *this action is irreversible!* type `CONFIRMCLEAR` to clear all clips.',
            message.channel,
        );

        try {
            await message.channel.awaitMessages(
                (collMsg) =>
                    collMsg.author.id === message.author.id &&
                    collMsg.content === 'CONFIRMCLEAR',
                {
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                },
            );
        } catch (err) {
            await sendMessage('clear process cancelled', message.channel);
            return;
        }

        try {
            const clipList = await storage.listNamespaceClips(
                options.namespaceSettings.namespaceId,
            );

            // Loop through and delete all clips and attachments
            await Promise.all(
                clipList.map(async (clip) => {
                    await storage.removeClip(
                        options.namespaceSettings.namespaceId,
                        clip.token,
                    );
                    await Promise.all(
                        clip.attachments.map(async (attachment) =>
                            storage.removeAttachment(attachment),
                        ),
                    );
                }),
            );
            sendMessage('clips cleared!', message.channel);
        } catch (error) {
            sendError('an error occured while clearing clips', message.channel);
        }
    },
};

export default Clear;
