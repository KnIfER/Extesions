const vscode = require('vscode');

var doc;

function debug(...e){console.log(e)};
function ge(e){return doc.getElementById(e)};
function gc(e){return doc.getElementsByClassName(e)};

debug("run plugin...");
debug("vscode.window::", vscode.window);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	doc = vscode.window.document

	debug("vscode.window::", vscode.window);
	// debug(document);
	// debug(gc('monaco-split-view2 horizontal')[0])


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('qeqeweq, your extension "helloworld-minimal-sample" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {

		//vscode.window.showInformationMessage('Hello World!');
		vscode.commands.executeCommand('workbench.action.navigateBack');

		
	});

	context.subscriptions.push(disposable);

}

// this method is called when your extension is deactivated
function deactivate() {}

// eslint-disable-next-line no-undef
module.exports = {
	activate,
	deactivate
}
