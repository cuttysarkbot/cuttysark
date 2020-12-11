import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { sendMessage, sendError, sendComplex } from '../utils/message-utils';

const Help: Command = {
    name: 'help',
    triggers: ['help', 'helpme'],
    desc: 'display this command',
    syntax: '[command name]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Help', 'Help command executed');

        const commandName = args.toLowerCase().trim();

        if (commandName.length === 0) {
            // Get main help message
            let helpMessage: string = `there are two types of clips you can make. when you make a server clip, you can use that clip anywhere on the server where you made it. when you make a personal clip, *only you* will be able to use that clip on any server.

use the server's prefix to create and use server clips. use your personal prefix to create and use your personal clips. ping the bot to see your prefixes.

use clips by typing the prefix and then the clip's name, for example, \`;my really cool clip name\`

here are my commands:\n`;

            Object.values(options.commandList).forEach((command) => {
                helpMessage += `- \`${command.name}\`: ${command.desc}\n`;
            });

            await sendComplex(
                {
                    title:
                        "hi, i'm the cutty sark, a clipper ship. you can use me to create message clips of messages that you send often.",
                    description: helpMessage,
                },
                message.channel,
            );
        } else {
            // Get specific command help
            const command = options.commandList[commandName];

            if (command) {
                await sendComplex(
                    {
                        title: `\`${command.name}\``,
                        description: command.desc,
                        fields: [
                            {
                                name: 'aliases',
                                value: `\`${command.triggers.join('`, `')}\``,
                            },
                            {
                                name: 'usage',
                                value: `\`${command.name} ${command.syntax}\``,
                            },
                        ],
                    },
                    message.channel,
                );
            } else {
                await sendError("that command doesn't exist", message.channel);
            }
        }
    },
};

export default Help;
