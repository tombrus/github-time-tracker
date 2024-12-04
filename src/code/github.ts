import type {Ref} from 'vue';
import axios, {type AxiosResponse} from 'axios';
import {getToken, type GhttGist} from '@/code/state';
import type {Endpoints} from '@octokit/types';
import {monitorRatelimit} from '@/code/ratelimit';
import {trace} from '@/code/trace';

export type GetGistsResponse = Endpoints['GET /gists']['response'];
export type GetIssueResponse = Endpoints['GET /user/issues']['response'];
export type GetUserResponse = Endpoints['GET /user']['response'];
export type PostGistRequest = Endpoints['POST /gists']['request'];
export type PostGistsResponse = Endpoints['POST /gists']['response'];

export type GithubIssue = GetIssueResponse['data'][0];
export type GithubGist = GetGistsResponse['data'][0];
export type GithubUser = GetUserResponse['data'];
export type RequestGist = PostGistRequest['data'];

export async function githubGetUser(token: string): Promise<GithubUser> {
    const response: GetUserResponse = await axios.get('https://api.github.com/user', getAuthorizationConfig(token));
    monitorRatelimit(response);
    return response.data;
}

export async function githubCreateGist(newGist: RequestGist, token: string) {
    const response: PostGistsResponse = await axios.post('https://api.github.com/gists', newGist, getAuthorizationConfig(token));
    monitorRatelimit(response);
    return response.data.id;
}

export async function githubUpdateGist(gist: GhttGist, newGist: RequestGist, token: string) {
    try {
        const response = await axios.patch(`https://api.github.com/gists/${gist.id}`, newGist, getAuthorizationConfig(token));
        monitorRatelimit(response);
    } catch (error) {
        if (error instanceof axios.AxiosError && error.response) {
            monitorRatelimit(error.response as AxiosResponse);
        } else {
            console.error('An unexpected error occurred:', error);
        }
    }
}

export async function getGistFileContents(gistUrl: string) {
    const response: AxiosResponse = await axios.get(gistUrl, {params: {t: Date.now()}});
    monitorRatelimit(response);
    return response ? response.data : undefined;
}

export async function githubGetAllIssues(progress: Ref<number>): Promise<GithubIssue[]> {
    try {
        let allIssues: GithubIssue[] = [];
        const perPage: number        = 30;
        for (let page: number = 1; true; page++) {
            const response: GetIssueResponse = await axios.get('https://api.github.com/user/issues', {
                headers: getAuthorizationHeader(),
                params : {
                    page,
                    per_page: perPage,
                },
            });
            monitorRatelimit(response);
            allIssues = allIssues.concat(response.data);
            progress.value += response.data.length;
            if (response.data.length < perPage) {
                break;
            }
        }
        allIssues.sort((a, b) => a.title.localeCompare(b.title));
        return allIssues;
    } catch (error) {
        console.error('Error fetching issues:', error);
        return [];
    }
}

export async function githubGetAllGists(token: string): Promise<GithubGist[]> {
    const allGists: GithubGist[] = [];
    for (let page: number = 1; true; page++) {

        const response: GetGistsResponse = await axios.get('https://api.github.com/gists', {
            headers: getAuthorizationHeader(token),
            params : {
                page    : page,
                per_page: 30,
                t       : Date.now(),
            },
        });
        monitorRatelimit(response);
        const gists: GithubGist[] = response.data;

        allGists.push(...gists);
        if (gists.length === 0) {
            break;
        }
    }
    return allGists;
}

export async function githubAddIssueEntry(issue: GithubIssue, text: string) {
    const repo: string     = issue.repository!.name!;
    const owner: string    = issue.repository!.owner!.login!;
    const issueNum: number = issue.number;
    try {
        const url        = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNum}/comments`;
        const response = await axios.post(url, {body: text}, getAuthorizationConfig());

        monitorRatelimit(response);
        trace(`Issue ${owner}/${repo}/${issueNum} updated with comment:`, response.data);
    } catch (error) {
        console.error('Failed to add entry to issue:', error);
    }
}

function getAuthorizationConfig(token?: string) {
    return {
        headers: getAuthorizationHeader(token),
    };
}

function getAuthorizationHeader(token?: string) {
    return {Authorization: `token ${token ?? getToken()}`};
}

