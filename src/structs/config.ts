type DiscordActivityType =
    | 'PLAYING'
    | 'STREAMING'
    | 'LISTENING'
    | 'WATCHING'
    | 'COMPETING';

interface Config {
    name: string;
    version: string;
    activity: {
        name: string;
        type: DiscordActivityType;
    };
    developer: string;
    inviteLink: string;
    supportServer: string;
    defaultGuildPrefix: string;
    defaultPersonalPrefix: string;
    embedColor: string;
    tokenEnvVar: string;
    encKeyEnvVar: string;
    signKeyEnvVar: string;
    mongoUriEnvVar: string;
    readDotEnv: string;
    debugMode: boolean;
}

export default Config;
