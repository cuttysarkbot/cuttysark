import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import { sendError, sendComplex } from '../utils/message-utils';

const Search: Command = {
    name: 'search',
    triggers: ['search', 'find'],
    desc: 'search for clips',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('Search', 'Search command executed');

        const clipList = await storage.listNamespaceClips(
            options.namespaceSettings.namespaceId,
        );

        if (clipList.length === 0) {
            await sendError('there are no clips yet', message.channel);
            return;
        }

        if (args.length === 0) {
            await sendError('please provide a search term', message.channel);
            return;
        }

        let searchResults = '';
        let resultCount = 0;

        clipList.forEach((clip) => {
            if (clip.token.includes(args)) {
                searchResults += `- \`${clip.token}\`\n`;
                resultCount += 1;
            }
        });

        if (searchResults.length > 1100 || resultCount > 30) {
            await sendError(
                'please provide a more specific search',
                message.channel,
            );
            return;
        }

        if (resultCount === 0) {
            await sendError('no results found', message.channel);
        } else {
            await sendComplex(
                {
                    title: `search | ${resultCount} result${
                        resultCount === 1 ? '' : 's'
                    }`,
                    description: searchResults,
                },
                message.channel,
            );
        }
    },
};

export default Search;
