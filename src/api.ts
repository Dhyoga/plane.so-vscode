// api.ts
import axios from 'axios';
import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

interface Assignee {
    id: string;
    name: string;
}

const loadAssignees = () => {
    const filePath = path.join(__dirname, 'assignees.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

export async function fetchIssues() {
    try {
        const projects = await fetchProjects();
        const states = await fetchStates(projects);  // states sudah berisi data proyek dan states mereka
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
        const assignee: Assignee[] = loadAssignees();

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
                const projectStates = states.find((stateObj: any) => stateObj.projectId === projectId);
                const matchingState = projectStates?.states.find((state: any) => state.stateId === issue.state);
                
                if (matchingState) {
                    issue.stateName = matchingState.name;
                }

                if (issue.stateName === "Done (PM)" || issue.stateName === "Cancelled (PM)") {
                    return null;
                }

                const assigneesNames = issue.assignees.map((assigneeId: string) => {
                    const assigneeObj = assignee.find(a => a.id === assigneeId);
                    return assigneeObj ? assigneeObj.name : 'Unknown'; // If no assignee found, return 'Unknown'
                });

                return {
                    issueId: issue.id,
                    name: issue.name,
                    stateId: issue.state,
                    stateName: issue.stateName,
                    assignees: assigneesNames
                };
            }).filter((issue: any) => issue !== null);       

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
