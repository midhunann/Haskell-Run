import * as vscode from 'vscode';
import * as path from 'path';

class HaskellFunction extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly type: string,
        public readonly modulePath: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = `${label} :: ${type}`;
        this.command = {
            command: 'haskellrun.runFunction',
            title: 'Run Function',
            arguments: [vscode.Uri.file(modulePath), label]
        };
    }

    iconPath = new vscode.ThemeIcon('symbol-function');
    contextValue = 'haskellFunction';
}

export class HaskellFunctionProvider implements vscode.TreeDataProvider<HaskellFunction> {
    private _onDidChangeTreeData: vscode.EventEmitter<HaskellFunction | undefined | void> = new vscode.EventEmitter<HaskellFunction | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<HaskellFunction | undefined | void> = this._onDidChangeTreeData.event;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        // Watch for active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.refresh();
            })
        );
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: HaskellFunction): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: HaskellFunction): Promise<HaskellFunction[]> {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor || editor.document.languageId !== 'haskell') {
            return [];
        }

        if (element) {
            return []; // No nested items
        }

        const document = editor.document;
        const text = document.getText();
        const lines = text.split('\n');
        const functions: HaskellFunction[] = [];

        // Parse function signatures
        const regex = /^([a-zA-Z_][a-zA-Z0-9_']*)\s*::\s*(.+)/;
        for (let i = 0; i < lines.length; i++) {
            const match = regex.exec(lines[i]);
            if (match) {
                functions.push(new HaskellFunction(
                    match[1],
                    match[2].trim(),
                    document.uri.fsPath,
                    vscode.TreeItemCollapsibleState.None
                ));
            }
        }

        return functions;
    }
}
