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
exports.PlaneSoItem = exports.PlaneSoTreeDataProvider = void 0;
// planeSoTreeDataProvider.ts
const vscode = __importStar(require("vscode"));
const api_1 = require("./api"); // Mengimpor fungsi fetchIssues dari api.ts
class PlaneSoTreeDataProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    // Fungsi untuk memberi tahu bahwa data telah berubah dan perlu di-refresh
    refresh() {
        // Trigger a refresh of the entire tree
        this._onDidChangeTreeData.fire(undefined); // Pass undefined to indicate a full refresh
    }
    // Mendapatkan item dalam TreeView
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (element) {
            // Jika element adalah proyek, kembalikan issues yang terkait
            return element.getChildren(); // Kembalikan anak-anak yang sudah di-set
        }
        else {
            try {
                // Ambil data dari API
                const projects = await (0, api_1.fetchIssues)();
                let items = [];
                // Map data proyek dan issue yang diterima dari API ke dalam TreeView
                projects.forEach((project) => {
                    // Buat item untuk proyek
                    const projectItem = new PlaneSoItem(project.projectName, vscode.TreeItemCollapsibleState.Collapsed, // Membuat proyek bisa di-expand
                    project.projectId);
                    // Tambahkan item untuk setiap issue dalam proyek
                    // Mengatur anak-anak untuk proyek
                    projectItem.setChildren(project.issues.map((issue) => {
                        return new PlaneSoItem(issue.name || 'No title', // Nama issue
                        vscode.TreeItemCollapsibleState.None, // Item ini tidak dapat di-expand
                        issue.issueId, issue.stateName, issue.assignees);
                    }));
                    items.push(projectItem);
                });
                return items;
            }
            catch (error) {
                vscode.window.showErrorMessage('Failed to load issues: ' + error.message);
                return [];
            }
        }
    }
    getIssuesForProject(projectId) {
        // Fetch the issues for the specific project
        return []; // This should return issues for the selected project
    }
}
exports.PlaneSoTreeDataProvider = PlaneSoTreeDataProvider;
class PlaneSoItem extends vscode.TreeItem {
    id; // Menyimpan id yang didapat dari API
    stateName; // Menyimpan nama state
    _children = [];
    constructor(label, collapsibleState, id, stateName, assignee) {
        const assigneeText = assignee && assignee.length > 0 ? `Assignee: ${assignee.join(', ')}` : 'No Assignee';
        super(`${label} - ${stateName || 'No state'} - ${assigneeText}`, collapsibleState); // Tampilkan nama issue dan state
        this.id = id;
        this.stateName = stateName;
        this.command = {
            command: 'plane-so.openIssue', // Nama command
            title: 'Open Issue in Browser', // Judul command
            arguments: [this] // Memberikan argumen (item ini) ke command
        };
    }
    setChildren(children) {
        this._children = children;
    }
    getChildren() {
        return this._children;
    }
}
exports.PlaneSoItem = PlaneSoItem;
//# sourceMappingURL=planeSoTreeDataProvider.js.map