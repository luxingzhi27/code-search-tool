<script setup lang="ts">
interface repo{
    full_name:string
    description:string
    url:string
    stars:number
    updated_at:string
}

const props=defineProps({
    repos:{
        type:Array as ()=>repo[],
        required:true
    }
})

const overflowHidForText=(val:string,max:number=80)=>{
    let textLength=val.length
    let resultText='';
    if(textLength>max){
        resultText=val.slice(0,max)+'...'
    }else{
        resultText=val
    }
    return resultText
}

const handleHiddenTextClick=()=>{
    console.log('hidden text clicked')
}

import {shell} from 'electron'

const openUrl=(url:string)=>{
    shell.openExternal(url)
}
</script>

<template>
    <div class="w-full flex-col justify-start items-center" v-if="repos.length>0&&repos[0].stars>=0">
        <div class="single-repo" v-for="(repo,index) in repos" :key="index" @click="openUrl(repo.url)" >
            <div class='repo-header'>
                <span class="repo-name">{{ repo.full_name }}</span>
                <div class="repo-star">
                    <el-icon color="rgb(255,215,0)"><StarFilled /></el-icon>
                    <div class="star-number">{{ repo.stars }}</div>
                </div>
            </div>
            <div class="repo-body">
                <div class="repo-description">
                    {{ overflowHidForText(repo.description)  }}
                </div>
            </div>
            <div class="repo-footer">
                <div class="repo-update-time">
                    {{ repo.updated_at }}
                </div>
            </div>
        </div>
    </div>
    <div class="w-full justify-center items-center" v-else>
        <div class="w-full text-center p-4 font-bold text-xl" v-if="repos[0].stars===-3">
            这里空空如也
        </div>
        <div class="w-full text-center p-4 font-bold text-1xl" v-if="repos[0].stars===-2">
            网络错误,请检查网络环境
        </div>
        <div class="w-full text-center p-4 font-bold text-1xl" v-if="repos[0].stars===-1">
            什么都没搜到,请换个关键词试试吧
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
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    transition: transform 0.2s ease-in-out;
}

.single-repo:hover{
    cursor: pointer;
    transform:scale(1.02);
}

.repo-header{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.repo-header .repo-name{
    margin-left: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #646cff;
}

.repo-header .repo-star{
    display: flex;
    flex-direction: row;
    justify-content: start;
    align-items: center;
}

.repo-header .repo-star el-icon{
    width: 20px;
    height: 20px;
    margin-left: 8px;
    margin-right: 8px;
}

.repo-header .repo-star .star-number{
    font-size: 16px;
    font-weight: 500;
    color: #fff;
}

.repo-body{
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    display: flex;
    flex-direction: column;
    align-items: start;
}

.repo-body.repo-description{
    font-size: 13px;
    font-weight: 400;
    color: #fff;
}

.repo-footer{
    margin-top: 8px;
    margin-bottom: 4px;
    margin-left: 8px;
    margin-right: 8px;
    display: flex;
    justify-content: end;
    align-items:center ;
    font-size: 12px;
}   

.repo-footer .repo-update-time{
    font-size: 12px;
    font-weight: 400;
    color: grey;
    text-align: center;
}

</style>