import * as vscode from 'vscode';

export class TelemetryManager {
    private static instance: TelemetryManager;
    private enabled: boolean;

    private constructor() {
        const config = vscode.workspace.getConfiguration('haskellRun');
        this.enabled = config.get('enableTelemetry', false);
    }

    public static getInstance(): TelemetryManager {
        if (!TelemetryManager.instance) {
            TelemetryManager.instance = new TelemetryManager();
        }
        return TelemetryManager.instance;
    }

    public async trackEvent(eventName: string, properties?: { [key: string]: string }): Promise<void> {
        if (!this.enabled) {
            return;
        }

        try {
            // Here we would integrate with a telemetry service like Azure App Insights
            // For now, just log to console in development
            console.log(`[Telemetry] ${eventName}`, properties);
        } catch (error) {
            console.error('Failed to track telemetry:', error);
        }
    }

    public async trackError(error: Error, properties?: { [key: string]: string }): Promise<void> {
        if (!this.enabled) {
            return;
        }

        try {
            console.error(`[Telemetry] Error: ${error.message}`, {
                ...properties,
                stack: error.stack,
            });
        } catch (err) {
            console.error('Failed to track error:', err);
        }
    }
}
