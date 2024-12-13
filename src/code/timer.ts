import {getUserLogin} from '@/code/state';
import {humanDate, humanDuration, humanTime} from '@/code/utils';

const SEP: string = ' ▪ ';

export type GhttInfo = {
    type: string,
    version: number,
    date: Date,
    user: string,
}

const TIMER_INFO_EMOJI: string = '🕙';
export type TimerInfo = GhttInfo & {
    begin: Date,
    end: Date,
}

export function toGhttInfo(o: any) {
    const isGhttInfo = typeof o === 'object' &&
        o !== null &&
        typeof o.type === 'string' &&
        typeof o.version === 'number' &&
        o.date instanceof Date &&
        typeof o.user === 'string';
    return isGhttInfo ? o as TimerInfo : undefined;
}

export function toTimerInfo(o: any): TimerInfo | undefined {
    const isTimerInfo = toGhttInfo(o) &&
        o.type === 'TimerInfo' &&
        o.begin instanceof Date &&
        o.end instanceof Date;
    return isTimerInfo ? o as TimerInfo : undefined;
}

export function makeTimerInfoString(begin: Date, end: Date): string {
    return makeInfoString(makeTimerInfo(begin, end));
}

export function extractTimerInfo(body: string) {
    const jsonStart = body.indexOf('```json') + 7;
    const jsonEnd   = body.indexOf('```', jsonStart);
    if (7 <= jsonStart && jsonEnd !== -1) {
        const jsonString = body.substring(jsonStart, jsonEnd).trim();
        try {
            return toTimerInfo(postprocessDates(JSON.parse(jsonString)));
        } catch (e) {
            // ignore
        }
    }
    return undefined;
}

function makeTimerInfo(begin: Date, end: Date): TimerInfo {
    begin.setSeconds(0, 0);
    end.setSeconds(0, 0);

    // begin.setMinutes(Math.floor(begin.getMinutes() / 15) * 15);
    // end.setMinutes(Math.ceil(end.getMinutes() / 15) * 15);

    return {
        type   : 'TimerInfo',
        version: 1,
        date   : new Date(),
        user   : getUserLogin(),
        begin,
        end,
    };
}

function makeInfoString(ti: GhttInfo) {
    const human = makeHumanDescription(ti);
    const json  = JSON.stringify(ti, null, 2);
    return human + '\n```json\n' + json + '\n```';
}

function makeHumanDescription(i: GhttInfo): string {
    if (i.type === 'TimerInfo') {
        const ti: TimerInfo = i as TimerInfo;
        const fields        = [
            `@${ti.user}`,
            `${humanDuration(ti.begin, ti.end)}`,
            `${humanDate(ti.begin)}`,
            `${humanTime(ti.begin)}`,
            `${humanTime(ti.end)}`,
        ];
        return `${TIMER_INFO_EMOJI} ${fields.join(SEP)}`;
    } else {
        return 'ERROR';
    }
}

function postprocessDates(o: any): any {
    for (const key in o) {
        if (typeof o[key] === 'string' && !isNaN(Date.parse(o[key]))) {
            o[key] = new Date(o[key]);
        } else if (typeof o[key] === 'object') {
            postprocessDates(o[key]);
        }
    }
    return o;
}

