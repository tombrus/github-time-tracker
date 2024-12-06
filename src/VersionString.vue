<script setup lang="ts">
import {ref} from 'vue';
import pkg from '../package.json';

const version    = ref(pkg.version);
</script>

<template>
    <a href="https://github.com/tombrus/github-time-tracker"
       class="absolute top-[60px] right-[40px] z-50 text-xs font-bold">
        v{{ version }}
    </a>
</template>
