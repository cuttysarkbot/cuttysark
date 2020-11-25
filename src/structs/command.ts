import { Message } from 'discord.js';

interface Command {
    name: string;
    triggers: string[];
    desc: string;
    syntax: string;
    serverCmd: boolean;
    run: (msg: Message, args: string) => void;
}

export default Command;
