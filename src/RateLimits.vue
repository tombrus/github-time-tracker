<script setup lang="ts">
import {ratelimitCritical, ratelimitMap} from '@/code/ratelimit';
import {ref} from 'vue';

const showIncidental = ref(false);
</script>

<template>
    <div v-if="ratelimitCritical || showIncidental"
         class="flex flex-col bg-orange-400  m-0.5 px-2 py-1 text-xs absolute top-0 left z-50 w-52"
         @mouseleave="showIncidental=false">
        <div class="text-center font-bold pb-1">
            GitHub API rate-limits
        </div>
        <div class="grid grid-cols-3 gap-1 ">
            <template v-for="rl in ratelimitMap.keys()" :key="rl">
                <div>{{ rl }}</div>
                <div class="text-right ">{{ ratelimitMap.get(rl)!.remaining }}</div>
                <div class="text-right ">{{ ratelimitMap.get(rl)!.limit }}</div>
            </template>
        </div>
    </div>

    <div v-else
         class="absolute top-0 left z-50 w-2 h-2 cursor-default"
         @mouseenter="showIncidental=true"
    />
</template>
