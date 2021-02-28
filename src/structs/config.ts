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
    voteURL: string;
    defaultGuildPrefix: string;
    defaultPersonalPrefix: string;
    backupGuildId: string;
    backupChannelId: string;
    embedColor: string;
    tokenEnvVar: string;
    encKeyEnvVar: string;
    signKeyEnvVar: string;
    mongoUriEnvVar: string;
    readDotEnv: string;
    debugMode: boolean;
}

export default Config;
