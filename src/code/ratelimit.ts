import type {AxiosResponse} from 'axios';
import type {OctokitResponse} from '@octokit/types/dist-types/OctokitResponse';
import {ref, type Ref} from 'vue';

const RESOURCE_NAME: string  = 'x-ratelimit-resource';
const USED_NAME: string      = 'x-ratelimit-used';
const LIMIT_NAME: string     = 'x-ratelimit-limit';
const REMAINING_NAME: string = 'x-ratelimit-remaining';
const RESET_NAME: string     = 'x-ratelimit-reset';

export type RateLimitInfo = {
    resource: string,
    used: number,
    limit: number,
    remaining: number,
    reset: Date,
}
export const ratelimitMap: Ref<Map<string, RateLimitInfo>> = ref(new Map());
export const ratelimitCritical: Ref<boolean>               = ref(false);

export function monitorRatelimit(response: AxiosResponse | OctokitResponse<any, any>) {
    const requiredHeaders = [RESOURCE_NAME, USED_NAME, LIMIT_NAME, REMAINING_NAME, RESET_NAME];
    const missingHeaders  = requiredHeaders.filter(header => !response.headers.hasOwnProperty(header));

    if (missingHeaders.length === 0) {
        const resource: string  = response.headers[RESOURCE_NAME];
        const used: number      = Number(response.headers[USED_NAME]);
        const limit: number     = Number(response.headers[LIMIT_NAME]);
        const remaining: number = Number(response.headers[REMAINING_NAME]);
        const reset: Date       = new Date(Number(response.headers[RESET_NAME]) * 1000);

        ratelimitMap.value.set(resource, {
            resource,
            used,
            limit,
            remaining,
            reset,
        });

        ratelimitCritical.value = Array.from(ratelimitMap.value.values()).some(
            ({
                 remaining,
                 limit,
             }) => (remaining / limit < 0.5),
        );
        //console.log(`RATE LIMIT: ${resource}: ${remaining} left of ${limit} (until ${reset.toLocaleTimeString()}) ${(ratelimitCritical.value?"CRITICAL":"")}`);
    }
}


