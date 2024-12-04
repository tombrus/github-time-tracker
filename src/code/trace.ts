export const TRACE: boolean = true;

export function trace(...args: any[]) {
    if (TRACE) {
        console.log(...args);
    }
}
