import * as assert from 'assert';
import * as vscode from 'vscode';
import { EnvironmentManager } from '../utils/environment';
import * as path from 'path';

suite('EnvironmentManager Test Suite', () => {
    vscode.window.showInformationMessage('Start EnvironmentManager tests.');

    test('Singleton instance should be consistent', () => {
        const instance1 = EnvironmentManager.getInstance();
        const instance2 = EnvironmentManager.getInstance();
        assert.strictEqual(instance1, instance2, 'EnvironmentManager should be a singleton');
    });

    test('Should check required tools', async () => {
        const manager = EnvironmentManager.getInstance();
        // We can't guarantee what tools are installed on the CI/User machine,
        // but we can ensure the method returns an array (empty or not).
        const missingTools = await manager.checkRequiredTools();
        assert.ok(Array.isArray(missingTools), 'checkRequiredTools should return an array');
    });

    test('Validate environment for workspace', async () => {
        const manager = EnvironmentManager.getInstance();
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath;
            // validating environment should not throw
            try {
                const isValid = await manager.validateEnvironment(workspacePath, true); // Force check
                console.log(`Environment valid: ${isValid}`);
                assert.ok(typeof isValid === 'boolean', 'validateEnvironment should return a boolean');
            } catch (error) {
                assert.fail(`validateEnvironment threw an error: ${error}`);
            }
        } else {
            // If no workspace is open, we can't test validation fully, but we can skip validly
            console.log('No workspace open, skipping validation test');
        }
    });
});
