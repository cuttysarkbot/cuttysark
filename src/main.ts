// Hi there! You look great today!
import dotenv from 'dotenv';

import Discord, { Guild } from 'discord.js';

import config from './load-config';
import StorageConnector from './storage/storage-connector';
import ReadyListener from './listeners/ready-listener';
import MessageListener from './listeners/message-listener';
import GuildCreateListener from './listeners/guild-create-listener';
import { debug } from './utils/generic-utils';

import './command-manager';

debug('Main Process', 'Starting...');

if (config.readDotEnv) {
    dotenv.config();
    debug('Main Process', 'Read .env file');
}

// Initialize client
const client = new Discord.Client();

// Initialize Storage
const mongoUrl = process.env[config.mongoUriEnvVar];
const mongoEncKey = process.env[config.encKeyEnvVar];
const mongoSignKey = process.env[config.signKeyEnvVar];

// Check that Mongo config vars exist
if (mongoUrl === undefined || mongoUrl.length === 0) {
    throw new Error('Empty Mongo URL found');
}
if (mongoEncKey === undefined || mongoEncKey.length === 0) {
    throw new Error('Empty Mongo encryption key found');
}
if (mongoSignKey === undefined || mongoSignKey.length === 0) {
    throw new Error('Empty Mongo signing key found found');
}

const storageConnector = new StorageConnector();

storageConnector
    .init(mongoUrl, mongoEncKey, mongoSignKey)
    .then(() => {
        // Capture Events
        client.on('ready', ReadyListener.bind(ReadyListener, client));

        client.on(
            'message',
            MessageListener.bind(MessageListener, storageConnector),
        );

        client.on(
            'guildCreate',
            GuildCreateListener.bind(GuildCreateListener, storageConnector),
        );

        debug('Main Process', 'Registered listeners');
    })
    .catch((reason) => {
        throw new Error(`Error initializing storage: ${reason}`);
    });

// Initialize Bot, Log Errors
client.login(process.env[config.tokenEnvVar]);

// Good practice to catch uncaught promise rejections
process.on('unhandledRejection', (error: Error) => {
    console.error(`Uncaught Promise Error: \n ${error.stack}`);
});
