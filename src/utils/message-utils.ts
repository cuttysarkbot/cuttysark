import { debug } from 'console';
import Discord from 'discord.js';

import config from '../load-config';

type DiscordTextChannel =
    | Discord.TextChannel
    | Discord.DMChannel
    | Discord.NewsChannel;

type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
};

type EmbedFooter = {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
};

type EmbedAuthor = {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
};

type Embed = {
    title?: string;
    description?: string;
    url?: string;
    timestamp?: number;
    color?: string;
    author?: EmbedAuthor;
    footer?: EmbedFooter;
    fields?: EmbedField[];
};

export async function sendRawMessage(
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

export async function sendComplex(
    embedObj: Embed,
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    let newEmbed = embedObj;
    newEmbed.color = newEmbed.color || config.embedColor;
    if (
        channel instanceof Discord.TextChannel &&
        channel.guild.me &&
        !channel.permissionsFor(channel.guild.me)?.has('EMBED_LINKS')
    ) {
        let text = '';
        if (newEmbed.author) text += `**_${newEmbed.author.name}_**\n`;
        if (newEmbed.title) text += `**${newEmbed.title}**\n`;
        if (newEmbed.url) text += `(${newEmbed.url})\n`;
        if (newEmbed.description) text += `${newEmbed.description}\n`;
        if (newEmbed.fields && newEmbed.fields.length !== 0) {
            text += '\n';
            newEmbed.fields.forEach((field) => {
                text += `${field.name}: ${field.value}\n`;
            });
        }
        if (newEmbed.footer) text += `*${newEmbed.footer.text}*\n`;

        return await sendRawMessage(text, channel);
    }

    return await sendRawMessage(
        {
            embed: newEmbed,
        },
        channel,
    );
}

export async function sendMessage(
    content: string,
    channel: DiscordTextChannel,
    color?: string,
): Promise<Discord.Message> {
    return await sendComplex(
        {
            title: content,
            color,
        },
        channel,
    );
}

export async function sendError(
    error: string,
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    return await sendMessage(`❌ uh oh! ${error}.`, channel, '#dd2e44');
}

export async function sendPermError(
    error: string,
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    return await sendMessage(
        `⛔ uh oh! i do not have permission to ${error}.`,
        channel,
        '#be1931',
    );
}

export async function sendUserPermError(
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    return await sendMessage(
        "🛑 you don't have permission to use this command. 🛑",
        channel,
        '#dd2e44',
    );
}

export async function sendDiscordError(
    error: string,
    channel: DiscordTextChannel,
): Promise<Discord.Message> {
    return await sendMessage(
        `❌ uh oh! i was unable to ${error}. please check my permissions and try again. if this error persists, try contacting my developer with the \`feedback\` command.`,
        channel,
        '#dd2e44',
    );
}
