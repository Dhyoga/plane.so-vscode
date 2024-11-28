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
// extension.ts
const vscode = __importStar(require("vscode"));
const disposable_1 = require("./disposable");
const planeSoTreeDataProvider_1 = require("./planeSoTreeDataProvider");
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
    context.subscriptions.push(view);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map