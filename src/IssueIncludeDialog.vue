<script setup lang="ts">
import {ref, watch} from 'vue';
import {githubGetAllIssues, type GithubIssue} from '@/code/github';
import {addIssue, getIssues} from '@/code/state';
import IssueStrip from '@/views/IssueStrip.vue';

const emit = defineEmits([
  'closed',
  'include',
]);

const props = defineProps({
  visible: Boolean,
});

const loading   = ref(false);
const numLoaded = ref(0);
const allIssues = ref<GithubIssue[]>([]);

watch(() => props.visible, async (vis) => {
  if (vis) {
    loading.value   = true;
    numLoaded.value = 0;
    allIssues.value = await githubGetAllIssues(numLoaded);
    loading.value   = false;
  }
});

function all() {
  return allIssues.value.filter(x1 => !getIssues().some(x2 => x2.id === x1.id));
}

</script>

<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white w-[700px] h-1/2 rounded-lg shadow-lg flex flex-col justify-center items-center">
      <div class="w-full text-center text-xl font-bold mb-4 mt-auto bg-gray-800 text-white rounded-t-lg h-10 flex items-center justify-center">
        Include Issues
      </div>
      <div class="flex-1 mb-auto w-full px-8">
        <div v-if="loading" class="italic text-center">
          loading ({{ numLoaded }})...
        </div>
        <div v-else-if="all().length==0" class="italic text-center">
          No issues found, assign more issues to yourself!
        </div>
        <IssueStrip
            v-else
            v-for="x in all()"
            :issue="x"
            @click="addIssue(x)"
        />
      </div>
      <div class="mt-auto p-4">
        <div @click="emit('closed')" class="mybutton">Close</div>
      </div>

    </div>
  </div>
</template>
