<script setup lang="ts">

import {ref} from 'vue';
import {login} from '@/code/state';

const TOKEN_URL  = 'https://github.com/settings/tokens/new?scopes=gist,repo&description=GitHub%20Time%20Tracker';
const inputToken = ref('');

async function tryLogin() {
    await login(inputToken.value);
    inputToken.value = '';
}

function makeToken() {
    window.open(TOKEN_URL, '_blank');
}
</script>

<template v-if="needToLogin()">
    <div class="flex flex-row h-full w-full justify-center items-center content-center">
        <div class="fixed inset-0 flex items-center justify-center">
            <div class="flex flex-col items-center space-y-4 bg-gray-200 border shadow-lg px-8 py-6 w-[900px]">
                <label for="token" class="text-center">
                    Login with your <span class="font-bold">GitHub Token</span> (it will not leave your browser)
                </label>
                <input type="text" id="token" v-model="inputToken" class="w-full text-center border rounded p-2"
                       @keydown.enter="tryLogin"/>
                <button @click="tryLogin" class="w-60 mybutton">Login</button>
                <button @click="makeToken" class="w-60 mybutton">Make New Token</button>
            </div>
        </div>
    </div>
</template>
