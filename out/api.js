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
async function fetchIssues() {
    try {
        const projects = await fetchProjects();
        const states = await fetchStates(projects); // states sudah berisi data proyek dan states mereka
        const allIssues = [];
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
                // Cari state yang sesuai dengan issue
                const projectStates = states.find((stateObj) => stateObj.projectId === projectId);
                const matchingState = projectStates?.states.find((state) => state.stateId === issue.state);
                // Jika ditemukan state yang sesuai, tambahkan stateName ke issue
                if (matchingState) {
                    issue.stateName = matchingState.name;
                }
                return {
                    issueId: issue.id,
                    name: issue.name,
                    stateId: issue.state, // menggunakan stateId yang sama
                    stateName: issue.stateName, // stateName yang sudah ditambahkan
                };
            });
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