'use strict';

import * as path from 'path';

import { workspace, Disposable, ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, SettingMonitor, ServerOptions, TransportKind } from 'vscode-languageclient';
import os = require('os');

let ideConfig = workspace.getConfiguration("crystal-ide");

export function activate(context: ExtensionContext) {

	let serverOptions : ServerOptions;

	if (ideConfig["backend"] == "scry") {
		let arch : string = os.arch();
		let platform : string = os.platform();

		let command : string = context.asAbsolutePath(path.join("server", platform, arch, "scry"));
		serverOptions = { command: command, args: [] };
	}
	else if (ideConfig["backend"] == "custom") {
		let command : string = ideConfig["customCommand"];
		let args : [string] = ideConfig["customCommandArgs"] || [];

		serverOptions = { command: command, args: args}

	} else {

		// The server is implemented in node
		let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
		// The debug options for the server
		let debugOptions = { execArgv: ["--nolazy", "--debug=6004"] };

		// If the extension is launched in debug mode then the debug server options are used
		// Otherwise the run options are used
		serverOptions = {
			run : { module: serverModule, transport: TransportKind.ipc },
			debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
		}

	}

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for Crystal source files
		documentSelector: ['crystal'],
		synchronize: {
			// Synchronize the setting section to the server
			configurationSection: 'crystal-ide',
			// Notify the server about file changes to crystal files
			fileEvents: workspace.createFileSystemWatcher('**/*.cr')
		}
	}

	// Create the language client and start the client.
	let disposable = new LanguageClient('Crystal Language', serverOptions, clientOptions).start();

	// Push the disposable to the context's subscriptions so that the
	// client can be deactivated on extension deactivation
	context.subscriptions.push(disposable);
}
