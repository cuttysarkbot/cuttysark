import chalk from 'chalk';

import config from '../load-config';

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
