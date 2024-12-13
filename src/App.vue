<script setup lang="ts">
import {ref} from 'vue';
import UserPane from '@/views/UserPane.vue';
import Login from '@/views/Login.vue';
import IssueList from '@/views/IssueList.vue';
import IssueIncludeDialog from '@/IssueIncludeDialog.vue';
import GitHubCorner from '@/views/GitHubCorner.vue';
import RateLimits from '@/RateLimits.vue';
import VersionString from '@/VersionString.vue';
import {isLoginInProgress, loggedin} from '@/code/state';
import {makeReport} from '@/code/reporter';
import {Progress} from '@/code/progress';

const showDialog = ref<boolean>(false);

async function reportClicked() {
    const progress = new Progress();
    await makeReport(progress);
}
</script>

<template>
    <GitHubCorner/>
    <RateLimits/>
    <VersionString/>

    <div class="flex h-screen overflow-hidden">

        <div class="fixed top-0 left-0 right-0 bg-green-200 h-[80px] z-10">
            <div class="flex flex-col justify-center items-center w-full h-full">
                <div class="text-center text-4xl font-extrabold">
                    GitHub Time Tracker
                </div>
            </div>
        </div>

        <div class="flex flex-1 mt-[80px]">
            <div class="fixed left-0 top-[80px] bottom-0 w-[180px] bg-green-200 flex flex-col justify-between px-2">

                <div v-if="loggedin()"
                     class="flex flex-col space-y-2">
                    <div @click="showDialog = true" class="mybutton">
                        Include Issues
                    </div>
                    <div @click="reportClicked()" class="mybutton">
                        Report
                    </div>
                </div>
                <UserPane/>
            </div>
            <div class="flex-1 ml-[180px] overflow-y-auto p-5 bg-green-100">
                <div v-if="isLoginInProgress()" class="w-full text-center my-10 font-italic">
                    updating...
                </div>
                <template v-else>
                    <IssueList v-if="loggedin()"/>
                    <Login v-else/>
                </template>
            </div>
        </div>

        <IssueIncludeDialog
            v-on:closed="showDialog = false"
            :visible="showDialog"/>
    </div>
</template>
