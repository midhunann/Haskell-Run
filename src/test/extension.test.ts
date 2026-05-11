import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { formatGhciLoadPath, parseGhciCommandResult } from '../utils/repl';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('GHCi load paths use portable separators and quote spaces only', () => {
		assert.strictEqual(formatGhciLoadPath('C:\\Users\\Ada\\Main.hs'), 'C:/Users/Ada/Main.hs');
		assert.strictEqual(formatGhciLoadPath('C:\\Users\\Ada Lovelace\\Main.hs'), '"C:/Users/Ada Lovelace/Main.hs"');
	});

	test('GHCi output parser recognizes successful module loads', () => {
		const result = parseGhciCommandResult('[1 of 1] Compiling Main\nOk, one module loaded.');

		assert.strictEqual(result.hasError, false);
		assert.strictEqual(result.loadedModules, 1);
	});

	test('GHCi output parser recognizes compile errors', () => {
		const result = parseGhciCommandResult('Main.hs:4:1: error:\n    parse error on input `=`\nFailed, no modules loaded.');

		assert.strictEqual(result.hasError, true);
		assert.strictEqual(result.loadedModules, null);
	});
});
