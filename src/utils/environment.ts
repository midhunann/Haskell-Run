import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

interface HaskellEnvironment {
    ghci: string | null;
    runghc: string | null;
    stack: string | null;
}

export class EnvironmentManager {
    private static instance: EnvironmentManager;
    private envCache: Map<string, HaskellEnvironment> = new Map();
    private outputChannel: vscode.OutputChannel;
    private checking: boolean = false;

    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Haskell Run');
    }

    public static getInstance(): EnvironmentManager {
        if (!EnvironmentManager.instance) {
            EnvironmentManager.instance = new EnvironmentManager();
        }
        return EnvironmentManager.instance;
    }

    public async validateEnvironment(workspacePath: string): Promise<boolean> {
        if (this.checking) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.checking) {
                        clearInterval(checkInterval);
                        resolve(this.isEnvironmentValid(this.envCache.get(workspacePath)!));
                    }
                }, 100);
            });
        }

        this.checking = true;

        try {
            // Check cache first
            if (this.envCache.has(workspacePath)) {
                return this.isEnvironmentValid(this.envCache.get(workspacePath)!);
            }

            const env = await this.detectTools();
            this.envCache.set(workspacePath, env);

            if (!this.isEnvironmentValid(env)) {
                await this.showInstallPrompt();
                return false;
            }

            return true;
        } catch (error) {
            this.outputChannel.appendLine(`Error validating environment: ${error}`);
            return false;
        } finally {
            this.checking = false;
        }
    }

    private async detectTools(): Promise<HaskellEnvironment> {
        const env: HaskellEnvironment = {
            ghci: null,
            runghc: null,
            stack: null
        };

        const checkTool = async (tool: string): Promise<string | null> => {
            try {
                const { stdout } = await promisify(exec)(`${tool} --version`);
                // If the command succeeds, we assume the tool is available.
                // We return the tool name or version string as confirmation.
                return stdout.trim() || tool;
            } catch (error) {
                return null;
            }
        };

        // Run checks in parallel
        const [ghciResult, runghcResult, stackResult] = await Promise.all([
            checkTool('ghci'),
            checkTool('runghc'),
            checkTool('stack')
        ]);

        env.ghci = ghciResult;
        env.runghc = runghcResult;
        env.stack = stackResult;

        return env;
    }

    private isEnvironmentValid(env: HaskellEnvironment): boolean {
        const hasGhci = !!env.ghci;
        const hasRunghc = !!env.runghc;
        const hasStack = !!env.stack;

        if (!hasGhci && !hasStack) {
            this.outputChannel.appendLine('Neither GHCi nor Stack found in environment');
            return false;
        }

        if (!hasRunghc && !hasStack) {
            this.outputChannel.appendLine('Neither runghc nor Stack found in environment');
            return false;
        }

        return true;
    }

    private async showInstallPrompt(): Promise<void> {
        const selection = await vscode.window.showErrorMessage(
            'Haskell tools (GHCi/Stack) not found. Would you like to install them?',
            'Install via GHCup',
            'View Setup Guide',
            'Don\'t Show Again'
        );

        if (selection === 'Install via GHCup') {
            const terminal = vscode.window.createTerminal('Haskell Setup');
            terminal.show();
            if (process.platform === 'win32') {
                vscode.env.openExternal(vscode.Uri.parse('https://www.haskell.org/ghcup/install/#windows'));
            } else {
                terminal.sendText('curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh');
            }
        } else if (selection === 'View Setup Guide') {
            vscode.env.openExternal(vscode.Uri.parse('https://discourse.haskell.org/t/ghcup-installation-guide'));
        } else if (selection === 'Don\'t Show Again') {
            await vscode.workspace.getConfiguration('haskellRun').update('showInstallPrompt', false, true);
        }
    }

    public async checkRequiredTools(): Promise<string[]> {
        const env = await this.detectTools();
        const missingTools: string[] = [];

        if (!env.ghci) { missingTools.push('ghci'); }
        if (!env.runghc) { missingTools.push('runghc'); }
        if (!env.stack) { missingTools.push('stack'); }

        return missingTools;
    }

    public async installMissingTools(tools: string[], outputChannel: vscode.OutputChannel): Promise<void> {
        const platform = process.platform;

        if (platform === 'win32') {
            await this.installToolsWindows(tools, outputChannel);
        } else {
            await this.installToolsUnix(tools, outputChannel);
        }
    }

    private async installToolsWindows(tools: string[], outputChannel: vscode.OutputChannel): Promise<void> {
        // Check if chocolatey is installed
        const terminal = vscode.window.createTerminal('Haskell Tool Installation');
        terminal.show();

        outputChannel.appendLine('Checking for Chocolatey package manager...');
        terminal.sendText('where choco.exe', true);

        // Wait for chocolatey check
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Install GHCup on Windows
        terminal.sendText('powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString(\'https://www.haskell.org/ghcup/sh/bootstrap-haskell.ps1\'))"');

        outputChannel.appendLine('Installing Haskell tools via GHCup...');
    }

    private async installToolsUnix(tools: string[], outputChannel: vscode.OutputChannel): Promise<void> {
        const terminal = vscode.window.createTerminal('Haskell Tool Installation');
        terminal.show();

        outputChannel.appendLine('Installing GHCup...');
        terminal.sendText('curl --proto \'=https\' --tlsv1.2 -sSf https://get-ghcup.haskell.org | sh');

        // Source ghcup environment
        terminal.sendText('source ~/.ghcup/env');

        // Install required tools
        for (const tool of tools) {
            outputChannel.appendLine(`Installing ${tool}...`);
            terminal.sendText(`ghcup install ${tool}`);
        }

        outputChannel.appendLine('Installation complete. Please restart VS Code to use the new tools.');
    }

    public getOutputChannel(): vscode.OutputChannel {
        return this.outputChannel;
    }

    public clearCache(): void {
        this.envCache.clear();
    }
}
