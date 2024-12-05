"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const disposable_1 = require("./disposable");
const planeSoTreeDataProvider_1 = require("./planeSoTreeDataProvider");
const api_1 = require("./api");
function activate(context) {
    console.log('Your extension "Plane.so" is now active!');
    // Menambahkan TreeDataProvider untuk "Plane.so View"
    const treeDataProvider = new planeSoTreeDataProvider_1.PlaneSoTreeDataProvider();
    const view = vscode.window.createTreeView('plane-so-view', {
        treeDataProvider
    });
    // Menambahkan command untuk "Hello World"
    (0, disposable_1.welcome)(context);
    // Menambahkan command untuk membuka URL saat item TreeView diklik
    vscode.commands.registerCommand('plane-so.openIssue', disposable_1.welcome);
    // Pemantauan perubahan konfigurasi
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('plane-so.apiKey')) {
            console.log('API Key changed, re-fetching issues...');
            treeDataProvider.refresh(); // Refresh TreeDataProvider untuk menampilkan data baru
        }
    });
    // Memeriksa jika API Key sudah ada di pengaturan
    const apiKey = vscode.workspace.getConfiguration('plane-so').get('apiKey');
    if (!apiKey) {
        // Jika API Key belum ada, tampilkan prompt untuk meminta API Key
        vscode.window.showInputBox({
            placeHolder: 'Enter your Plane.so API key',
            password: true // Menyembunyikan input
        }).then(apiKeyInput => {
            if (apiKeyInput) {
                // Simpan API Key ke pengaturan
                (0, api_1.setApiKey)(apiKeyInput);
                // Setelah API Key diset, pastikan API Key sudah tersimpan sebelum melakukan fetch
                setTimeout(() => {
                    (0, api_1.fetchProjects)().then(projects => {
                        treeDataProvider.refresh(); // Segera refresh TreeDataProvider setelah data tersedia
                    }).catch(error => {
                        vscode.window.showErrorMessage('Failed to fetch projects: ' + error.message);
                    });
                }, 500); // Menunggu beberapa waktu untuk memastikan API Key sudah disimpan
            }
            else {
                vscode.window.showErrorMessage('API Key is required to use the extension.');
            }
        });
    }
    else {
        // Jika API Key sudah ada, langsung fetch data proyek
        (0, api_1.fetchProjects)().then(projects => {
            treeDataProvider.refresh(); // Refresh data setelah fetch
        }).catch(error => {
            vscode.window.showErrorMessage('Failed to fetch projects: ' + error.message);
        });
    }
    context.subscriptions.push(view);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map