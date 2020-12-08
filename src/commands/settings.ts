import { MessageMentions } from 'discord.js';

import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import {
    convertBoolean,
    matchesNamespaceType,
    hasElevatedPerms,
} from '../utils/generic-utils';
import {
    sendMessage,
    sendError,
    sendUserPermError,
} from '../utils/message-utils';

import DefaultNamespaceSettings from '../storage/default-namespace-settings';

const Settings: Command = {
    name: 'settings',
    triggers: ['settings', 'preferences', 'options', 'configure', 'config'],
    desc: 'configure the bot',
    syntax: '<setting name> [new value or "reset"]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Settings', 'Settings command executed');

        if (!hasElevatedPerms(message, options.namespaceSettings.permRole)) {
            await sendUserPermError(message.channel);
            return;
        }

        let settings = options.namespaceSettings;

        const cleanArgs = args.toLowerCase().trim();
        const split = cleanArgs.split(' ');
        const settingName = split[0];
        const settingVal = split.slice(1).join(' ');

        // Big settings object
        const settingsList: Record<string, any> = {
            clipprefixenabled: {
                desc: 'sets whether you need to type the prefix to use clips',
                value: 'true or false',
                propName: 'clipPrefixEnabled',
                namespaceType: 'both',
                valCast: (value: boolean): string => (value ? 'on' : 'off'),
                setCast: (newValue: string): boolean => {
                    const bool = convertBoolean(newValue);
                    if (bool === null) {
                        throw new Error('Invalid value for this setting');
                    }

                    return bool;
                },
            },
            deletecliprequest: {
                desc:
                    'sets whether the bot should delete the message that requests a clip',
                value: 'true or false',
                propName: 'deleteClipRequest',
                namespaceType: 'both',
                valCast: (value: boolean): string => (value ? 'on' : 'off'),
                setCast: (newValue: string): boolean => {
                    const bool = convertBoolean(newValue);
                    if (bool === null) {
                        throw new Error('Invalid value for this setting');
                    }

                    return bool;
                },
            },
            prefix: {
                desc: 'sets the custom prefix',
                value: 'any text',
                propName: 'customPrefix',
                namespaceType: 'both',
                valCast: (value: string): string => {
                    if (!value || value.length === 0) {
                        return 'none';
                    }
                    return value;
                },
                setCast: (newValue: string): string => newValue,
            },
            permrole: {
                desc:
                    'sets the role which has permissions to manage clips for the server',
                value: 'role name, role mention, or role id',
                propName: 'permRole',
                namespaceType: 'guild',
                valCast: (value: string): string => {
                    const role = message.guild?.roles.cache.get(value);

                    if (role === undefined) {
                        return 'none';
                    }

                    return role.name;
                },
                setCast: (newValue: string): string => {
                    let role: string = '';
                    const roleMentions = Array.from(
                        message.mentions.roles.values(),
                    )[0];
                    const roleByName = message.guild?.roles.cache.find(
                        (rol) => rol.name.toLowerCase() === newValue,
                    );
                    const roleById = message.guild?.roles.cache.get(newValue);
                    const everyoneMentions =
                        MessageMentions.ROLES_PATTERN.test(newValue) ||
                        newValue === 'everyone'
                            ? message.guild?.roles.everyone
                            : undefined;

                    if (roleMentions) {
                        role = roleMentions.id;
                    } else if (roleByName) {
                        role = roleByName.id;
                    } else if (roleById) {
                        role = roleById.id;
                    } else if (everyoneMentions) {
                        role = everyoneMentions.id;
                    } else {
                        throw new Error('Invalid value for this setting');
                    }

                    return role;
                },
            },
            createrequireperms: {
                desc:
                    'sets whether the create command should require permissions',
                value: 'true or false',
                propName: 'createRequirePerms',
                namespaceType: 'guild',
                valCast: (value: boolean): string => (value ? 'on' : 'off'),
                setCast: (newValue: string): boolean => {
                    const bool = convertBoolean(newValue);
                    if (bool === null) {
                        throw new Error('Invalid value for this setting');
                    }

                    return bool;
                },
            },
        };

        // Send main settings overview
        if (settingName === '') {
            let settingsListMessage = `view a setting's current value by typing \`${options.prefixAndTrigger} settingName\`
set a setting by typing \`${options.prefixAndTrigger} settingName newValue\`
reset a setting to its default by typing \`${options.prefixAndTrigger} settingName reset\`
you can reset all of your settings by typing \`${options.prefixAndTrigger} reset\`

the following settings can be configured:\n`;
            Object.keys(settingsList).forEach((name) => {
                const existsInNamespace = matchesNamespaceType(
                    options.runType,
                    settingsList[name].namespaceType,
                );
                if (!existsInNamespace) return;
                settingsListMessage += `- \`${name}\`: ${settingsList[name].desc}\n`;
            });
            sendMessage(settingsListMessage, message.channel);
            return;
        }

        // Reset all settings
        if (settingName === 'reset') {
            settings = {
                ...DefaultNamespaceSettings,
                namespaceId: settings.namespaceId,
            };
        } else {
            // Get setting
            if (
                settingsList[settingName] === undefined ||
                !matchesNamespaceType(
                    options.runType,
                    settingsList[settingName].namespaceType,
                )
            ) {
                sendError('that setting does not exist', message.channel);
                return;
            }

            const setting = settingsList[settingName];

            // Get setting val
            if (settingVal === '') {
                let settingMessage = `__**\`${settingName}\`**__
${setting.desc}

current value: \`${setting.valCast(settings[setting.propName])}\`

possible values: \`${setting.value}\``;
                sendMessage(settingMessage, message.channel);
                return;
            }

            // Set setting
            if (settingVal === 'reset') {
                settings[setting.propName] =
                    DefaultNamespaceSettings[setting.propName];
            } else {
                try {
                    const newVal = setting.setCast(settingVal);

                    settings[setting.propName] = newVal;
                } catch (error) {
                    sendError(
                        'that is an invalid value for this setting',
                        message.channel,
                    );
                    return;
                }
            }
        }

        try {
            await storage.setNamespaceSettings(settings);
        } catch (error) {
            sendError(
                'an error occurred while saving settings',
                message.channel,
            );
            return;
        }

        await sendMessage('settings saved successfully!', message.channel);
    },
};

export default Settings;
