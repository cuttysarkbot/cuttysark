import Command from './structs/command';

import Create from './commands/create';
import Remove from './commands/remove';
import List from './commands/list';
import Clear from './commands/clear';
import Stats from './commands/stats';
import Invite from './commands/invite';
import Help from './commands/help';
import Settings from './commands/settings';

const commandList: Command[] = [
    Create,
    Remove,
    List,
    Clear,
    Stats,
    Invite,
    Help,
    Settings,
];
const commandMap: Record<string, Command> = {};
const personalCommandMap: Record<string, Command> = {};
const guildCommandMap: Record<string, Command> = {};

commandList.forEach((command) => {
    commandMap[command.name] = command;
});

// Load triggers and check for duplicates
const personalTriggerMap: Record<string, string> = {};
const guildTriggerMap: Record<string, string> = {};

commandList.forEach((command) => {
    if (!command || !command.triggers || command.triggers.length === 0) {
        throw new Error('Empty command found');
    }

    command.triggers.forEach((trigger: string) => {
        if (personalTriggerMap[trigger] || guildTriggerMap[trigger]) {
            throw new Error(
                `Command ${command.name} has duplicate trigger: ${trigger}`,
            );
        } else {
            switch (command.commandType) {
                case 'personal':
                    personalTriggerMap[trigger] = command.name;
                    break;
                case 'guild':
                    guildTriggerMap[trigger] = command.name;
                    break;
                default:
                    // if commandType is 'both'
                    personalTriggerMap[trigger] = command.name;
                    guildTriggerMap[trigger] = command.name;
                    break;
            }
        }
    });
});

export const commands = commandMap;
export function getPersonalCommand(trigger: string): Command | null {
    const commandName = personalTriggerMap[trigger];
    if (commandName) {
        return commandMap[commandName];
    } else {
        return null;
    }
}

export function getGuildCommand(trigger: string): Command | null {
    const commandName = guildTriggerMap[trigger];
    if (commandName) {
        return commandMap[commandName];
    } else {
        return null;
    }
}
