// planeSoTreeDataProvider.ts
import * as vscode from 'vscode';
import { fetchIssues } from './api'; // Mengimpor fungsi fetchIssues dari api.ts

export class PlaneSoTreeDataProvider implements vscode.TreeDataProvider<PlaneSoItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PlaneSoItem | undefined> = new vscode.EventEmitter<PlaneSoItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<PlaneSoItem | undefined> = this._onDidChangeTreeData.event;

    // Fungsi untuk memberi tahu bahwa data telah berubah dan perlu di-refresh
    refresh(): void {
        // Trigger a refresh of the entire tree
        this._onDidChangeTreeData.fire(undefined); // Pass undefined to indicate a full refresh
    }

    // Mendapatkan item dalam TreeView
    getTreeItem(element: PlaneSoItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PlaneSoItem): Promise<PlaneSoItem[]> {
        if (element) {
            // Jika element adalah proyek, kembalikan issues yang terkait
            return element.getChildren(); // Kembalikan anak-anak yang sudah di-set
        } else {
            try {
                // Ambil data dari API
                const projects = await fetchIssues();
    
                let items: PlaneSoItem[] = [];
    
                // Map data proyek dan issue yang diterima dari API ke dalam TreeView
                projects.forEach((project: any) => {
                    // Buat item untuk proyek
                    const projectItem = new PlaneSoItem(
                        project.projectName,
                        vscode.TreeItemCollapsibleState.Collapsed, // Membuat proyek bisa di-expand
                        project.projectId
                    );
    
                    // Tambahkan item untuk setiap issue dalam proyek
                    // Mengatur anak-anak untuk proyek
                    projectItem.setChildren(project.issues.map((issue: any) => {
                        return new PlaneSoItem(
                            issue.name || 'No title',  // Nama issue
                            vscode.TreeItemCollapsibleState.None,  // Item ini tidak dapat di-expand
                            issue.issueId,
                            issue.stateName  // Sertakan nama state
                        );
                    }));
    
                    items.push(projectItem);
                });
    
                return items;
            } catch (error: any) {
                vscode.window.showErrorMessage('Failed to load issues: ' + error.message);
                return [];
            }
        }
    }    

    private getIssuesForProject(projectId: string): PlaneSoItem[] {
        // Fetch the issues for the specific project
        return []; // This should return issues for the selected project
    }
}

export class PlaneSoItem extends vscode.TreeItem {
    id: string; // Menyimpan id yang didapat dari API
    stateName?: string; // Menyimpan nama state
    private _children: PlaneSoItem[] = [];

    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState, id: string, stateName?: string) {
        super(`${label} - ${stateName || 'No state'}`, collapsibleState); // Tampilkan nama issue dan state
        this.id = id;
        this.stateName = stateName;
        this.command = {
            command: 'plane-so.openIssue',  // Nama command
            title: 'Open Issue in Browser',  // Judul command
            arguments: [this]  // Memberikan argumen (item ini) ke command
        };
    }

    setChildren(children: PlaneSoItem[]): void {
        this._children = children;
    }

    getChildren(): PlaneSoItem[] {
        return this._children;
    }
}
