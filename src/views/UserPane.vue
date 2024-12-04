<script setup lang="ts">
import {getUserName, loggedin, logout} from '@/code/state';
</script>

<template>
  <div v-if="loggedin()"
       class="absolute right-2 top-2 w-40 h-14 flex flex-col items-center justify-center bg-green-300">
    <div class="text-xs mb-1 font-bold">
      {{ getUserName() }}
    </div>
    <div @click="logout" class="mybutton text-xs mx-2">
      Logout
    </div>
  </div>
</template>
