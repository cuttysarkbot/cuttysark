import Discord from 'discord.js';

import config from '../load-config';
import { debug, getCommandNameAndArgs } from '../utils/generic-utils';
import StorageConnector from '../storage/storage-connector';
import { getPersonalCommand, getGuildCommand } from '../command-manager';
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

        // TODO: Warn user if personal and guild prefix are the same

        // Pinging bot will display prefix
        if (
            messageText === `<@${message.client.user?.id}>` ||
            messageText === `<@!${message.client.user?.id}>`
        ) {
            debug('MessageListener', `Prefix requested`);
            // TODO: print prefix to chat on ping
        }

        const personalPrefix =
            personalSettings.customPrefix || config.defaultPersonalPrefix;
        const guildPrefix =
            guildSettings?.customPrefix || config.defaultGuildPrefix;

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
                await command.run(message, storage, args, commandOptions);
            } catch (error) {
                // TODO: tell user that an unknown error occurred
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
                // TODO: notify user
                error('Message Listener', 'Error fetching clip:', error);
            }
        }
    } catch (error) {
        error('Message Listener', 'Unknown error occurred:', error);
    }
}
