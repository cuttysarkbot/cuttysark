import Discord from 'discord.js';

import config from '../load-config';

type DiscordTextChannel =
    | Discord.TextChannel
    | Discord.DMChannel
    | Discord.NewsChannel;

export async function sendMessage(
    content: string | Discord.MessageOptions,
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    let messageOptions: Discord.MessageOptions;
    if (typeof content === 'string') {
        messageOptions = {
            content: content,
        };
    } else {
        messageOptions = content;
    }

    try {
        const sendRes = await channel.send(messageOptions);
        if (Array.isArray(sendRes)) {
            return sendRes[0];
        } else {
            return sendRes;
        }
    } catch (error) {
        throw new Error(`An error occured while sending the message: ${error}`);
    }
}

export async function sendError(error: string, channel: DiscordTextChannel) {
    sendMessage(`❌ uh oh! ${error}. ❌`, channel);
}

export async function sendPermError(
    error: string,
    channel: DiscordTextChannel,
) {
    sendMessage(`⛔ uh oh! i do not have permission to ${error}. ⛔`, channel);
}

export async function sendUserPermError(channel: DiscordTextChannel) {
    sendMessage(
        "🛑 you don't have permission to use this command. 🛑",
        channel,
    );
}

export async function sendDiscordError(
    error: string,
    channel: DiscordTextChannel,
) {
    sendMessage(
        `❌ uh oh! i was unable to ${error}. please check my permissions and try again. if this error persists, try contacting my developer with the \`feedback\` command. ❌`,
        channel,
    );
}
