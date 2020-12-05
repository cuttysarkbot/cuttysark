import Discord from 'discord.js';

import config from '../load-config';
import { debug, getCommandNameAndArgs } from '../utils/generic-utils';
import StorageConnector from '../storage/storage-connector';
import { getPersonalCommand, getGuildCommand } from '../command-manager';
import { sendMessage, sendError } from '../utils/message-utils';
import Command from '../structs/command';
import CommandOptions from '../structs/command-options';
import ClipManifest from '../structs/clip-manifest';

export default async function MessageListener(
    storage: StorageConnector,
    message: Discord.Message,
): Promise<void> {
    try {
        // Get raw message
        const messageText = message.content.trim().toLowerCase();

        const guildAvailable = message.guild && message.guild.available;

        const personalSettings = await storage.getNamespaceSettings(
            `personal${message.author.id}`,
        );
        const guildSettings = guildAvailable
            ? await storage.getNamespaceSettings(`guild${message.guild?.id}`)
            : null;

        const personalPrefix =
            personalSettings.customPrefix || config.defaultPersonalPrefix;
        const guildPrefix =
            guildSettings?.customPrefix || config.defaultGuildPrefix;

        // Pinging bot will display prefix
        if (
            messageText === `<@${message.client.user?.id}>` ||
            messageText === `<@!${message.client.user?.id}>`
        ) {
            debug('MessageListener', `Prefix requested`);
            sendMessage(
                `hi, i'm ${config.name}

your personal prefix: \`${personalPrefix}\`
${guildAvailable ? `this server's prefix: \`${guildPrefix}\`` : ''}

use the \`help\` command for more information`,
                message.channel,
            );
            return;
        }

        const commandOptions: CommandOptions = {
            runType: 'personal',
        };

        let command: Command | null = null;
        let args: string = '';

        if (messageText.startsWith(personalPrefix)) {
            debug('MessageListener', 'Personal prefixed message received');
            const [commandName, possibleArgs] = getCommandNameAndArgs(
                messageText,
                personalPrefix,
            );
            command = getPersonalCommand(commandName);

            if (command) {
                commandOptions.runType = 'personal';
                args = possibleArgs;
            }
        } else if (guildAvailable && messageText.startsWith(guildPrefix)) {
            debug('MessageListener', 'Guild prefixed message received');
            const [commandName, possibleArgs] = getCommandNameAndArgs(
                messageText,
                guildPrefix,
            );
            command = getGuildCommand(commandName);

            if (command) {
                commandOptions.runType = 'guild';
                args = possibleArgs;
            }
        }

        if (command) {
            try {
                debug(
                    'MessageListener',
                    'Command',
                    command.name,
                    'will be run',
                );

                if (personalPrefix === guildPrefix && guildAvailable) {
                    sendMessage(
                        `please note: your personal prefix is the same as this server's prefix, so the personal version of this command will be run
you will need to change your personal prefix to use the server command`,
                        message.channel,
                    );
                }

                await command.run(message, storage, args, commandOptions);
            } catch (error) {
                sendError(
                    'an unknown error occurred while running this command',
                    message.channel,
                );
                error(
                    'MessageListener',
                    `Uncaught error when running ${command.name}: ${error}`,
                );
            }
            return;
        }

        // At this point, we know it's not a command being run
        let clipManifest: ClipManifest | null = null;
        let clipType: 'guild' | 'personal' | undefined;

        // Check if it's a personal clip
        if (personalSettings.clipPrefixEnabled) {
            if (messageText.startsWith(personalPrefix)) {
                const prefixless = messageText.substring(personalPrefix.length);
                clipManifest = await storage.getClip(
                    personalSettings.namespaceId,
                    prefixless,
                );
            }
        } else {
            clipManifest = await storage.getClip(
                personalSettings.namespaceId,
                messageText,
            );

            if (clipManifest) {
                clipType = 'personal';
            }
        }

        // Not a personal clip, check if it's a guild clip
        if (!clipManifest && guildAvailable && guildSettings) {
            if (guildSettings.clipPrefixEnabled) {
                if (messageText.startsWith(guildPrefix)) {
                    const prefixless = messageText.substring(
                        guildPrefix.length,
                    );
                    clipManifest = await storage.getClip(
                        guildSettings.namespaceId,
                        prefixless,
                    );
                }
            } else {
                clipManifest = await storage.getClip(
                    guildSettings.namespaceId,
                    messageText,
                );
            }

            if (clipManifest) {
                clipType = 'guild';
            }
        }

        // If we have a clip, fetch attachments and send it
        if (clipManifest) {
            try {
                debug('MessageListener', 'Clip found');
                const clipAttachments: Buffer[] = await Promise.all(
                    clipManifest.attachments.map(async (id) => {
                        const attachment = await storage.getClipAttachment(id);
                        if (attachment) {
                            return attachment;
                        }
                        throw new Error('Error fetching clip attachments');
                    }),
                );

                const messageObj = {
                    content: clipManifest.content,
                    files: clipAttachments,
                };

                // Send clip
                await message.channel.send(messageObj);

                // Possibly delete clip request
                let shouldDelete = false;
                if (clipType === 'personal') {
                    shouldDelete = personalSettings.deleteClipRequest;
                } else if (guildSettings) {
                    shouldDelete = guildSettings.deleteClipRequest;
                }
                if (shouldDelete) {
                    await message.delete();
                }
            } catch (error) {
                sendError(
                    'an error occured while fetching this clip',
                    message.channel,
                );
                error('Message Listener', 'Error fetching clip:', error);
            }
        }
    } catch (error) {
        error('Message Listener', 'Unknown error occurred:', error);
    }
}
