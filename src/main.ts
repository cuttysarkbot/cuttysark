// Hi there! You look great today!

// Initialize Database Connection
import './utils/storage-utils';

import dotenv from 'dotenv';

import Discord from 'discord.js';

import config from './load-config';
import ReadyListener from './listeners/ready-listener';
import MessageListener from './listeners/message-listener';

import './command-manager';

if (config.readDotEnv) {
    dotenv.config();
}

console.log('Starting...');

const client = new Discord.Client();

// Capture Events
client.on('ready', () => {
    ReadyListener(client);
});

client.on('message', (message: Discord.Message) => {
    MessageListener(message);
});

// Initialize Bot, Log Errors
client.login(process.env[config.tokenEnvVar]);

// Good practice to catch uncaught promise rejections
process.on('unhandledRejection', (error: Error) => {
    console.error(`Uncaught Promise Error: \n ${error.stack}`);
});
