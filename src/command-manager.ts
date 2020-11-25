import Command from './structs/command';

// import Create from './commands/create';

const commands: Command[] = [];

const usedTriggers: string[] = [];

commands.forEach((cmd: Command) => {
    if (!cmd || !cmd.triggers || cmd.triggers.length === 0) {
        throw new Error('Empty command found');
    }
    cmd.triggers.forEach((trigger: string) => {
        if (usedTriggers.includes(trigger)) {
            throw new Error(
                `Command ${cmd.name} has duplicate trigger: ${trigger}`,
            );
        } else {
            usedTriggers.push(trigger);
        }
    });
});

export default commands;
