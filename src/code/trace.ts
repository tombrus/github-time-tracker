export const TRACE: boolean = false;

export function trace(...args: any[]) {
    if (TRACE) {
        console.log(...args);
    }
}
