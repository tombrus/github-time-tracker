import {type Ref, ref, watch} from 'vue';
import {decrypt, encrypt} from '@/code/crypt';
import {getGistFileContents, githubAddIssueEntry, githubCreateGist, githubGetAllGists, githubGetUser, type GithubGist, type GithubIssue, githubUpdateGist, type GithubUser, type RequestGist} from '@/code/github';
import {trace} from '@/code/trace';
import {makeTimerInfoString} from '@/code/timer';

//==================================================================================================
export type GhttState = {
    token: string,
    gist: GhttGist,
    user?: GithubUser,
}
export type GhttGist = {
    id: string;
    issues: GithubIssue[],
    start?: {
        issue: GithubIssue,
        at: Date,
    }
}

export enum IssueTimerState {
    NONE,
    ME,
    OTHER
}

//==================================================================================================
const DEV_POST: string      = import.meta.env.VITE_ENV === 'development' ? '-dev' : '';
const COOKIE_NAME: string   = `GHTT-state${DEV_POST}`;
const GIST_NAME: string     = `GHTT-state${DEV_POST}`;
const GIST_FILENAME: string = `${GIST_NAME}.json`;

const EMPTY_TOKEN: string    = '';
const EMPTY_GIST: GhttGist   = {
    id    : '',
    issues: [],
};
const EMPTY_STATE: GhttState = {
    token: EMPTY_TOKEN,
    gist : EMPTY_GIST,
};

//==================================================================================================
const activeIssueId: Ref<number>    = ref<number>(-1);
const ghttState: Ref<GhttState>     = ref<GhttState>(EMPTY_STATE);
const loginInProgress: Ref<boolean> = ref<boolean>(false);

(async function () {
    loginInProgress.value = true;
    ghttState.value       = await readStateFromCookie();
    loginInProgress.value = false;
})();

//==================================================================================================
export function isLoginInProgress() {
    return loginInProgress.value;
}

export function getToken(): string {
    return ghttState.value.token;
}

export function getUserName(): string {
    return ghttState.value.user?.name ?? '???';
}

export function getUserLogin(): string {
    return ghttState.value.user?.login ?? '???';
}

export function getIssues(): GithubIssue[] {
    return ghttState.value.gist.issues;
}

export async function addIssue(issue: GithubIssue) {
    ghttState.value.gist.issues.push(issue);
    ghttState.value.gist.issues.sort((a, b) => {
        // if (a.id==activeIssueId.value) return +1;
        // if (b.id==activeIssueId.value) return -1;
        return a.title.localeCompare(b.title);
    });
    await writeTheGist();
}

export async function dropIssue(issue: GithubIssue) {
    const i = ghttState.value.gist.issues.findIndex(x => x.id === issue.id);
    if (i !== -1) {
        ghttState.value.gist.issues.splice(i, 1);
        await writeTheGist();
    }
}

export function getIssueState(issue: GithubIssue): IssueTimerState {
    const id = activeIssueId.value;
    return id == -1 ? IssueTimerState.NONE : id == issue.id ? IssueTimerState.ME : IssueTimerState.OTHER;
}

export function loggedin(): boolean {
    return !!getToken();
}

export async function login(token: string) {
    loginInProgress.value = true;
    const value           = await readState(token);
    trace('LOGIN', value);
    ghttState.value       = value;
    loginInProgress.value = false;
}

export function logout() {
    ghttState.value = EMPTY_STATE;
    deleteAllCookies();
}

function deleteAllCookies() {
    document.cookie.split(';').forEach(c => {
        const eqPos     = c.indexOf('=');
        const name      = eqPos > -1 ? c.slice(0, eqPos) : c;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
}

export async function startTimer(at: Date, issue: GithubIssue) {
    const issueId = issue.id;
    trace('START', issueId, at);
    activeIssueId.value        = issueId;
    ghttState.value.gist.start = {
        at,
        issue,
    };
    await writeTheGist();
}

export async function stopTimer(end: Date) {
    const start = ghttState.value.gist.start;
    if (start) {
        ghttState.value.gist.start = undefined;
        activeIssueId.value        = -1;
        await addEntry(start.issue, start.at, end);
    }
}

export async function addEntry(issue: GithubIssue, begin: Date, end: Date) {
    await githubAddIssueEntry(issue, makeTimerInfoString(begin, end));
    await writeTheGist();
}

//==================================================================================================
watch(ghttState, async (newState: GhttState, oldState: GhttState) => {
    if (JSON.stringify(newState.token) !== JSON.stringify(oldState.token)) {
        await writeTheCookie();
    }
    if (newState.token && JSON.stringify(newState.gist) !== JSON.stringify(oldState.gist)) {
        await writeTheGist();
    }
}, {deep: true});

async function readStateFromCookie(): Promise<GhttState> {
    return await readState(await readCookie());
}

async function readState(token: string): Promise<GhttState> {
    try {
        const user: GithubUser = await githubGetUser(token);
        if (user) {
            return {
                token,
                user,
                gist: await readGist(token),
            };
        }
    } catch (error) {
        // fall through
    }
    return EMPTY_STATE;
}

async function writeTheGist() {
    const token   = ghttState.value.token;
    const theGist = ghttState.value.gist;
    const nowGist = await readGist(token);
    if (nowGist !== theGist) {
        await writeGist(token, theGist);
    }
}

async function writeGist(token: string, gist: GhttGist) {
    const newGist: RequestGist = {
        description: GIST_NAME,
        public     : false,
        files      : {[GIST_FILENAME]: {content: JSON.stringify(gist, null, 2)}},
    };

    if (!gist.id) {
        trace('CREATE GIST...', token, newGist);
        gist.id                              = await githubCreateGist(newGist, token) ?? '';
        newGist.files[GIST_FILENAME].content = JSON.stringify(gist, null, 2);
    }

    trace(`WRITE GIST... ${gist.id} => `, token, newGist);
    await githubUpdateGist(gist, newGist, token);
}

async function readGist(token: string): Promise<GhttGist> {
    if (!token) {
        return EMPTY_GIST;
    }
    const allGists: GithubGist[]         = await githubGetAllGists(token);
    const myGist: GithubGist | undefined = allGists.find(g => g.description === GIST_NAME);
    const myFileUrl: string | undefined  = myGist?.files?.[GIST_FILENAME]?.raw_url;
    if (!myFileUrl) {
        await writeGist(token, EMPTY_GIST);
        return EMPTY_GIST;
    }
    const ghttGist = await getGistFileContents(myFileUrl);
    if (!ghttGist) {
        await writeGist(token, EMPTY_GIST);
        return EMPTY_GIST;
    }
    trace(`READ GIST '${token}' =>`, ghttGist);
    if (ghttGist.id !== myGist!.id) {
        ghttGist.id = myGist!.id;
        await writeGist(token, ghttGist);
    }
    return ghttGist;
}


async function writeTheCookie() {
    await writeCookie(ghttState.value.token);
}

async function writeCookie(cookie: string) {
    trace('WRITE token TO COOKIE =>', cookie);
    localStorage.setItem(COOKIE_NAME, await encrypt(cookie));
}

async function readCookie(): Promise<string> {
    try {
        const crypted = localStorage.getItem(COOKIE_NAME);
        if (crypted) {
            const token = await decrypt(crypted);
            trace('READ token FROM COOKIE =>', token);
            return token;
        }
    } catch (error) {
        // fall through
    }
    return EMPTY_TOKEN;
}

