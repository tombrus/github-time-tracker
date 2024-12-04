<script setup lang="ts">

import {ref} from 'vue';
import {login} from '@/code/state';

const inputToken = ref('');

async function tryLogin() {
  await login(inputToken.value);
  inputToken.value = '';
}
</script>

<template v-if="needToLogin()">
  <div class="flex flex-row h-full w-full justify-center items-center content-center">
    <div class="flex flex-col space-y-2 border shadow-xl w-[900px] p-3 bg-gray-200">
      <label for="token" class="text-center">Login with your GitHub token</label>
      <input type="text" id="token" v-model="inputToken" class="text-center"/>
      <div @click="tryLogin" class="mybutton">Login</div>
    </div>
  </div>
</template>
