import Config from './structs/config';

import configJSON from './config.json';

// Not caught to throw if config is invalid
const configUnknown: unknown = configJSON;
const configObject = configUnknown as Config;

export default configObject;
