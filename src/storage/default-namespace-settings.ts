import NamespaceSettings from '../structs/namespace-settings';

const defaultNamespaceSettings: NamespaceSettings = {
    namespaceId: '',
    clipPrefixEnabled: true,
    // no custom prefix by default
    deleteClipRequest: false,
};

export default defaultNamespaceSettings;
