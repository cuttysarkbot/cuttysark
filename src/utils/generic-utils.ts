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
    console.log(`${logType} - ${ns}: ${messages.join(' ')}`);
}

export function debug(ns: string, ...messages: string[]): void {
    if (config.debugMode) {
        genericLogger(0, ns, ...messages);
    }
}

export function error(ns: string, ...messages: string[]): void {
    genericLogger(1, ns, ...messages);
}
