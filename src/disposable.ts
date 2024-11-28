// disposable.ts
import * as vscode from 'vscode';

export function welcome(context: vscode.ExtensionContext) {
    // Menyusun command untuk "Hello World"
    const disposable = vscode.commands.registerCommand('plane-so.helloWorld', () => {
        vscode.window.showInformationMessage('Hello VS Code!');
    });

    context.subscriptions.push(disposable);
}
