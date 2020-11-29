type DiscordActivityType =
    | 'PLAYING'
    | 'STREAMING'
    | 'LISTENING'
    | 'WATCHING'
    | 'COMPETING';

interface Config {
    name: string;
    activity: {
        name: string;
        type: DiscordActivityType;
    };
    defaultPrefix: string[];
    tokenEnvVar: string;
    encKeyEnvVar: string;
    signKeyEnvVar: string;
    mongoUriEnvVar: string;
    readDotEnv: string;
    debugMode: boolean;
}

export default Config;
