<script setup lang="ts">
import UserPane from '@/views/UserPane.vue';
import Login from '@/views/Login.vue';
import IssueList from '@/views/IssueList.vue';
import {loggedin} from '@/code/state';
import {ref} from 'vue';
import IssueIncludeDialog from '@/IssueIncludeDialog.vue';
import {ratelimitCritical, ratelimitMap} from '@/code/ratelimit';

const showAdd     = ref<boolean>(false);
const showOverlay = ref<boolean>(false);

function startAddIssue() {
    showOverlay.value = true;
}

function closeOverlay() {
    showOverlay.value = false;
}
</script>

<template>
    <div class="flex h-screen overflow-hidden">

        <div class="fixed top-0 left-0 right-0 bg-green-200 h-[80px] z-10">
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="text-center text-4xl font-extrabold">
                    GitHub Time Tracker
                </div>
                <UserPane/>
            </div>
        </div>

        <div class="flex flex-1 overflow-y-auto mt-[80px]">
            <div class="w-[200px] bg-green-200">
                <div v-if="loggedin() && !showAdd" @click="startAddIssue" class="mybutton mx-4">
                    Include Issues
                </div>

                <div v-if="ratelimitCritical"
                     class="flex flex-col  bg-orange-600 text-white border-white shadow-lg shadow-black m-3 p-2 text-xs">
                    <div class="grid grid-cols-3 gap-1 ">
                        <template v-for="rl in ratelimitMap.keys()" :key="rl">
                            <div>{{ rl }}</div>
                            <div class="text-right ">{{ ratelimitMap.get(rl)!.remaining }}</div>
                            <div class="text-right ">{{ ratelimitMap.get(rl)!.limit }}</div>
                        </template>
                    </div>
                </div>

            </div>

            <div class="flex-1 p-5 bg-green-100">
                <Login v-if="!loggedin()"/>
                <IssueList v-if="loggedin()"/>
            </div>
        </div>

        <IssueIncludeDialog
            v-on:closed="closeOverlay"
            :visible="showOverlay"/>
    </div>
</template>
