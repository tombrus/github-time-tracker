import {format} from 'date-fns';

export function humanTime(date: Date): string {
    return format(date, 'HH:mm');
}

export function humanDate(date: Date): string {
    return format(date, 'dd-MM-yyyy');
}

export function humanDuration(begin: Date, end: Date): string {
    const seconds = (end.getTime() - begin.getTime()) / 1000;
    const hours   = Math.floor(seconds / 3600);
    let minutes   = Math.floor((seconds % 3600) / 60);
    // minutes       = Math.ceil(minutes / 15) * 15;
    return `${twoDigits(hours)}:${twoDigits(minutes)}`;
}

export function twoDigits(n: number): string {
    return String(n).padStart(2, '0');
}

export type DPTime = { hours: number; minutes: number }

export function makeDPTime(hours: number, minutes: number): DPTime {
    return {
        hours,
        minutes,
    };
}

export function formatDPTime(t: DPTime): string {
    return `${twoDigits(t.hours)}:${twoDigits(t.minutes)}`;
}

export function yesterday(): Date {
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
}
