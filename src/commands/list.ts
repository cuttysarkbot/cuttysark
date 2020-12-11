import Command from '../structs/command';

import { debug } from '../utils/generic-utils';
import { sendError, sendComplex } from '../utils/message-utils';

const List: Command = {
    name: 'list',
    triggers: ['list'],
    desc: 'list clips',
    syntax: '',
    commandType: 'both',
    run: async (message, storage, args, options) => {
        debug('List', 'List command executed');

        const clipList = await storage.listNamespaceClips(
            options.namespaceSettings.namespaceId,
        );

        if (clipList.length === 0) {
            await sendError('there are no clips yet', message.channel);
            return;
        }

        let pageNum: number = 1;
        const parsedArgs = parseInt(args, 10);

        if (args !== '' && !isNaN(parsedArgs)) {
            pageNum = parsedArgs;
        }

        const pages: string[] = [''];
        let currentPage = 0;
        let pageLength = 0;

        for (let i = 0; i < clipList.length; i += 1) {
            const newPage: string = `${pages[currentPage]}- \`${clipList[i].token}\`\n`;
            pageLength += 1;

            // 1100 is kinda arbitrary
            if (newPage.length < 1100 && pageLength <= 10) {
                pages[currentPage] = newPage;
            } else {
                currentPage += 1;
                pageLength = 1;
                pages.push(`- \`${clipList[i].token}\`\n`);
            }
        }

        const pageToSend = pages[pageNum - 1];

        if (!pageToSend) {
            await sendError("that page doesn't exist", message.channel);
            return;
        }

        await sendComplex(
            {
                title: `you are viewing page ${pageNum} of ${pages.length}`,
                description: pageToSend,
            },
            message.channel,
        );
    },
};

export default List;
