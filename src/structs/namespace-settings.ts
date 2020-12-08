export default interface NamespaceSettings {
    [index: string]: any;
    namespaceId: string;
    clipPrefixEnabled: boolean;
    customPrefix: string;
    deleteClipRequest: boolean;
    permRole: string;
    createRequirePerms: boolean;
}
