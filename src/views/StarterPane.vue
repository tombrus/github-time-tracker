<script setup lang="ts">
import {ref} from 'vue';
import type {GithubIssue} from '@/code/github';
import {addEntry, IssueTimerState, startTimer, stopTimer} from '@/code/state';
import Datepicker from '@vuepic/vue-datepicker';
import {type DPTime, formatDPTime, humanDate, makeDPTime, yesterday} from '@/code/utils';

const props = defineProps<{
    issue: GithubIssue;
    issueTimerState: IssueTimerState;
}>();

const atTime       = ref<DPTime>(makeDPTime(9, 0));
const selectedDate = ref<Date>(yesterday());
const fromTime     = ref<DPTime>(makeDPTime(9, 0));
const toTime       = ref<DPTime>(makeDPTime(17, 0));

async function startStopNow() {
    await startStop(new Date());
}

async function startStopAt() {
    const d = new Date();
    d.setHours(atTime.value.hours);
    d.setMinutes(atTime.value.minutes);
    d.setSeconds(0, 0);
    await startStop(d);
}

async function addEntryAt() {
    const begin = new Date(selectedDate.value);
    const end   = new Date(selectedDate.value);
    begin.setHours(fromTime.value.hours, fromTime.value.minutes, 0, 0);
    end.setHours(toTime.value.hours, toTime.value.minutes, 0, 0);
    await addEntry(props.issue, begin, end);
}

async function startStop(d: Date) {
    switch (props.issueTimerState) {
        case IssueTimerState.NONE:
            await startTimer(d, props.issue);
            break;
        case IssueTimerState.ME :
            await stopTimer(d);
            break;
    }
}

function startStopText() {
    return props.issueTimerState === IssueTimerState.NONE ? 'Start' : 'Stop';
}

function dynClass(): string {
    let vis = props.issueTimerState === IssueTimerState.NONE || props.issueTimerState === IssueTimerState.ME;
    return vis ? 'visible' : 'invisible';
}

</script>

<template>
    <div class="flex flex-row">

        <div class="mybutton w-28 h-8"
             :class="dynClass()"
             @click="startStopNow()">
            {{ startStopText() }} Now
        </div>

        <div class="mybutton w-32 h-8"
             :class="dynClass()"
             @click="startStopAt()">
            {{ startStopText() }}&nbsp;@
            <Datepicker v-model="atTime"
                        :minutes-increment="15"
                        :minutes-grid-increment="15"
                        time-picker
                        is-24
                        :clearable="false"
                        hide-input-icon
                        auto-apply
            >
                <template #trigger>
                    <div class="hover:bg-black p-0 w-[44px]">
                        {{ formatDPTime(atTime) }}
                    </div>
                </template>
            </Datepicker>
        </div>

        <div class="">
            <div class="flex flex-row mybutton w-80 h-8"
                 @click="addEntryAt()">
                <div class="flex-1">Add&nbsp;Entry&nbsp;</div>

                <Datepicker v-model="selectedDate"
                            :minutes-increment="15"
                            :minutes-grid-increment="15"
                            :time-picker="false"
                            :enable-time-picker="false"
                            :clearable="false"
                            auto-apply>
                    <template #trigger>
                        <div class="hover:bg-black px-2 w-[106px]">
                            {{ humanDate(selectedDate) }}
                        </div>
                    </template>
                </Datepicker>

                <Datepicker v-model="fromTime"
                            :minutes-increment="15"
                            :minutes-grid-increment="15"
                            time-picker
                            is-24
                            :clearable="false"
                            hide-input-icon
                            auto-apply
                            class="w-12"
                >
                    <template #trigger>
                        <div class="hover:bg-black px-1 w-[50px]">
                            {{ formatDPTime(fromTime) }}
                        </div>
                    </template>
                </Datepicker>
                &nbsp;...
                <Datepicker v-model="toTime"
                            :minutes-increment="15"
                            :minutes-grid-increment="15"
                            time-picker
                            is-24
                            :clearable="false"
                            hide-input-icon
                            auto-apply
                >
                    <template #trigger>
                        <div class="hover:bg-black px-1 w-[50px]">
                            {{ formatDPTime(toTime) }}
                        </div>
                    </template>
                </Datepicker>
            </div>
        </div>
    </div>
</template>
