import Command from '../structs/command';

import config from '../load-config';

import { debug } from '../utils/generic-utils';
import { convertBoolean } from '../utils/generic-utils';
import { sendMessage, sendError } from '../utils/message-utils';

import DefaultNamespaceSettings from '../storage/default-namespace-settings';

const Settings: Command = {
    name: 'settings',
    triggers: ['settings', 'preferences', 'options', 'configure', 'config'],
    desc: 'configure the bot',
    syntax: '<setting name> [new value or "reset"]',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Settings', 'Settings command executed');

        let settings = options.namespaceSettings;

        const cleanArgs = args.toLowerCase().trim();
        const split = cleanArgs.split(' ');
        const settingName = split[0];
        const settingVal = split.slice(1).join(' ');

        const settingsList: Record<string, any> = {
            clipprefixenabled: {
                desc: 'sets whether you need to type the prefix to use clips',
                value: 'true or false',
                propName: 'clipPrefixEnabled',
            },
            deletecliprequest: {
                desc:
                    'sets whether the bot should delete the message that requests a clip',
                value: 'true or false',
                propName: 'deleteClipRequest',
            },
            prefix: {
                desc: 'sets the custom prefix',
                value: 'any text',
                propName: 'customPrefix',
            },
        };

        if (settingName === '') {
            let settingsListMessage = `view a setting's current value by typing \`${options.prefixAndTrigger} settingName\`
set a setting by typing \`${options.prefixAndTrigger} settingName newValue\`
reset a setting to its default by typing \`${options.prefixAndTrigger} settingName reset\`
you can reset all of your settings by typing \`${options.prefixAndTrigger} reset\`

the following settings can be configured:\n`;
            Object.keys(settingsList).forEach((name) => {
                settingsListMessage += `- \`${name}\`: ${settingsList[name].desc}\n`;
            });
            sendMessage(settingsListMessage, message.channel);
            return;
        }

        if (settingName === 'reset') {
            settings = {
                ...DefaultNamespaceSettings,
                namespaceId: settings.namespaceId,
            };
        } else {
            if (settingsList[settingName] === undefined) {
                sendError('that setting does not exist', message.channel);
                return;
            }

            const setting = settingsList[settingName];

            if (settingVal === '') {
                let settingMessage = `__**\`${settingName}\`**__
${setting.desc}

current value: \`${settings[setting.propName] || 'none'}\`

possible values: \`${setting.value}\``;
                sendMessage(settingMessage, message.channel);
                return;
            }

            if (settingVal === 'reset') {
                settings[setting.propName] =
                    DefaultNamespaceSettings[setting.propName];
            } else {
                let newVal;
                switch (settingName) {
                    case 'clipprefixenabled': {
                        const bool = convertBoolean(settingVal);
                        if (bool === null) {
                            sendError(
                                'that is an invalid value for this setting',
                                message.channel,
                            );
                            return;
                        }

                        newVal = bool;
                        break;
                    }
                    case 'deletecliprequest': {
                        const bool = convertBoolean(settingVal);
                        if (bool === null) {
                            sendError(
                                'that is an invalid value for this setting',
                                message.channel,
                            );
                            return;
                        }

                        newVal = bool;
                        break;
                    }
                    case 'prefix': {
                        newVal = settingVal;
                        break;
                    }
                }

                settings[setting.propName] = newVal;
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
