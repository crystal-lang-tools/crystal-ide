'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites.
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind
			// Tell the client that the server support code complete
			// completionProvider: {
			// 	resolveProvider: true
			// }
		}
	}
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
	validateFile(change.document);
});

// The settings interface describe the server relevant settings part
interface Settings {
	languageCrystalServer: ExampleSettings;
}

// These are the example settings we defined in the client's package.json
// file
interface ExampleSettings {
	maxNumberOfProblems: number;
}

interface FileChanged {
	uri: string;
}

// hold the maxNumberOfProblems setting
let maxNumberOfProblems: number;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	maxNumberOfProblems = settings["crystal-ide"].maxNumberOfProblems || 100;
	// Revalidate any open text documents
	documents.all().forEach(validateFile);
});

function fileUriToPath(uri: string) : string {
	return uri.replace("file://", "");
}

function validateFile(file: FileChanged): void {
	let exec = require('child_process').exec;
	let diagnostics: Diagnostic[] = [];
	exec("crystal build --no-color --no-codegen -f json --release " + fileUriToPath(file.uri), (err, response) => {
		if (response) {
			let results = JSON.parse(response);
			let length = Math.min(maxNumberOfProblems, results.length);
			for (var problems = 0; problems < length; problems++) {
				let problem = results[problems];
				diagnostics.push({
					severity: DiagnosticSeverity.Error,
					range: {
						start: { line: problem.line - 1, character: problem.column - 1 },
						end: { line: problem.line - 1, character: (problem.column + (problem.size || 0) - 1) }
					},
					message: problem.message,
					source: 'Crystal Language'
				});
			}
		}
		// Send the computed diagnostics to VSCode.
		connection.sendDiagnostics({ uri: file.uri, diagnostics });
	})
}

connection.onDidChangeWatchedFiles((change) => {
	// Monitored files have change in VSCode
	change.changes.forEach(validateFile);
});


/*
TODO: Come back and do completions

// This handler provides the initial list of the completion items.
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	// The pass parameter contains the position of the text document in
	// which code complete got requested. For the example we ignore this
	// info and always provide the same completion items.
	return [
		{
			label: 'TypeScript',
			kind: CompletionItemKind.Text,
			data: 1
		},
		{
			label: 'JavaScript',
			kind: CompletionItemKind.Text,
			data: 2
		}
	]
});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (item.data === 1) {
		item.detail = 'TypeScript details',
		item.documentation = 'TypeScript documentation'
	} else if (item.data === 2) {
		item.detail = 'JavaScript details',
		item.documentation = 'JavaScript documentation'
	}
	return item;
});

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.uri} closed.`);
});
*/

// Listen on the connection
connection.listen();
