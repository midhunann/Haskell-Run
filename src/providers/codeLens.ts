import * as vscode from 'vscode';

export class HaskellCodeLensProvider implements vscode.CodeLensProvider {
    private codeLenses: vscode.CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /^([a-zA-Z_][a-zA-Z0-9_']*)\s*::/;
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        if (vscode.workspace.getConfiguration("haskellRun").get("enableCodeLens", true)) {
            this.codeLenses = [];
            const text = document.getText();
            const lines = text.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = this.regex.exec(line);

                if (match) {
                    const functionName = match[1];
                    const position = new vscode.Position(i, 0);
                    const range = new vscode.Range(position, position);

                    this.codeLenses.push(
                        new vscode.CodeLens(range, {
                            title: "▶️ Run",
                            command: 'haskellrun.runFunction',
                            arguments: [document.uri, functionName]
                        })
                    );
                }
            }

            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return codeLens;
    }
}
