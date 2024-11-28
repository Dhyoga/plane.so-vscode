// api.ts
import axios from 'axios';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

// Memuat variabel lingkungan dari file .env
dotenv.config();

const API_URL = process.env.API_URL || 'https://api.plane.so/api/v1/workspaces/vml-indonesia/projects/'

// Ambil API key dari pengaturan ekstensi
const API_KEY = vscode.workspace.getConfiguration('plane-so').get<string>('apiKey') || '';

if (!API_KEY) {
    // Jika belum ada, tampilkan prompt untuk input API key
    vscode.window.showInputBox({
        placeHolder: 'Enter your Plane.so API key',
        password: true // Menyembunyikan input jika diinginkan
    }).then(apiKey => {
        if (apiKey) {
            // Simpan API key ke pengaturan
            setApiKey(apiKey);
        } else {
            vscode.window.showErrorMessage('API Key is required to use the extension.');
        }
    });
}

export async function fetchProjects() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                'X-API-Key': API_KEY
            }
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects from API');
    }
}

export async function fetchStates(projectParam: any) {
    try {
        const projects = projectParam;

        const allStates = [];
        
        for (const project of projects) {
            const projectId = project.id;
            const projectName = project.name;
            const projectStatesUrl = `${API_URL}${projectId}/states`;

            const response = await axios.get(projectStatesUrl, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });

            const states = response.data.results.map((state: any) => ({
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
    } catch (error) {
        console.error('Error fetching states:', error);
        throw new Error('Failed to fetch states from API');
    }
}

export async function fetchIssues() {
    try {
        const projects = await fetchProjects();
        const states = await fetchStates(projects);  // states sudah berisi data proyek dan states mereka
        const allIssues = [];
        
        for (const project of projects) {
            const projectId = project.id;
            const projectName = project.name;
            const projectIssuesUrl = `${API_URL}${projectId}/issues`;

            const response = await axios.get(projectIssuesUrl, {
                headers: {
                    'X-API-Key': API_KEY
                }
            });

            const issues = response.data.results.map((issue: any) => {
                // Cari state yang sesuai dengan issue
                const projectStates = states.find((stateObj: any) => stateObj.projectId === projectId);
                const matchingState = projectStates?.states.find((state: any) => state.stateId === issue.state);
                
                // Jika ditemukan state yang sesuai, tambahkan stateName ke issue
                if (matchingState) {
                    issue.stateName = matchingState.name;
                }

                return {
                    issueId: issue.id,
                    name: issue.name,
                    stateId: issue.state,  // menggunakan stateId yang sama
                    stateName: issue.stateName,  // stateName yang sudah ditambahkan
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
    } catch (error) {
        console.error('Error fetching issues:', error);
        throw new Error('Failed to fetch issues from API');
    }
}

export function setApiKey(apiKey: string) {
    // Menyimpan API key ke pengaturan
    vscode.workspace.getConfiguration('plane-so').update('apiKey', apiKey, vscode.ConfigurationTarget.Global)
        .then(() => {
            vscode.window.showInformationMessage('API Key has been set successfully.');
        }, (err) => {
            vscode.window.showErrorMessage('Failed to save API Key: ' + err.message);
        });
}
