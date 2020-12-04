import { Message } from 'discord.js';
import StorageConnector from '../storage/storage-connector';
import CommandOptions from './command-options';

interface Command {
    name: string;
    triggers: string[];
    desc: string;
    syntax: string;
    commandType: 'personal' | 'guild' | 'both';
    run: (
        msg: Message,
        storage: StorageConnector,
        args: string,
        options: CommandOptions,
    ) => Promise<void>;
}

export default Command;
