<template>
    <div class="flex flex-col h-screen items-center w-full">
        <el-menu
            :default-active="activeIndex"
            class="w-full"
            mode="horizontal"
            :ellipsis="false"
            @select="handleSelect"
        >
            <el-menu-item index="0"><h2>Code Search Tool</h2></el-menu-item>
            <div class="flex-grow" />
            <el-sub-menu index="1">
                <template #title>Article Source</template>
                <el-menu-item></el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
                <template #title>Prefered Language</template>
                <el-menu-item index="2-1" v-for="language in programLanguages" :key="language">{{ language }}</el-menu-item>
            </el-sub-menu>
        </el-menu>
        <div class="flex justify-center items-center w-3/4 mt-10">
            <el-input
                placeholder="请输入您的问题"
                v-model="question"
            >
                <template #prefix><el-icon><Search/></el-icon></template>
            </el-input>
            <button class="mx-2.5" @click="handleQuestionSearch">Go!</button>
        </div>
        <div class="flex flex-1 w-3/4 mt-10 mb-2.5">
            <div class="w-1/2 mr-2.5">
                <el-card>
                    <template #header>
                        <span class="flex justify-start font-bold">AI suggestions</span>
                    </template>
                    <div class="flex justify-start">
                        <span class="w-full text-left" v-loading="aiLoading">{{ gptResponse }}</span>
                    </div>
                </el-card>
            </div>
            <div class="w-1/2 ml-2.5">
                <el-card>
                    <template #header>
                        <span class="flex justify-start font-bold">Web search</span>
                    </template>
                    <div class="flex justify-start" v-loading="webLoading">
                        <ul>
                            <li v-for="result in webSearchResults" :key="result.id">
                                <a :href="result.url" target="_blank">{{ result.name }}</a>
                            </li>
                        </ul>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getGptResponse } from '../api/gpt/gpt'
import {bingWebSearch} from '../api/bing/bingSearch'

const programLanguages:Array<string>=['C','C++','Java','Python','JavaScript','Rust','Go','TypeScript','Swift','Bash','Powershell']
const question = ref('')
const preferredLanguage = ref('python')
const gptResponse=ref('这里空空如也~')
const webSearchResults=ref([{id:1,name:'这里空空如也~',url:'https://www.baidu.com'}])

// web search
const webLoading=ref(false)

// ai suggestions
const aiLoading=ref(false)
const handleQuestionSearch = () => {
    aiLoading.value=true
    webLoading.value=true
    let content=question.value+',请使用'+preferredLanguage.value
    getGptResponse({
        'messages':[
            {'role':'user','content':content}
        ]
    }).then((res:string)=>{
        gptResponse.value=res
        aiLoading.value=false
    })

    bingWebSearch(question.value).then((res)=>{
        if(res.length>0){
            webSearchResults.value=res
            webLoading.value=false
        }else{
            console.log('no result')
            webLoading.value=false
        }
    })

}


const activeIndex = ref('1')
const handleSelect = (key: string, keyPath: string[]) => {
    console.log(key, keyPath)

}
</script>

<style scoped>
/* 使用 Tailwind CSS 样式 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.5);
  }
  100% {
    transform: scale(1);
  }
}

button {
  animation: pulse 0.5s;
  @apply px-3 py-1
}

el-input {
  animation: pulse 0.5s;
}
</style>../api/bing/bingSearch