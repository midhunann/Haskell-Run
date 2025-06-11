import * as vscode from 'vscode';
import * as path from 'path';

interface HaskellDiagnostic {
    file: string;
    line: number;
    column: number;
    message: string;
    severity: vscode.DiagnosticSeverity;
}

export class DiagnosticsManager {
    private static instance: DiagnosticsManager;
    private diagnosticCollection: vscode.DiagnosticCollection;

    private constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('haskell-run');
    }

    public static getInstance(): DiagnosticsManager {
        if (!DiagnosticsManager.instance) {
            DiagnosticsManager.instance = new DiagnosticsManager();
        }
        return DiagnosticsManager.instance;
    }

    public parseOutput(output: string, workspacePath: string): HaskellDiagnostic[] {
        const diagnostics: HaskellDiagnostic[] = [];
        const lines = output.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Match common GHC error patterns
            const errorMatch = line.match(/^(.+):(\d+):(\d+):\s*(error|warning):(.*)/);
            if (errorMatch) {
                const [_, file, lineStr, colStr, severity, message] = errorMatch;
                diagnostics.push({
                    file: path.isAbsolute(file) ? file : path.join(workspacePath, file),
                    line: parseInt(lineStr) - 1,
                    column: parseInt(colStr) - 1,
                    message: message.trim(),
                    severity: severity === 'error' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
                });
            }
        }

        return diagnostics;
    }

    public updateDiagnostics(diagnostics: HaskellDiagnostic[]): void {
        // Clear previous diagnostics
        this.diagnosticCollection.clear();

        // Group diagnostics by file
        const diagnosticMap = new Map<string, vscode.Diagnostic[]>();

        for (const diag of diagnostics) {
            const fileUri = vscode.Uri.file(diag.file);
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(diag.line, diag.column, diag.line, diag.column + 1),
                diag.message,
                diag.severity
            );

            const fileDiagnostics = diagnosticMap.get(fileUri.toString()) || [];
            fileDiagnostics.push(diagnostic);
            diagnosticMap.set(fileUri.toString(), fileDiagnostics);
        }

        // Set diagnostics for each file
        for (const [uriString, fileDiagnostics] of diagnosticMap.entries()) {
            const uri = vscode.Uri.parse(uriString);
            this.diagnosticCollection.set(uri, fileDiagnostics);
        }
    }

    public clearDiagnostics(): void {
        this.diagnosticCollection.clear();
    }
}
