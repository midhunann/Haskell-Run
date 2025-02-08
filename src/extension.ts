import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Haskell Run extension activated.');

    // Command to run the entire Haskell file
    const runHaskellFile = vscode.commands.registerCommand('haskellrun.runHaskell', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'haskell') {
            vscode.window.showErrorMessage('This command is only available for Haskell files.');
            return;
        }

        if (document.isUntitled) {
            vscode.window.showErrorMessage('Please save the file before running.');
            return;
        }

        await document.save();

        const filePath = document.fileName;
        const terminal = vscode.window.createTerminal('Haskell Run');
        terminal.show();
        terminal.sendText(`runghc "${filePath}"`);
    });

    // Command to run the selected Haskell function
    const runSelectedFunction = vscode.commands.registerCommand('haskellrun.runFunction', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        if (document.languageId !== 'haskell') {
            vscode.window.showErrorMessage('This command is only available for Haskell files.');
            return;
        }

        const selection = editor.selection;
        const selectedText = document.getText(selection).trim();
        if (!selectedText) {
            vscode.window.showErrorMessage('No function selected.');
            return;
        }

        const filePath = document.fileName;
        const terminal = vscode.window.createTerminal('Haskell Run');
        terminal.show();
        terminal.sendText(`ghci "${filePath}"`);
        terminal.sendText(selectedText);
    });

    // Register the commands
    context.subscriptions.push(runHaskellFile, runSelectedFunction);
}

export function deactivate() {
    console.log('Haskell Run extension deactivated.');
}
