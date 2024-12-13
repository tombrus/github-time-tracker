import {githubGetAllIssues, githubGetIssueComments, type GithubRepo} from '@/code/github';
import {extractTimerInfo, type TimerInfo} from '@/code/timer';
import ExcelJS from 'exceljs';
import {saveAs} from 'file-saver';
import type {Progress} from '@/code/progress';

type ReportInfo = {
    repo:GithubRepo;

}
type ReportEntry = {
    owner: string,
    repo: string,
    user: string,
    issue: number,
    title: string,
    begin: Date,
    end: Date
};
const REPORT_COLUMNS = Object.keys({} as ReportEntry).map(n => {
    return {
        header: n,
        key   : n,
    };
});

export async function makeReport(progress: Progress) {
    const fileName: string          = 'time-tracker.xlsx';
    const entryList1: ReportEntry[] = await getEntryList(progress);
    const entryList2: ReportEntry[] = consolidate(entryList1, progress);
    await saveToFile(entryList2, fileName, progress);
}

async function getEntryList(progress: Progress): Promise<ReportEntry[]> {
    const entryList: ReportEntry[] = [];
    await progress.newMessage('getting issues');
    let allIssues = await githubGetAllIssues();
    await progress.newBar(allIssues.length);
    await progress.newMessage('getting comments');
    let n = 0;
    for (const i of allIssues) {
        await progress.barProgress(++n);
        const comments = await githubGetIssueComments(i);
        for (let c of comments) {
            let body = c.body;
            if (body) {
                const info: TimerInfo | undefined = extractTimerInfo(body);
                if (info) {
                    const rowData: ReportEntry = {
                        owner: i.repository?.owner?.login ?? 'unknown',
                        repo : i.repository?.name ?? 'unknown',
                        user : info.user,
                        issue: i.number,
                        title: i.title,
                        begin: info.begin,
                        end  : info.end,
                    };
                    entryList.push(rowData);
                }
            }
        }
    }
    await progress.newMessage(`found ${entryList.length} entries`);
    return entryList;
}

function consolidate(entryList: ReportEntry[], progress: Progress): ReportEntry[] {
    return entryList;
}

async function saveToFile(entryList: ReportEntry[], fileName: string, progress: Progress) {
    await progress.newMessage(`creating file`);
    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('Time Tracker');

    sheet.columns = REPORT_COLUMNS;
    entryList.forEach(r => sheet.addRow(r));

    const contents = await workbook.xlsx.writeBuffer();
    const blob     = new Blob([contents], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
    await progress.newMessage(`saving file`);
    saveAs(blob, fileName);
}
