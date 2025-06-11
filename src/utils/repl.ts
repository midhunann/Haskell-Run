import * as vscode from 'vscode';
import { EnvironmentManager } from './environment';

export class ReplManager {
    private static instance: ReplManager;
    private terminals: Map<string, vscode.Terminal> = new Map();
    private modules: Map<string, Set<string>> = new Map();

    private constructor() {}

    public static getInstance(): ReplManager {
        if (!ReplManager.instance) {
            ReplManager.instance = new ReplManager();
        }
        return ReplManager.instance;
    }

    public async getOrCreateRepl(workspacePath: string): Promise<vscode.Terminal> {
        if (this.terminals.has(workspacePath)) {
            return this.terminals.get(workspacePath)!;
        }

        const terminal = vscode.window.createTerminal({
            name: 'Haskell REPL',
            cwd: workspacePath
        });

        this.terminals.set(workspacePath, terminal);
        this.modules.set(workspacePath, new Set());

        // Start GHCi
        terminal.show();
        terminal.sendText('ghci');
        
        return terminal;
    }

    public async loadModule(workspacePath: string, modulePath: string): Promise<void> {
        const terminal = await this.getOrCreateRepl(workspacePath);
        const modules = this.modules.get(workspacePath)!;

        // Always reload the current module to ensure latest changes are loaded
        terminal.show(); // Make sure terminal is visible
        terminal.sendText(`:load "${modulePath}"`);
        modules.add(modulePath);
        
        // Give GHCi a moment to load the module
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    public async evaluateInRepl(workspacePath: string, code: string): Promise<void> {
        const terminal = await this.getOrCreateRepl(workspacePath);
        terminal.show(); // Ensure terminal is visible when running function
        
        // Add a small delay to ensure module is loaded before evaluation
        await new Promise(resolve => setTimeout(resolve, 200));
        
        terminal.sendText(code);
        
        // Give a moment for the evaluation to complete
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    public async restartRepl(workspacePath: string): Promise<void> {
        if (this.terminals.has(workspacePath)) {
            const terminal = this.terminals.get(workspacePath)!;
            terminal.dispose();
            this.terminals.delete(workspacePath);
            this.modules.delete(workspacePath);
        }

        await this.getOrCreateRepl(workspacePath);
    }

    public clearRepl(workspacePath: string): void {
        const terminal = this.terminals.get(workspacePath);
        if (terminal) {
            terminal.sendText(':!clear');  // Clear terminal
            terminal.sendText(':reload');  // Reload modules
        }
    }

    public disposeAll(): void {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
        this.modules.clear();
    }
}
