<script setup lang="ts">

import {ref} from 'vue';
import {getIssues} from '@/code/state';
import {type GithubIssue} from '@/code/github';
import IssueStrip from '@/views/IssueStrip.vue';

const emit   = defineEmits(['selected']);
const issues = ref<GithubIssue[]>(getIssues());

function onIssueClick(issue: GithubIssue) {
    emit('selected', issue);
}
</script>

<template>
    <div class="flex flex-col items-center m-4">
        <IssueStrip
            v-for="x in issues"
            :issue="x"
            :editable="true"
            @click="onIssueClick(x)"
        />
    </div>
</template>
