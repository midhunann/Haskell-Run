import * as vscode from 'vscode';
import * as path from 'path';
import { EnvironmentManager } from '../utils/environment';

interface HaskellBreakpoint {
    id: number;
    line: number;
    verified: boolean;
}

export class HaskellDebugProvider implements vscode.DebugConfigurationProvider {
    private breakpoints = new Map<string, HaskellBreakpoint[]>();
    private environmentManager: EnvironmentManager;

    constructor() {
        this.environmentManager = EnvironmentManager.getInstance();
    }

    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    async resolveDebugConfiguration(
        folder: vscode.WorkspaceFolder | undefined,
        config: vscode.DebugConfiguration,
        token?: vscode.CancellationToken
    ): Promise<vscode.DebugConfiguration | undefined> {
        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document.languageId === 'haskell') {
                config.type = 'ghci';
                config.name = 'Debug Haskell';
                config.request = 'launch';
                config.program = '${file}';
                config.stopOnEntry = true;
            }
        }

        if (!config.program) {
            await vscode.window.showInformationMessage("Cannot find a program to debug");
            return undefined;
        }

        // Validate Haskell environment
        if (folder) {
            const isValid = await this.environmentManager.validateEnvironment(folder.uri.fsPath);
            if (!isValid) {
                return undefined;
            }
        }

        return config;
    }

    /**
     * Provide initial debug configurations for 'launch.json'
     */
    provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined): vscode.ProviderResult<vscode.DebugConfiguration[]> {
        return [
            {
                name: "Debug Haskell Program",
                type: "ghci",
                request: "launch",
                program: "${file}",
                stopOnEntry: true,
                args: [],
                cwd: "${workspaceFolder}"
            },
            {
                name: "Debug with Arguments",
                type: "ghci",
                request: "launch",
                program: "${file}",
                args: ["${input:args}"],
                cwd: "${workspaceFolder}"
            }
        ];
    }

    /**
     * Try to add breakpoints to the debug session
     */
    async setBreakPoints(filePath: string, breakpoints: vscode.SourceBreakpoint[]): Promise<void> {
        const fileBreakpoints: HaskellBreakpoint[] = [];
        let id = 1;

        for (const bp of breakpoints) {
            fileBreakpoints.push({
                id: id++,
                line: bp.location.range.start.line,
                verified: true
            });
        }

        this.breakpoints.set(filePath, fileBreakpoints);
    }

    /**
     * Clear all breakpoints for a file
     */
    clearBreakpoints(filePath: string): void {
        this.breakpoints.delete(filePath);
    }

    /**
     * Get breakpoints for a file
     */
    getBreakpoints(filePath: string): HaskellBreakpoint[] {
        return this.breakpoints.get(filePath) || [];
    }
}
