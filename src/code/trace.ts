export const TRACE: boolean = import.meta.env.VITE_ENV === 'development';

export function trace(...args: any[]) {
    if (TRACE) {
        console.log(...args);
    }
}
