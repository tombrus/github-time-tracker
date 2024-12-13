<script setup lang="ts">
import type {GithubIssue} from '@/code/github';
import {computed, type PropType, ref} from 'vue';
import {dropIssue, getIssueState, IssueTimerState} from '@/code/state';
import CloseBox from '@/views/CloseBox.vue';
import '@vuepic/vue-datepicker/dist/main.css';
import StarterPane from '@/views/StarterPane.vue';

const props = defineProps({
    issue   : {
        type    : Object as PropType<GithubIssue>,
        required: true,
    },
    editable: {
        type   : Boolean,
        default: false,
    },
});

const hoverId         = ref(-1);
const issueTimerState = computed<IssueTimerState>(() => {
    return getIssueState(props.issue);
});

async function remove(x: GithubIssue) {
    await dropIssue(x);
}

function dynClassMain() {
    if (issueTimerState.value === IssueTimerState.ME) {
        return 'bg-green-300';
    } else {
        return 'bg-gray-300';
    }
}

function dynClassSub() {
    if (issueTimerState.value === IssueTimerState.ME) {
        return 'bg-green-200';
    } else {
        return 'bg-gray-200';
    }
}

function dynTextColor() {
    return props.issue.state=='closed'?'text-gray-400':''
}

</script>

<template>
    <div @mouseover="hoverId = issue.id"
         @mouseleave="hoverId = -1"
         class="w-full relative flex flex-row mb-1 p-1 cursor-default justify-center items-center"
         :class="dynClassMain()"
    >

        <CloseBox
            v-if="editable && issueTimerState!==IssueTimerState.ME"
            v-show="hoverId===issue.id"
            @click="remove(issue)"
        />

        <div class="flex flex-row w-full">

            <div class="flex flex-col text-left px-2 flex-1"
                 :class="dynTextColor()">

                <div class="flex flex-row">
                    <a class="font-bold hover:text-blue-600 hover:underline"
                       :href="issue.html_url" target="_blank" rel="noopener noreferrer" @click.stop>
                        {{ issue.title }}
                    </a>
                </div>
                <div class="flex flex-row items-center text-sm pl-6">
                    <a class="hover:text-blue-600 hover:underline"
                       :href="issue.html_url" target="_blank" rel="noopener noreferrer @click.stop">
                        #{{ issue.number }}
                    </a>
                    <div class="p-1">–</div>
                    <a class="hover:text-blue-600 hover:underline"
                       :href="issue.repository?.html_url" target="_blank" rel="noopener noreferrer @click.stop">
                        {{ issue.repository?.name }}
                    </a>
                    <div class="p-1">–</div>
                    <a class="hover:text-blue-600 hover:underline"
                       :href="issue.repository?.owner.html_url" target="_blank" rel="noopener noreferrer @click.stop">
                        {{ issue.repository?.owner.login }}
                    </a>
                </div>
            </div>

            <div v-if="editable"
                 class="flex flex-col py-2 px-3"
                 :class="dynClassSub()"
            >

                <StarterPane :issue="props.issue" :issue-timer-state="issueTimerState"/>

            </div>

        </div>
    </div>
</template>
