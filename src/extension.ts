import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import { EnvironmentManager } from './utils/environment';
import { DiagnosticsManager } from './utils/diagnostics';
import { ReplManager } from './utils/repl';
import { HaskellCodeLensProvider } from './providers/codeLens';
import { HaskellFunctionProvider } from './providers/treeView';

export async function activate(context: vscode.ExtensionContext) {
    console.log('Haskell Run extension activated.');

    // Create output channel
    const outputChannel = vscode.window.createOutputChannel('Haskell Run');
    context.subscriptions.push(outputChannel);

    // Initialize managers
    const environmentManager = EnvironmentManager.getInstance();
    const diagnosticsManager = DiagnosticsManager.getInstance();
    const replManager = ReplManager.getInstance();

    // Initialize providers
    const codeLensProvider = new HaskellCodeLensProvider();
    const treeViewProvider = new HaskellFunctionProvider();
    let providersRegistered = false;

    // Function to check for Haskell files in workspace
    async function checkForHaskellFiles(): Promise<boolean> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return false;
        }

        try {
            // Search for .hs files in the workspace
            const haskellFiles = await vscode.workspace.findFiles('**/*.hs', '**/node_modules/**', 1);
            return haskellFiles.length > 0;
        } catch (error) {
            outputChannel.appendLine(`Error checking for Haskell files: ${error}`);
            return false;
        }
    }

    // Function to update the context variable and re-register providers
    async function updateHaskellFilesContext() {
        const hasHaskellFiles = await checkForHaskellFiles();
        await vscode.commands.executeCommand('setContext', 'haskellrun.hasHaskellFiles', hasHaskellFiles);
        outputChannel.appendLine(`[DEBUG] Haskell files present: ${hasHaskellFiles}`);
        
        // Register providers when Haskell files are found
        if (hasHaskellFiles && !providersRegistered) {
            context.subscriptions.push(
                vscode.languages.registerCodeLensProvider({ language: 'haskell' }, codeLensProvider),
                vscode.window.registerTreeDataProvider('haskellFunctions', treeViewProvider),
                treeViewProvider // Ensure provider is disposed on deactivation
            );
            providersRegistered = true;
            outputChannel.appendLine('[DEBUG] Providers registered due to Haskell files found');
        }
    }

    // Initial check for Haskell files
    await updateHaskellFilesContext();

    // Watch for file system changes to update the context
    const fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.hs');
    
    fileWatcher.onDidCreate(async () => {
        await updateHaskellFilesContext();
    });
    
    fileWatcher.onDidDelete(async () => {
        await updateHaskellFilesContext();
    });

    context.subscriptions.push(fileWatcher);

    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    context.subscriptions.push(statusBarItem);

    // Validate environment on startup
    const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
    if (workspacePath) {
        const isValid = await environmentManager.validateEnvironment(workspacePath);
        if (isValid) {
            outputChannel.appendLine('Environment validation successful');
            vscode.window.showInformationMessage('Haskell Run: Environment ready');

            // Show installation prompt if tools are missing
            const missingTools = await environmentManager.checkRequiredTools();
            if (missingTools.length > 0) {
                const install = 'Install';
                const showDocs = 'Show Setup Guide';
                const response = await vscode.window.showWarningMessage(
                    `Missing required tools: ${missingTools.join(', ')}`,
                    install,
                    showDocs
                );

                if (response === install) {
                    outputChannel.show();
                    outputChannel.appendLine('Installing missing tools...');
                    await environmentManager.installMissingTools(missingTools, outputChannel);
                } else if (response === showDocs) {
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/midhunann/Haskell-Run/blob/main/docs/setup.md'));
                }
            }

            // Show welcome message on first activation
            const hasShownWelcome = context.globalState.get('haskellrun.hasShownWelcome');
            if (!hasShownWelcome) {
                vscode.window.showInformationMessage(
                    'Welcome to Haskell Run! Click the ▶️ button to run your Haskell file, or use the sidebar to explore functions.',
                    'View Documentation'
                ).then(selection => {
                    if (selection === 'View Documentation') {
                        vscode.env.openExternal(vscode.Uri.parse('https://github.com/midhunann/Haskell-Run#readme'));
                    }
                });
                context.globalState.update('haskellrun.hasShownWelcome', true);
            }
        }
    }

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
        
        // Show progress
        statusBarItem.text = "$(sync~spin) Running Haskell file...";
        statusBarItem.show();

        try {
            const config = vscode.workspace.getConfiguration('haskellRun');
            const env = config.get('defaultRunner', 'runghc');
            const timeout = config.get('timeout', 30000);
            const reuseTerminal = config.get('reuseTerminal', true);

            let terminal: vscode.Terminal;
            if (reuseTerminal) {
                terminal = vscode.window.terminals.find(t => t.name === 'Haskell Run') || 
                          vscode.window.createTerminal('Haskell Run');
            } else {
                terminal = vscode.window.createTerminal('Haskell Run');
            }

            terminal.show();
            
            // Run the command directly in terminal for immediate output
            const command = `${env} "${filePath}"`;
            terminal.sendText(command);
            
            // Simplified success feedback - no need to capture output for basic file execution
            statusBarItem.text = "$(check) Haskell Run: Executed";
            vscode.window.showInformationMessage('Haskell file sent to terminal for execution');
        } catch (error) {
            statusBarItem.text = "$(error) Haskell Run: Error";
            vscode.window.showErrorMessage(`Error: ${error}`);
        } finally {
            setTimeout(() => statusBarItem.hide(), 3000);
        }
    });

    // Command to run the selected Haskell function
    const runSelectedFunction = vscode.commands.registerCommand('haskellrun.runFunction', async (uri?: vscode.Uri, functionName?: string) => {
        let document: vscode.TextDocument;
        let actualFunctionName: string;
        let documentUri: vscode.Uri;

        // Handle two cases: called from CodeLens/TreeView (with parameters) or from menu (with text selection)
        if (uri && functionName && typeof functionName === 'string') {
            // Called from CodeLens or TreeView - this is the working path
            outputChannel.appendLine(`[DEBUG] Called from CodeLens/TreeView with uri: ${uri.fsPath}, function: ${functionName}`);
            document = await vscode.workspace.openTextDocument(uri);
            actualFunctionName = functionName;
            documentUri = uri;
        } else {
            // Called from editor menu with text selection - need to make this work the same way
            outputChannel.appendLine(`[DEBUG] Called from text selection`);
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found.');
                return;
            }

            document = editor.document;
            documentUri = document.uri;
            
            if (document.languageId !== 'haskell') {
                vscode.window.showErrorMessage('This command is only available for Haskell files.');
                return;
            }

            // Get selected text
            const selection = editor.selection;
            if (selection.isEmpty) {
                vscode.window.showErrorMessage('Please select a function name to run.');
                return;
            }

            actualFunctionName = document.getText(selection).trim();
            outputChannel.appendLine(`[DEBUG] Selected function name: ${actualFunctionName}`);
            
            // Validate that the selection looks like a function name
            if (!/^[a-zA-Z_][a-zA-Z0-9_']*$/.test(actualFunctionName)) {
                vscode.window.showErrorMessage('Selected text is not a valid function name.');
                return;
            }
        }

        if (document.languageId !== 'haskell') {
            vscode.window.showErrorMessage('This command is only available for Haskell files.');
            return;
        }

        // Save the document first to ensure latest changes are available
        if (document.isDirty) {
            await document.save();
        }

        try {
            statusBarItem.text = "$(sync~spin) Running function...";
            statusBarItem.show();

            outputChannel.appendLine(`[DEBUG] Running function: ${actualFunctionName} from file: ${documentUri.fsPath}`);

            // Get function signature
            const text = document.getText();
            const lines = text.split('\n');
            const signatureRegex = new RegExp(`^${actualFunctionName}\\s*::\\s*(.+)`);
            let signature = '';

            for (const line of lines) {
                const match = signatureRegex.exec(line);
                if (match) {
                    signature = match[1].trim();
                    outputChannel.appendLine(`[DEBUG] Found signature: ${actualFunctionName} :: ${signature}`);
                    break;
                }
            }

            // Store the original function name for display purposes
            const originalFunctionName = actualFunctionName;
            
            // If function has arguments, show input box
            if (signature.includes('->')) {
                outputChannel.appendLine(`[DEBUG] Function requires arguments`);
                const args = await vscode.window.showInputBox({
                    prompt: `Enter arguments for ${actualFunctionName} :: ${signature}`,
                    placeHolder: 'e.g. 42 "hello"'
                });
                
                if (args === undefined) {
                    statusBarItem.hide();
                    return; // User cancelled
                }
                actualFunctionName = `${actualFunctionName} ${args}`;
                outputChannel.appendLine(`[DEBUG] Function with args: ${actualFunctionName}`);
            }

            // Use REPL manager to evaluate - same logic for both paths
            if (workspacePath) {
                outputChannel.appendLine(`[DEBUG] Getting REPL for workspace: ${workspacePath}`);
                
                // Get or create REPL terminal
                const repl = await replManager.getOrCreateRepl(workspacePath);
                repl.show(); // Make sure the terminal is visible
                
                outputChannel.appendLine(`[DEBUG] Loading module: ${documentUri.fsPath}`);
                await replManager.loadModule(workspacePath, documentUri.fsPath);
                
                // Add a small delay to ensure module is loaded
                await new Promise(resolve => setTimeout(resolve, 500));
                
                outputChannel.appendLine(`[DEBUG] Evaluating function: ${actualFunctionName}`);
                await replManager.evaluateInRepl(workspacePath, actualFunctionName);
                
                statusBarItem.text = "$(check) Function executed successfully";
                outputChannel.appendLine(`[DEBUG] Function ${actualFunctionName} executed in REPL`);
                
                // Show a notification to confirm execution using the original function name
                vscode.window.showInformationMessage(`Function '${originalFunctionName}' executed in REPL`);
            } else {
                vscode.window.showErrorMessage('No workspace found');
                statusBarItem.text = "$(error) Function execution failed";
            }

        } catch (error) {
            statusBarItem.text = "$(error) Function execution failed";
            const errorMessage = `Error running function: ${error}`;
            vscode.window.showErrorMessage(errorMessage);
            outputChannel.appendLine(`[ERROR] ${errorMessage}`);
        } finally {
            setTimeout(() => statusBarItem.hide(), 3000);
        }
    });

    // REPL management commands
    const restartRepl = vscode.commands.registerCommand('haskellrun.restartRepl', async () => {
        if (workspacePath) {
            await replManager.restartRepl(workspacePath);
            vscode.window.showInformationMessage('REPL restarted');
        }
    });

    const clearRepl = vscode.commands.registerCommand('haskellrun.clearRepl', () => {
        if (workspacePath) {
            replManager.clearRepl(workspacePath);
        }
    });

    // Register all commands
    const reportIssue = vscode.commands.registerCommand('haskellrun.reportIssue', async () => {
        const info = await vscode.env.machineId;
        const os = process.platform;
        const vscodeVersion = vscode.version;
        const extensionVersion = vscode.extensions.getExtension('midhunan.haskellrun')?.packageJSON.version;
        
        const body = encodeURIComponent(`
**VS Code Version:** ${vscodeVersion}
**Extension Version:** ${extensionVersion}
**OS:** ${os}
**Machine ID:** ${info}

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Additional Context:**
`);

        const url = `https://github.com/midhunann/Haskell-Run/issues/new?body=${body}`;
        vscode.env.openExternal(vscode.Uri.parse(url));
    });

    context.subscriptions.push(
        runHaskellFile,
        runSelectedFunction,
        restartRepl,
        clearRepl,
        reportIssue
    );
}

export function deactivate() {
    // Clean up
    ReplManager.getInstance().disposeAll();
    console.log('Haskell Run extension deactivated.');
}
