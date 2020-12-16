import chalk from 'chalk';
import { Message } from 'discord.js';

import config from '../load-config';
import NamespaceSettings from '../structs/namespace-settings';

export function genericLogger(
    type: 0 | 1,
    ns: string,
    ...messages: string[]
): void {
    let logType;
    switch (type) {
        case 1:
            logType = chalk.red('ERROR');
            break;
        default:
            logType = chalk.blue('DEBUG');
            break;
    }
    console.log(`${logType} - ${chalk.green(ns)}: ${messages.join(' ')}`);
}

export function debug(ns: string, ...messages: string[]): void {
    if (config.debugMode) {
        genericLogger(0, ns, ...messages);
    }
}

export function error(ns: string, ...messages: string[]): void {
    // TODO: log errors to discord channel
    genericLogger(1, ns, ...messages);
}

export function getCommandNameAndArgs(
    messageText: string,
    prefix: string,
): string[] {
    const prefixless = messageText.substring(prefix.length);
    let firstSpaceIndex = prefixless.indexOf(' ');
    if (firstSpaceIndex === -1) {
        firstSpaceIndex = prefixless.length;
    }
    const prefixAndTrigger = messageText.substring(0, firstSpaceIndex + 1);

    return [prefixless.substring(0, firstSpaceIndex), prefixAndTrigger];
}

export function convertBoolean(str: string): boolean | null {
    switch (str) {
        case 'true':
        case 'on':
        case 'yes':
        case 'enable':
        case 'enabled':
        case '1':
            return true;
        case 'false':
        case 'off':
        case 'no':
        case 'disable':
        case 'disabled':
        case '0':
            return false;
        default:
            return null;
    }
}

export function matchesNamespaceType(
    runType: 'personal' | 'guild',
    possibleTypes: 'personal' | 'guild' | 'both',
): boolean {
    switch (possibleTypes) {
        case 'both':
            return true;
        case 'personal':
            if (runType === 'personal') {
                return true;
            }
            break;
        case 'guild':
            if (runType === 'guild') {
                return true;
            }
            break;
    }

    return false;
}

export function hasElevatedPerms(message: Message, permRole: string): boolean {
    // TODO: possible security flaw, probably better way to do this exists
    // Command not run in server
    if (!message.member) return true;

    // Has manage server
    if (message.member.hasPermission('MANAGE_GUILD')) return true;

    // Doesn't have manage server and no role is set
    if (permRole.length === 0) return false;

    // Member has perm role
    if (message.member.roles.cache.get(permRole)) return true;

    return false;
}
