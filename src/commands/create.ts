import { MessageMentions } from 'discord.js';
import fetch from 'node-fetch';

import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import { sendMessage, sendError } from '../utils/message-utils';

const MAX_ATTACHMENT_SIZE = 8000000; // 8MB - that is megabyte, not mebibyte
const MAX_CLIP_TOKEN_LENGTH = 1000;

const Create: Command = {
    name: 'create',
    triggers: ['create', 'new', 'add'],
    desc: 'Create a new clip',
    syntax: '[clip name]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Create', 'Create command executed');

        const clipToken = args.toLowerCase().trim();

        if (clipToken.length === 0) {
            await sendError(
                `please provide a name for your clip, like this: \`${options.prefixAndTrigger} my really cool clip name\``,
                message.channel,
            );
            return;
        }

        if (clipToken.length > MAX_CLIP_TOKEN_LENGTH) {
            await sendError(
                `clip names cannot be longer than ${MAX_CLIP_TOKEN_LENGTH} characters`,
                message.channel,
            );
            return;
        }

        const existingClip = await storage.getClip(
            options.namespaceSettings.namespaceId,
            clipToken,
        );

        if (existingClip !== null) {
            await sendError('this clip name is already taken', message.channel);
            return;
        }

        await sendMessage(
            "cool, let's make a clip! your next message will be saved as a clip:",
            message.channel,
        );

        try {
            debug('Create', 'Waiting for message...');

            const collected = await message.channel.awaitMessages(
                (collMsg) => message.author.id === collMsg.author.id,
                {
                    max: 1,
                    time: 30000,
                    errors: ['time'],
                },
            );

            const collMsg = Array.from(collected.values())[0];

            if (
                MessageMentions.EVERYONE_PATTERN.test(
                    message.content.toLowerCase(),
                )
            ) {
                await sendError(
                    "you can't ping everyone in a clip",
                    message.channel,
                );
                return;
            }

            try {
                debug('Create', 'Getting attachments...');
                const attachments: string[] = await Promise.all(
                    collMsg.attachments.map(async (attachment) => {
                        // Check if attachment is too large
                        if (attachment.size > MAX_ATTACHMENT_SIZE) {
                            await sendError(
                                'attachments cannot be larger than 8mb',
                                message.channel,
                            );
                            throw new Error('Attachment too large');
                        }

                        return attachment.url;
                    }),
                );

                debug('Create', 'Saving clip...');
                await storage.saveClipManifest({
                    namespaceId: options.namespaceSettings.namespaceId,
                    owner: message.author.id,
                    token: clipToken,
                    content: collMsg.content,
                    attachments: attachments,
                });

                await sendMessage('clip saved!', message.channel);
            } catch (error) {
                await sendError(
                    'an error occured while saving your clip',
                    message.channel,
                );
            }
        } catch (error) {
            await sendError(
                'you need to provide a message to save in your clip',
                message.channel,
            );
        }
    },
};

export default Create;
