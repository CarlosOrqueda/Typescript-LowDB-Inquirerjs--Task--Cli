import inquirer from 'inquirer';
import { JsonTaskCollection } from './models/JsonTaskCollection';
import { task } from './exampleData';
import { TaskItem } from './models/TaskItem';

enum Commands {
    Add = 'Add new task',
    Complete = 'Complete task',
    Toggle = 'Show/Hide Complete',
    Purgue = 'Remove complete tasks',
    Quit = 'Quit'
}

const collection = new JsonTaskCollection('Carlos', task);
let showCompleted: boolean = true;

function displayTaskList(): void {
    console.log(`${collection.username}'s Task (${collection.getTaskCounts().incomplete}) task to do`);
    collection.getTaskItems(showCompleted).forEach(task => task.printDetails());
};

async function promptAdd(): Promise<void> {
    console.clear();
    const answers = await inquirer.prompt({
        type: "input",
        name: 'add',
        message: 'Enter task'
    });
    if (answers['add'] !== '') {
        collection.addTask(answers['add']);
    };
    promptUser();
};

async function promptComplete(): Promise<void> {

    console.clear();
    const answers = await inquirer.prompt({
        type: 'checkbox',
        name: 'complete',
        message: 'Mark completed tasks',
        choices: collection.getTaskItems(showCompleted).map(item => ({
            name: item.task,
            value: item.id,
            checked: item.complete
        }))
    });
    let completedTask = answers['complete'] as number[];
    collection.getTaskItems(true).forEach(item => collection.markComplete(item.id, completeVariant(showCompleted, completedTask, item)));
    promptUser();
};

function completeVariant(showCompletedVariant: boolean, completedTask: number[], item: TaskItem): boolean {
    if (showCompletedVariant)
        return (completedTask.find(id => id === item.id) != undefined);
    else {
        let result = completedTask.find(id => id === item.id) != undefined;
        return item.complete ? result = true : result;
    }
}

async function promptUser() {
    displayTaskList();

    const answers = await inquirer.prompt({
        type: 'list',
        name: 'command',
        message: 'Choose option',
        choices: Object.values(Commands)
    });

    switch (answers['command']) {
        case Commands.Add:
            promptAdd();
            break;

        case Commands.Toggle:
            showCompleted = !showCompleted;
            promptUser();
            break;

        case Commands.Complete:
            if (collection.getTaskCounts().incomplete > 0) {
                promptComplete();
            } else {
                promptUser();
            };
            break;

        case Commands.Purgue:
            collection.removeComplete();
            promptUser();
    };

};

promptUser();