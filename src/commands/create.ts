import { TextChannel, MessageMentions } from 'discord.js';

import Command from '../structs/command';

import config from '../load-config';

import { debug, hasElevatedPerms } from '../utils/generic-utils';
import {
    sendMessage,
    sendError,
    sendUserPermError,
} from '../utils/message-utils';

const MAX_ATTACHMENT_SIZE = 8000000; // 8MB - that is megabyte, not mebibyte
const MAX_CLIP_TOKEN_LENGTH = 1000;

const Create: Command = {
    name: 'create',
    triggers: ['create', 'new', 'add'],
    desc: 'create a new clip',
    syntax: '<clip name>',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Create', 'Create command executed');

        if (
            options.namespaceSettings.createRequirePerms &&
            !hasElevatedPerms(message, options.namespaceSettings.permRole)
        ) {
            await sendUserPermError(message.channel);
            return;
        }

        const clipToken = args.toLowerCase().trim();

        if (clipToken.length === 0) {
            await sendError(
                `please provide a name for your clip, like this:\n\`${options.prefixAndTrigger} my really cool clip name\``,
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
                    time: 60000,
                    errors: ['time'],
                },
            );

            const collMsg = Array.from(collected.values())[0];

            if (
                MessageMentions.EVERYONE_PATTERN.test(
                    collMsg.content.toLowerCase(),
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

                        if (
                            config.backupGuildId === '' &&
                            config.backupChannelId === ''
                        ) {
                            return attachment.url;
                        }

                        try {
                            const backupChannel = (
                                await message.client.guilds.fetch(
                                    config.backupGuildId,
                                )
                            )?.channels.resolve(config.backupChannelId);
                            if (
                                !backupChannel ||
                                !(backupChannel instanceof TextChannel)
                            ) {
                                return attachment.url;
                            }

                            const attachmentMsg = await backupChannel.send({
                                files: [attachment.url],
                            });

                            // Good variable names, I know
                            const msgAttachmentUrl = attachmentMsg.attachments.array()[0];

                            return msgAttachmentUrl.url;
                        } catch (error) {
                            debug(
                                'Create',
                                'An error occured while uploading the attachment:',
                                error,
                            );
                            return attachment.url;
                        }
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
                debug('Create', 'An error occured while saving a clip:', error);
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
