import {getUserLogin} from '@/code/state';
import {humanDate, humanDuration, humanTime} from '@/code/utils';

const SEP: string = ' ▪ ';

type GhttInfo = {
    type: string,
    version: number,
    date: Date,
    user: string,
}

const TIMER_INFO_EMOJI: string = '🕙';
type TimerInfo = GhttInfo & {
    begin: Date,
    end: Date,
}

export function makeTimerInfoString(begin: Date, end: Date): string {
    return makeInfoString(makeTimerInfo(begin, end));
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
        const fields = [
            `@${ti.user}`,
            `${humanDuration(ti.begin, ti.end)}`,
            `${humanDate(ti.begin)}`,
            `${humanTime(ti.begin)}`,
            `${humanTime(ti.end)}`,
        ]
        return `${TIMER_INFO_EMOJI} ${fields.join(SEP)}`;
    } else {
        return 'ERROR';
    }
}
