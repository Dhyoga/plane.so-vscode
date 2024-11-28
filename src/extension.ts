// extension.ts
import * as vscode from 'vscode';
import { welcome } from './disposable';
import { PlaneSoTreeDataProvider } from './planeSoTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "Plane.so" is now active!');

    // Menambahkan TreeDataProvider untuk "Plane.so View"
    const treeDataProvider = new PlaneSoTreeDataProvider();
    const view = vscode.window.createTreeView('plane-so-view', {
        treeDataProvider
    });

    // Menambahkan command untuk "Hello World"
    welcome(context);

    // Menambahkan command untuk membuka URL saat item TreeView diklik
    vscode.commands.registerCommand('plane-so.openIssue', welcome);

    // Pemantauan perubahan konfigurasi
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('plane-so.apiKey')) {
            console.log('API Key changed, re-fetching issues...');
            treeDataProvider.refresh(); // Refresh TreeDataProvider untuk menampilkan data baru
        }
    });

    context.subscriptions.push(view);
}

export function deactivate() {}

