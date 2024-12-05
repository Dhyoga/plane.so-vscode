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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProjects = fetchProjects;
exports.fetchStates = fetchStates;
exports.fetchIssues = fetchIssues;
exports.setApiKey = setApiKey;
// api.ts
const axios_1 = __importDefault(require("axios"));
const vscode = __importStar(require("vscode"));
const dotenv = __importStar(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Memuat variabel lingkungan dari file .env
dotenv.config();
const API_URL = process.env.API_URL || 'https://api.plane.so/api/v1/workspaces/vml-indonesia/projects/';
// Ambil API key dari pengaturan ekstensi
const API_KEY = vscode.workspace.getConfiguration('plane-so').get('apiKey') || '';
if (!API_KEY) {
    // Jika belum ada, tampilkan prompt untuk input API key
    vscode.window.showInputBox({
        placeHolder: 'Enter your Plane.so API key',
        password: true // Menyembunyikan input jika diinginkan
    }).then(apiKey => {
        if (apiKey) {
            // Simpan API key ke pengaturan
            setApiKey(apiKey);
        }
        else {
            vscode.window.showErrorMessage('API Key is required to use the extension.');
        }
    });
}
async function fetchProjects() {
    try {
        const response = await axios_1.default.get(API_URL, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        return response.data.results;
    }
    catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects from API');
    }
}
async function fetchStates(projectParam) {
    try {
        const projects = projectParam;
        const allStates = [];
        for (const project of projects) {
            const projectId = project.id;
            const projectName = project.name;
            const projectStatesUrl = `${API_URL}${projectId}/states`;
            const response = await axios_1.default.get(projectStatesUrl, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            const states = response.data.results.map((state) => ({
                stateId: state.id,
                name: state.name,
                slug: state.slug,
            }));
            allStates.push({
                projectId: projectId,
                projectName: projectName,
                states: states
            });
        }
        console.log(allStates);
        return allStates;
    }
    catch (error) {
        console.error('Error fetching states:', error);
        throw new Error('Failed to fetch states from API');
    }
}
const loadAssignees = () => {
    const filePath = path_1.default.join(__dirname, 'assignees.json');
    const data = fs_1.default.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};
async function fetchIssues() {
    try {
        const projects = await fetchProjects();
        const states = await fetchStates(projects); // states sudah berisi data proyek dan states mereka
        const allIssues = [];
        // const assignee = [
        //     { "id": "aaff94c3-42d5-40d4-a04f-8c52719c5f25", "name": "Ben" },
        //     { "id": "32539cc1-0c4f-4473-9c63-1160334c2ea7", "name": "Sandi" },
        //     { "id": "13225328-7e9c-4fae-8663-d2052badb6d7", "name": "Yoga" },
        //     { "id": "fd6ee278-5a0e-4f03-a677-10c92162317e", "name": "Pugud" },
        //     { "id": "f12772a4-9800-48f5-a8d7-6a6976668f15", "name": "Gani" },
        //     { "id": "bf12d906-21f1-4470-812e-7aadf31129a0", "name": "Banu" },
        //     { "id": "b0745df2-6fe3-4787-987a-a0b9ca2a8fcb", "name": "Hilmy" },
        //     { "id": "16a99440-cf8a-43b2-baf3-1179d459d4b3", "name": "Rio" },
        //     { "id": "c229bb0b-c968-4adc-a4c6-d6d4887ca244", "name": "Arief" },
        //     { "id": "9a5af0f2-97b7-4ea8-8d61-de5c1ca1436b", "name": "Eggy" },
        //     { "id": "f2035e4e-e70f-412a-8bbf-92b54e8239c3", "name": "Rizky" },
        //     { "id": "d49b729b-627c-4a17-be1f-fbf5acc3392e", "name": "Yusa" }
        // ];
        // const assignee = loadAssignees();
        const assignee = loadAssignees();
        for (const project of projects) {
            const projectId = project.id;
            const projectName = project.name;
            const projectIssuesUrl = `${API_URL}${projectId}/issues`;
            const response = await axios_1.default.get(projectIssuesUrl, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });
            const issues = response.data.results.map((issue) => {
                const projectStates = states.find((stateObj) => stateObj.projectId === projectId);
                const matchingState = projectStates?.states.find((state) => state.stateId === issue.state);
                if (matchingState) {
                    issue.stateName = matchingState.name;
                }
                if (issue.stateName === "Done (PM)" || issue.stateName === "Cancelled (PM)") {
                    return null;
                }
                const assigneesNames = [...new Set(issue.assignees.map((assigneeId) => {
                        const assigneeObj = assignee.find(a => a.id === assigneeId);
                        return assigneeObj ? assigneeObj.name : 'Unknown'; // If no assignee found, return 'Unknown'
                    }))];
                return {
                    issueId: issue.id,
                    name: issue.name,
                    stateId: issue.state,
                    stateName: issue.stateName,
                    assignees: assigneesNames
                };
            }).filter((issue) => issue !== null);
            allIssues.push({
                projectId: projectId,
                projectName: projectName,
                issues: issues,
            });
        }
        console.log(allIssues);
        return allIssues;
    }
    catch (error) {
        console.error('Error fetching issues:', error);
        throw new Error('Failed to fetch issues from API');
    }
}
function setApiKey(apiKey) {
    // Menyimpan API key ke pengaturan
    vscode.workspace.getConfiguration('plane-so').update('apiKey', apiKey, vscode.ConfigurationTarget.Global)
        .then(() => {
        vscode.window.showInformationMessage('API Key has been set successfully.');
    }, (err) => {
        vscode.window.showErrorMessage('Failed to save API Key: ' + err.message);
    });
}
//# sourceMappingURL=api.js.map