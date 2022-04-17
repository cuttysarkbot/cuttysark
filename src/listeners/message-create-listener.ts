import Discord from 'discord.js';

import config from '../load-config';
import { debug, error, getCommandNameAndArgs } from '../utils/generic-utils';
import StorageConnector from '../storage/storage-connector';
import {
    getPersonalCommand,
    getGuildCommand,
    commands,
} from '../command-manager';
import {
    sendMessage,
    sendRawMessage,
    sendError,
    sendComplex,
} from '../utils/message-utils';
import Command from '../structs/command';
import CommandOptions from '../structs/command-options';
import ClipManifest from '../structs/clip-manifest';

export default async function MessageCreateListener(
    storage: StorageConnector,
    message: Discord.Message,
): Promise<void> {
    try {
        // Bots can't do things
        if (message.author.bot) {
            return;
        }

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
            personalSettings.customPrefix !== ''
                ? personalSettings.customPrefix
                : config.defaultPersonalPrefix;
        const guildPrefix =
            guildSettings !== null &&
            guildSettings?.customPrefix &&
            guildSettings?.customPrefix !== ''
                ? guildSettings?.customPrefix
                : config.defaultGuildPrefix;

        // Pinging bot will display prefix
        if (
            messageText === `<@${message.client.user?.id}>` ||
            messageText === `<@!${message.client.user?.id}>`
        ) {
            debug('MessageCreateListener', `Prefix requested`);
            await sendComplex(
                {
                    title: `hi, i'm ${config.name}`,
                    description: `${
                        guildAvailable
                            ? `this server's prefix: \`${guildPrefix}\``
                            : ''
                    }
your personal prefix: \`${personalPrefix}\`

use the \`help\` command for more information`,
                },
                message.channel,
            );
            return;
        }

        const partialCommandOptions: Partial<CommandOptions> = {
            commandList: commands,
        };

        let command: Command | null = null;

        if (messageText.startsWith(personalPrefix)) {
            debug(
                'MessageCreateListener',
                'Personal prefixed message received',
            );
            const [commandName, possible] = getCommandNameAndArgs(
                messageText,
                personalPrefix,
            );
            command = getPersonalCommand(commandName);

            if (command) {
                partialCommandOptions.runType = 'personal';
                partialCommandOptions.prefixAndTrigger = possible;
                partialCommandOptions.namespaceSettings = personalSettings;
            }
        } else if (
            guildAvailable &&
            guildSettings &&
            messageText.startsWith(guildPrefix)
        ) {
            debug('MessageCreateListener', 'Guild prefixed message received');
            const [commandName, possible] = getCommandNameAndArgs(
                messageText,
                guildPrefix,
            );
            command = getGuildCommand(commandName);

            if (command) {
                partialCommandOptions.runType = 'guild';
                partialCommandOptions.prefixAndTrigger = possible;
                partialCommandOptions.namespaceSettings = guildSettings;
            }
        }

        if (command) {
            try {
                debug(
                    'MessageCreateListener',
                    'Command',
                    command.name,
                    'will be run',
                );

                if (personalPrefix === guildPrefix && guildAvailable) {
                    await sendMessage(
                        `please note: your personal prefix is the same as this server's prefix, so the personal version of this command will be run.
you will need to change your personal prefix to use the server command.`,
                        message.channel,
                    );
                }

                const commandOptions = partialCommandOptions as CommandOptions;

                const args = message.content.substring(
                    commandOptions.prefixAndTrigger.length + 1,
                );

                await command.run(message, storage, args, commandOptions);
            } catch (err) {
                await sendError(
                    'an unknown error occurred while running this command',
                    message.channel,
                );
                error(
                    'MessageCreateListener',
                    `Uncaught error when running ${command.name}: ${err}`,
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
                debug('MessageCreateListener', 'Clip found');

                const messageObj = {
                    content: clipManifest.content,
                    files: clipManifest.attachments,
                };

                // Send clip
                await sendRawMessage(messageObj, message.channel);

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
            } catch (err: any) {
                await sendError(
                    'an error occured while fetching this clip',
                    message.channel,
                );
                error('Message Listener', 'Error fetching clip:', err);
            }
        }
    } catch (err: any) {
        error('Message Listener', 'Unknown error occurred:', err);
    }
}
