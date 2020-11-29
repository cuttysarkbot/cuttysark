# Cutty Sark

Cutty Sark is a ~~clipper ship~~Discord bot to create message clips which can be used over and over.

## Development

We use [yarn](https://yarnpkg.com) as our package manager, so you should too. Run `yarn install --production=false` to install all the dependencies (and development tools) for this project.

We also use a whole bunch of tools to make our code nice. This includes `eslint` and `prettier`. Make sure to check your code by them before committing.

### VSCode

If you use VSCode, using these tools will be a whole lot easier. Just install the [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), and [editorconfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) extensions and it should work pretty much out of the box.

For fun automatic prettier magic when you save your files, set your `Editor: Default Formatter` to `esbenp.prettier-vscode` and enable `Editor: Format on Save` in your VSCode settings.

## Configuration

This project has a few configuration options that you should make note of. Configuration is primarily done through the `src/config.json` file, which contains some options that the bot should use. Rename `config.sample.json` to `config.json` and edit the configuration as needed before running the project.

Please note that some of the config options are named `*EnvVar`, which means that the option refers to the name of an environment variable which must be present on your system whose value will be read to find the corresponding information. For example, your bot's token will need to be set to an environment variable which has the same name as the value of `tokenEnvVar`.

The `readDotEnv` config option refers to whether the bot should read any `.env` files present. `.env` files allow you to configure environment variables for the program without having to actually change system settings. This is very convenient for development, so I recommend setting this to `true` while testing the bot. **Do not use this in production environments. You must actually set the environment variables when running the bot.**

If you want to use this feature, make a file called `.env` in this directory (not in `src`) and give it contents similar to the following. [More info on how to configure `.env` files.](https://www.techrepublic.com/article/how-to-use-docker-env-file/)

An example of a `.env` file with the default config variable names:

```
CUTTYSARK_DISCORD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaa.aaaaaa.aa-aaaaaaaaaaaaaaaaaaaaaaaa
CUTTYSARK_STORAGE_ENC_KEY=nfUI#Ne289nf9ujisoj4289jfOIj4289jf2894ufj9we
CUTTYSARK_STORAGE_SIGN_KEY=ijodfjNWG@984n2ui308HUD42iofn2398340=@489jN8942h49nfuJNn
CUTTYSARK_STORAGE_MONGO_URI=mongodb://myDBReader:D1fficultP%40ssw0rd@mongodb0.example.com:27017
```

### Storage and Keys

Cutty Sark uses MongoDB as its database provider, so you'll need an instance of that to run the bot. If running the bot in a development environment, you can just install the [MongoDB community server](https://www.mongodb.com/try/download/community) onto your computer and use the URL `mongodb://localhost:27017` to access it.

Cutty Sark stores data encrypted and signed at rest, so you'll need to generate some keys to run the bot. If you have OpenSSL installed, you can just run this command to generate the 32-bit encryption key:

```sh
openssl rand -base64 32
```

and this command to generate the 64-bit signing key:

```sh
openssl rand -base64 64
```

> _Note: If you're on Windows, you probably won't have OpenSSL installed, but you can open Git Bash and run the commands in there._

## License

Copyright 2020 The Cutty Sark Authors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this project except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
