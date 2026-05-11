import * as vscode from 'vscode';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';

interface QueuedCommand {
    command: string;
    timeoutMs: number;
    resolve: (output: string) => void;
    reject: (error: Error) => void;
}

interface ActiveCommand extends QueuedCommand {
    sentinel: string;
    output: string;
    timeout: ReturnType<typeof setTimeout>;
}

export interface GhciCommandResult {
    hasError: boolean;
    loadedModules: number | null;
}

const DEFAULT_COMMAND_TIMEOUT_MS = 15000;

export function formatGhciLoadPath(filePath: string): string {
    const normalized = filePath.replace(/\\/g, '/');
    const escaped = normalized.replace(/"/g, '\\"');

    return /[\s()'"]/.test(escaped) ? `"${escaped}"` : escaped;
}

export function parseGhciCommandResult(output: string): GhciCommandResult {
    const normalized = output.replace(/\r\n/g, '\n');
    const loadedModulesMatch = /\bOk,\s+([a-z]+|\d+)\s+modules?\s+loaded\./i.exec(normalized);
    const loadedModules = loadedModulesMatch ? parseLoadedModuleCount(loadedModulesMatch[1]) : null;
    const errorPatterns = [
        /(?:^|\n)[^\n:]+:\d+:\d+:\s+error:/i,
        /(?:^|\n)<interactive>:\d+:\d+:\s+error:/i,
        /(?:^|\n)\s*Failed,\s+(?:no|one or more|\d+)\s+modules?\s+loaded\./i,
        /(?:^|\n)\s*\*\*\*\s+Exception:/i,
        /\bVariable not in scope\b/i,
        /\bNot in scope\b/i,
        /\bCould not find module\b/i,
        /\bparse error\b/i,
        /\bNo instance for\b/i,
        /\bAmbiguous occurrence\b/i,
        /\bunknown command\b/i,
        /\bcannot find object file\b/i,
    ];

    return {
        hasError: errorPatterns.some(pattern => pattern.test(normalized)),
        loadedModules
    };
}

function parseLoadedModuleCount(value: string): number | null {
    if (/^\d+$/.test(value)) {
        return Number(value);
    }

    const wordCounts: Record<string, number> = {
        no: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10
    };

    return wordCounts[value.toLowerCase()] ?? null;
}

function sanitizeGhciOutput(output: string, command: string, sentinel: string): string {
    return output
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter(line => {
            const trimmed = line.trim();
            return trimmed !== command.trim()
                && !trimmed.includes(sentinel)
                && !trimmed.includes(`:! echo ${sentinel}`);
        })
        .join('\n')
        .trim();
}

class GhciSession implements vscode.Pseudoterminal {
    private writeEmitter = new vscode.EventEmitter<string>();
    private closeEmitter = new vscode.EventEmitter<void>();
    public readonly onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    public readonly onDidClose: vscode.Event<void> = this.closeEmitter.event;

    private ghci?: ChildProcessWithoutNullStreams;
    private commandQueue: QueuedCommand[] = [];
    private activeCommand?: ActiveCommand;
    private commandSequence = 0;
    private closed = false;
    private closeNotified = false;
    private readyResolve!: () => void;
    private readyReject!: (error: Error) => void;
    private ready: Promise<void>;

    constructor(
        private readonly workspacePath: string,
        private readonly onExit: () => void
    ) {
        this.ready = new Promise<void>((resolve, reject) => {
            this.readyResolve = resolve;
            this.readyReject = reject;
        });
    }

    public open(): void {
        if (this.ghci || this.closed) {
            return;
        }

        try {
            this.ghci = spawn('ghci', [], {
                cwd: this.workspacePath,
                windowsHide: true
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.readyReject(new Error(`Failed to start GHCi: ${message}`));
            this.write(`Failed to start GHCi: ${message}\r\n`);
            this.notifyClosed();
            return;
        }

        this.ghci.stdout.on('data', data => this.handleGhciOutput(String(data)));
        this.ghci.stderr.on('data', data => this.handleGhciOutput(String(data)));
        this.ghci.on('error', error => {
            this.readyReject(error);
            this.rejectActiveAndQueued(error);
            this.write(`GHCi error: ${error.message}\r\n`);
        });
        this.ghci.on('exit', (code, signal) => {
            const reason = signal ? `signal ${signal}` : `code ${code ?? 'unknown'}`;
            const error = new Error(`GHCi exited with ${reason}`);
            this.rejectActiveAndQueued(error);
            this.write(`\r\nGHCi exited with ${reason}\r\n`);
            this.notifyClosed();
        });

        this.readyResolve();
    }

    public close(): void {
        this.closed = true;
        this.rejectActiveAndQueued(new Error('GHCi session closed'));

        if (this.ghci && !this.ghci.killed) {
            this.ghci.kill();
        }

        this.notifyClosed();
        this.writeEmitter.dispose();
        this.closeEmitter.dispose();
    }

    public handleInput(data: string): void {
        this.ghci?.stdin.write(data.replace(/\r/g, '\n'));
    }

    public async runCommand(command: string, timeoutMs = DEFAULT_COMMAND_TIMEOUT_MS): Promise<string> {
        await this.ready;

        if (!this.ghci || this.closed) {
            throw new Error('GHCi session is not available');
        }

        return new Promise<string>((resolve, reject) => {
            this.commandQueue.push({ command, timeoutMs, resolve, reject });
            this.pumpCommandQueue();
        });
    }

    public clearDisplay(): void {
        this.write('\x1b[2J\x1b[3J\x1b[H');
    }

    private pumpCommandQueue(): void {
        if (this.activeCommand || this.closed || !this.ghci) {
            return;
        }

        const next = this.commandQueue.shift();
        if (!next) {
            return;
        }

        const sentinel = `__HASKELL_RUN_DONE_${Date.now()}_${++this.commandSequence}__`;
        const timeout = setTimeout(() => {
            if (this.activeCommand?.sentinel === sentinel) {
                const timedOut = this.activeCommand;
                this.activeCommand = undefined;
                timedOut.reject(new Error(`GHCi command timed out: ${timedOut.command}`));
                this.pumpCommandQueue();
            }
        }, next.timeoutMs);

        this.activeCommand = {
            ...next,
            sentinel,
            output: '',
            timeout
        };

        this.ghci.stdin.write(`${next.command}\n:! echo ${sentinel}\n`);
    }

    private handleGhciOutput(text: string): void {
        this.write(text.replace(/\n/g, '\r\n'));

        if (!this.activeCommand) {
            return;
        }

        this.activeCommand.output += text;
        const sentinelIndex = this.activeCommand.output.indexOf(this.activeCommand.sentinel);

        if (sentinelIndex === -1) {
            return;
        }

        const command = this.activeCommand;
        clearTimeout(command.timeout);
        this.activeCommand = undefined;

        const rawOutput = command.output.slice(0, sentinelIndex);
        const cleanedOutput = sanitizeGhciOutput(rawOutput, command.command, command.sentinel);
        command.resolve(cleanedOutput);
        this.pumpCommandQueue();
    }

    private rejectActiveAndQueued(error: Error): void {
        if (this.activeCommand) {
            clearTimeout(this.activeCommand.timeout);
            this.activeCommand.reject(error);
            this.activeCommand = undefined;
        }

        for (const command of this.commandQueue.splice(0)) {
            command.reject(error);
        }
    }

    private write(text: string): void {
        if (!this.closeNotified) {
            this.writeEmitter.fire(text);
        }
    }

    private notifyClosed(): void {
        if (this.closeNotified) {
            return;
        }

        this.closeNotified = true;
        this.closeEmitter.fire();
        this.onExit();
    }
}

export class ReplManager {
    private static instance: ReplManager;
    private terminals: Map<string, vscode.Terminal> = new Map();
    private sessions: Map<string, GhciSession> = new Map();
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

        const session = new GhciSession(workspacePath, () => this.forgetWorkspace(workspacePath));
        const terminal = vscode.window.createTerminal({
            name: 'Haskell REPL',
            pty: session
        });

        this.sessions.set(workspacePath, session);
        this.terminals.set(workspacePath, terminal);
        this.modules.set(workspacePath, new Set());

        terminal.show();

        return terminal;
    }

    public async loadModule(workspacePath: string, modulePath: string): Promise<void> {
        await this.getOrCreateRepl(workspacePath);
        const session = this.getSession(workspacePath);
        const output = await session.runCommand(`:load ${formatGhciLoadPath(modulePath)}`);
        const result = parseGhciCommandResult(output);

        if (result.hasError || !result.loadedModules || result.loadedModules < 1) {
            throw new Error(`GHCi failed to load module:\n${output || 'No output from GHCi'}`);
        }

        this.modules.get(workspacePath)!.add(modulePath);
    }

    public async evaluateInRepl(workspacePath: string, code: string): Promise<void> {
        await this.getOrCreateRepl(workspacePath);
        const session = this.getSession(workspacePath);
        const output = await session.runCommand(code);
        const result = parseGhciCommandResult(output);

        if (result.hasError) {
            throw new Error(`GHCi evaluation failed:\n${output || 'No output from GHCi'}`);
        }
    }

    public async restartRepl(workspacePath: string): Promise<void> {
        const terminal = this.terminals.get(workspacePath);

        if (terminal) {
            terminal.dispose();
        }

        this.forgetWorkspace(workspacePath);
        await this.getOrCreateRepl(workspacePath);
    }

    public async clearRepl(workspacePath: string): Promise<void> {
        const session = this.sessions.get(workspacePath);

        if (session) {
            session.clearDisplay();
            await session.runCommand(':reload');
        }
    }

    public disposeAll(): void {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
        this.sessions.clear();
        this.modules.clear();
    }

    private getSession(workspacePath: string): GhciSession {
        const session = this.sessions.get(workspacePath);

        if (!session) {
            throw new Error('GHCi session was not initialized');
        }

        return session;
    }

    private forgetWorkspace(workspacePath: string): void {
        this.terminals.delete(workspacePath);
        this.sessions.delete(workspacePath);
        this.modules.delete(workspacePath);
    }
}
