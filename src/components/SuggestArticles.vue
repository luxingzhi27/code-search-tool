<script setup lang="ts">
import { onBeforeMount,ref,computed } from 'vue';
import {getStackOverflowQuestions,StackOverflowQuestion} from '../api/stackoverflow/LatestQuestion'

const tags=['sql','java','javascript','python','linux','windows','golang','web','c','c++','rust','vue','reactjs']
const pageSize=ref(7);
const currentPage=ref(1);
let totalCount=0
const isSuccess=ref(false);
const questions=ref<StackOverflowQuestion[]>([]);
const pagedQuestions=computed(()=>{
    return questions.value.slice((currentPage.value-1)*pageSize.value,currentPage.value*pageSize.value);
})

const loading=ref(false);

import {shell} from 'electron'
const handleLinkClick=(link:string)=>{
    shell.openExternal(link);
}

onBeforeMount(async () => {
    loading.value=true;
    const randomTag=tags[Math.floor(Math.random() * tags.length)];   
    questions.value = await getStackOverflowQuestions(randomTag);
    totalCount=questions.value.length;
    if(questions.value.length>0){
        isSuccess.value=true;
    }
    loading.value=false;
});
</script>

<template>
    <el-card class="my-4">
        <template #header>
            <div class="header-name">Stackoverflow</div>
        </template>
        <el-skeleton animated :loading="loading">
            <template #template>
                <div class="question-list">
                    <div class="question" v-for="(index) in 7" :key="index">
                        <el-skeleton-item variant="text" class="my-1.5" style="width: 20%;"></el-skeleton-item>
                        <el-skeleton-item variant="text" class="my-1.5" style="width: 100%;"></el-skeleton-item>
                        <el-skeleton-item variant="text" class="my-1.5" style="width: 33%;"></el-skeleton-item>
                    </div>
                </div>
            </template>
            <template #default>
                <div class="questions-list" v-if="isSuccess">
                    <div class="question" v-for="(ques,index) in pagedQuestions" :key="index" @click="handleLinkClick(ques.link)">
                        <div class="owner-name">{{ ques.owner_name }}</div>
                        <div class="title">{{ ques.title }}</div>
                        <div class="foot">
                            <div class="tags">
                                <el-space wrap>
                                    <el-tag v-for="(tag,index) in ques.tags" :key="index" type="warning">{{ tag }}</el-tag>
                                </el-space>
                            </div>
                            <div class="flex flex-wrap">
                                <div class="mx-2">浏览量: {{ ques.view_count }}</div>
                                <div class="mx-2">回答数: {{ ques.answer_count }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
                
        </el-skeleton>
        
        <div class="flex justify-center items-center">
            <el-pagination v-model:page-size="pageSize"  v-model:current-page="currentPage" layout="prev,pager,next" :total="totalCount"></el-pagination>
        </div>
    </el-card>
</template>

<style scoped>

.header-name{
    font-size: 22px;
    font-weight: 700;
    text-align: left;
}

.questions-list{
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    width: 100%;
    margin-top: 4px;
    margin-bottom: 10px;
}

.question{
    transition: transform 0.2s ease-in-out;
    background-color: #1a1a1a;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;
    padding-top: 8px;
    padding-bottom: 12px;
    padding-left: 5px;
    padding-right: 5px;
    margin-top: 5px;
    margin-bottom: 5px;
    width: 100%;
}

.owner-name{
    font-size: 18px;
    font-weight: 600;
    margin-top: 5px;
    margin-bottom: 5px;
    margin-left: 10px;
    margin-right: 5px;
    text-align: left;
}

.question:hover{
    transform: scale(1.02);
    cursor: pointer;
}

.title{
    font-size: 16px;
    font-weight: 600;
    color: #646cff;
    margin-top: 5px;
    margin-bottom: 12px;
    margin-left: 10px;
    margin-right: 5px;
    text-align: left;
}

.foot{
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    color: (0,0,0,0.2);
    width: 100%;
    padding-left: 10px;
    padding-right: 10px;
}
</style>