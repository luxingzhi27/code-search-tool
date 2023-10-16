<script setup lang="ts">

interface link{
    url:string
    snippet:string
    name:string
}

const props=defineProps({
    links:{
        type:Array as ()=>link[],
        required:true
    }
})

import {shell} from 'electron'
const handleLinkClick=(url:string)=>{
    shell.openExternal(url)
}
</script>

<template>
    <div class="flex flex-col" v-for="(link,index) in links" :key="index">
        <div class="web-link" @click="handleLinkClick(link.url)">
            <span  class="link-name">{{ link.name }}</span>
            <el-text class="w-full link-body">{{ link.snippet }}</el-text>
        </div>
    </div>
</template>

<style scoped>
.web-link{
    min-width: fit-content;
    min-height: fit-content;
    padding-top: 8px;
    padding-bottom: 14px;
    padding-right: 8px;
    padding-left: 8px;
    background-color: #1a1a1a;
    border-radius: 8px;
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    transition: transform 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
}
.web-link:hover{
    cursor: pointer;
    transform:scale(1.02);
}

.link-name{
    margin-left: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #646cff;
}

.link-body{
    margin-left: 14px;
    font-size: 14px;
    font-weight: 400;
    color: #ffffff;
}
</style>