import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

export function activate(context: vscode.ExtensionContext) {
    console.log("HaskellRunner activated!");

    // Command to run the entire Haskell file
    let runHaskellFile = vscode.commands.registerCommand("haskellrunner.runHaskell", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found!");
            return;
        }

        const document = editor.document;
        if (document.languageId !== "haskell") {
            vscode.window.showErrorMessage("This command is only available for Haskell files.");
            return;
        }

        await document.save(); // Ensure the file is saved before running

        const filePath = document.fileName;
        const terminal = vscode.window.createTerminal("Haskell Runner");
        terminal.show();
        terminal.sendText(`ghci "${filePath}"`);
    });

    // Command to run a selected function
    let runSelectedFunction = vscode.commands.registerCommand("haskellrunner.runFunction", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found!");
            return;
        }

        const document = editor.document;
        if (document.languageId !== "haskell") {
            vscode.window.showErrorMessage("This command is only available for Haskell files.");
            return;
        }

        const selection = editor.selection;
        const selectedText = document.getText(selection).trim();

        if (!selectedText) {
            vscode.window.showErrorMessage("No function selected!");
            return;
        }

        const terminal = vscode.window.createTerminal("Haskell Runner");
        terminal.show();
        terminal.sendText(`ghci -e "${selectedText}"`);
    });

    context.subscriptions.push(runHaskellFile);
    context.subscriptions.push(runSelectedFunction);
}

export function deactivate() {
    console.log("HaskellRunner deactivated!");
}
