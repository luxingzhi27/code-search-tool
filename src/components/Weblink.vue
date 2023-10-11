<script setup lang="ts">
const props=defineProps({
    url: {
        type: String,
        required: true
    },
    snippet:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
})

import {shell} from 'electron'
const handleLinkClick=(e:any)=>{
    e.preventDefault()
    shell.openExternal(props.url)
}
</script>

<template>
    <div class="flex flex-col justify-start items-start my-2">
        <a v-on:click="handleLinkClick" :href="url" class="font-bold">{{ name }}</a>
        <el-text  truncated class="w-full">{{ snippet }}</el-text>
    </div>
</template>