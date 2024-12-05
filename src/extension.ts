import * as vscode from 'vscode';
import { welcome } from './disposable';
import { PlaneSoTreeDataProvider } from './planeSoTreeDataProvider';
import { setApiKey, fetchProjects, fetchIssues } from './api';

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

    // Memeriksa jika API Key sudah ada di pengaturan
    const apiKey = vscode.workspace.getConfiguration('plane-so').get<string>('apiKey');

    if (!apiKey) {
        // Jika API Key belum ada, tampilkan prompt untuk meminta API Key
        vscode.window.showInputBox({
            placeHolder: 'Enter your Plane.so API key',
            password: true // Menyembunyikan input
        }).then(apiKeyInput => {
            if (apiKeyInput) {
                // Simpan API Key ke pengaturan
                setApiKey(apiKeyInput);

                // Setelah API Key diset, pastikan API Key sudah tersimpan sebelum melakukan fetch
                setTimeout(() => {
                    fetchProjects().then(projects => {
                        treeDataProvider.refresh(); // Segera refresh TreeDataProvider setelah data tersedia
                    }).catch(error => {
                        vscode.window.showErrorMessage('Failed to fetch projects: ' + error.message);
                    });
                }, 500); // Menunggu beberapa waktu untuk memastikan API Key sudah disimpan
            } else {
                vscode.window.showErrorMessage('API Key is required to use the extension.');
            }
        });
    } else {
        // Jika API Key sudah ada, langsung fetch data proyek
        fetchProjects().then(projects => {
            treeDataProvider.refresh(); // Refresh data setelah fetch
        }).catch(error => {
            vscode.window.showErrorMessage('Failed to fetch projects: ' + error.message);
        });
    }

    context.subscriptions.push(view);
}

export function deactivate() {}
