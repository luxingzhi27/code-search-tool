<script setup lang="ts">
import {ref} from 'vue'

interface repo{
    full_name:string
    description:string
    html_url:string
    stargazers_count:number
    forks_count:number
}

const props=defineProps({
    repos:{
        type:Array as ()=>repo[],
        required:true
    }
})
</script>

<template>
    <div class="w-full flex-col justify-start items-center">
        <div class="single-repo" v-for="(repo,index) in repos" :key="index">
            <div class='repo-header'>
                <div class="repo-name">{{ repo.full_name }}</div>
                <el-icon class="repo-star"><StarFilled /></el-icon>
            </div>
            <div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.single-repo{
    min-width: fit-content;
    min-height: fit-content;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 8px;
    padding-left: 8px;
    background-color: #1a1a1a;
    border-radius: 8px;
    margin-top: 6px;
    margin-bottom: 6px;
    margin-left: 6px;
    margin-right: 6px;
}

.repo-header{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.repo-header .repo-name{
    font-size: 18px;
    font-weight: 500;
    color: #fff;
}

.repo-header .repo-star{
    width: 20px;
    height: 20px;
    background-color: #ffd700;
}
</style>