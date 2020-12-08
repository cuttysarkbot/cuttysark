import Command from './command';
import NamespaceSettings from './namespace-settings';

export default interface CommandOptions {
    runType: 'personal' | 'guild';
    prefixAndTrigger: string;
    namespaceSettings: NamespaceSettings;
    commandList: Record<string, Command>;
}
