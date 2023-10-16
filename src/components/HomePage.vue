<script setup lang="ts">
import { ref, watch ,reactive, onMounted,Ref} from 'vue'
import { getGptResponse } from '../api/gpt/gpt'
import {bingWebSearch} from '../api/bing/bingSearch'
import {githubSearchRepo} from '../api/github/githubRepo'
import Weblink from './Weblink.vue';
import GptResView from './GptResView.vue';
import GithubReposView from './GithubReposView.vue';
import SuggestQuestions from './SuggestQuestions.vue';
import {bingAutoSuggest} from '../api/bing/bingSuggestions'

const programLanguages:Array<string>=['C','C++','Java','Python','JavaScript','Vue.js','React.js','Rust','Go','TypeScript','Swift','Bash','Powershell']
const question = ref('')
const preferredLanguage = ref(programLanguages[0])
const gptResponse=ref('这里空空如也~')
const webSearchResults=ref([{snippet:'',name:'这里空空如也~',url:'https://www.bing.com'}])
const githubSearchResults=ref([{full_name:'',description:'',url:'',stars:-3,updated_at:''}])

const suggestQuestions:Ref<string[]>=ref([])
const keyWords:Ref<string[]>=ref([])
const searchBingSuggestions:Ref<string[]>=ref([])
const showBingSuggestions=ref(false)

const handleLanguageChange = (val:string) => {
    preferredLanguage.value=val
}

// search results sources
const sources={
    AI:"AI suggestions",
    WEB:"Web search",
    GITHUB:"Github search"
}

const resultSource=ref(sources.AI)
// web search
const webLoading=ref(false)

// github search
const githubLoading=ref(false)

// ai suggestions
const aiLoading=ref(false)

// keyWords Loading
const keyWordsLoading=ref(false)

// suggest questions loading
const suggestQuestionsLoading=ref(false)

//防止请求发送太频繁
const timer:any=ref()

watch(question,(newVal)=>{
    if(newVal.length>0){
        if(timer.value){
            clearTimeout(timer.value)
        }
        timer.value=setTimeout(()=>{
            getBingSuggestions(newVal)
        },40)
    }else{
        searchBingSuggestions.value=[]
    }
})


const handleQuestionSearch = async () => {
    aiLoading.value=true
    webLoading.value=true
    githubLoading.value=true
    let content=`${question.value}`
    let prompt=`假设你是一个帮助我学习代码的助手,下面我将提出一个问题,请你给出三个${preferredLanguage.value}的例子}`
    getGptResponse({
        'messages':[
            {'role':'user','content':prompt},
            {'role':'user','content':content}
        ]
    }).then((res:string)=>{
        gptResponse.value=res
        aiLoading.value=false
    })

    getSuggestQuestion(question.value)

    bingWebSearch(question.value+`${preferredLanguage.value}`).then((res)=>{
        if(res.length>0){
            webSearchResults.value=res
            webLoading.value=false
        }else{
            console.log('no result')
            webLoading.value=false
        }
    })

    getKeyWordsFromGpt(question.value).then((res)=>{
        if(res.length>0){
            keyWords.value=res
            console.log('keywords',keyWords.value)
            githubSearchRepo(keyWords.value[0],preferredLanguage.value,1,10).then((res)=>{
                if(res.length>0){
                    githubSearchResults.value=res
                    githubLoading.value=false
                }else{
                    console.log('github search repo no result')
                    githubLoading.value=false
                }
            })
        }else{
            console.log('no key words')
        }
    })
}


//TODO: 响应异常处理
const getKeyWordsFromGpt=async (question:string):Promise<string[]>=>{
    keyWordsLoading.value=true
    let prompt=`假设你是搜索引擎助手,我给出问题,请你给出这个问题有关编程技术的关键词,而不是编程语言的语法关键词,每一个关键词单独用{}括起来,问题的内容是${question}`
    return getGptResponse({
        'messages':[
            {'role':'user','content':prompt},
        ]
    }).then((res:string)=>{
        const getWords=(res:string):string[]=>{
            const regex = /{([^}]+)}/g;
            const words=res.match(regex)
            return words?.map((w: string) => w.slice(1, -1)) || [];
        }
        let words=getWords(res)
        keyWordsLoading.value=false
        return words
    })
}

//TODO: 响应异常处理
const getSuggestQuestion=(question:string='')=>{
    suggestQuestionsLoading.value=true
    let prompt=`假设你是搜索引擎助手,我给出问题,请你给出这个问题的6个相关联想问题,每一个联想问题单独用{}括起来,每个联想问题的前面不需要序号,联想问题不需要任何多余的内容,问题的内容是${question}`
    if(question.length===0){
        prompt=`请给我7个有关于编程技术方面的问题,每个问题请用{}单独括起来,问题中不需要任何多余的内容且不需要标序号`
    }
    getGptResponse({
        'messages':[
            {'role':'user','content':prompt},
        ]
    }).then((res:string)=>{
        const getQuestions=async (res:string):Promise<string[]>=>{
            const regex = /{([^}]+)}/g;
            const questions=res.match(regex)
            return questions?.map((q: string) => q.slice(1, -1)) || [];
        }
        getQuestions(res).then((res)=>{
            suggestQuestions.value=res
            suggestQuestionsLoading.value=false
        })
    })
}

 
const getBingSuggestions=(question:string)=>{
    bingAutoSuggest(question).then((res)=>{
        searchBingSuggestions.value=res
    })
}

const handleBingSuggestionSelect=(suggestion:string)=>{
    question.value=suggestion
}


const handleSuggestionsSelect=(ques:string)=>{
    question.value=ques
    handleQuestionSearch()
}

onMounted(()=>{
    getSuggestQuestion()
})

</script>


<template>
    <div class="flex w-full h-full">
        <el-scrollbar class="w-full">
            <div class="header">
                <el-dropdown @command="handleLanguageChange">
                    <div class="lang-choose">
                        <el-text>{{preferredLanguage}}</el-text>
                        <el-icon class="ml-2"><ArrowDown /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item v-for="(lang,index) in programLanguages" :key="index" :command="lang">{{lang}}</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
            <div class="flex flex-col h-screen items-center w-full">
                <div class="flex justify-start items-center w-3/4 mt-1 mb-2">
                    <div class="w-full" style="position: relative;">
                        <el-input
                            placeholder="请输入您的问题"
                            v-model="question"
                            clearable
                            @focus="showBingSuggestions=true"
                            @blur="showBingSuggestions=false"
                        >
                            <template #prefix><el-icon><Search/></el-icon></template>
                        </el-input>
                        <div v-if="showBingSuggestions && searchBingSuggestions.length>0" class="flex flex-col justify-start items-start p-2" 
                            style="background-color: #1a1a1a;border-radius: 8px;position: absolute;z-index: 999; width: 100%; top: 40px">
                            <div  class="bing-suggestion" v-for="(suggestion,index) in searchBingSuggestions" :key="index" @mousedown.prevent="handleBingSuggestionSelect(suggestion)">
                                {{ suggestion }}
                            </div>
                        </div>
                    </div>
                    <button class="mx-2.5" @click="handleQuestionSearch">Go!</button>
                </div>
                
                <div class="w-3/4">
                    <div class="w-full mb-4 mt-5">
                        <h2 class="text-2xl font-bold">搜索建议</h2>
                    </div>
                    <el-skeleton :rows="2" animated :loading="suggestQuestionsLoading">
                        <template #default>
                            <SuggestQuestions :questions="suggestQuestions" @select="handleSuggestionsSelect"></SuggestQuestions>
                        </template>
                    </el-skeleton>
                </div>
                
                <div class="w-full flex justify-center">
                    <div class="w-3/4">
                        <el-radio-group v-model="resultSource" class="mb-4 mt-3 flex justify-start w-full">
                            <el-radio-button :label="sources.AI">{{ sources.AI }}</el-radio-button>
                            <el-radio-button :label="sources.WEB">{{ sources.WEB }}</el-radio-button>
                            <el-radio-button :label="sources.GITHUB">{{ sources.GITHUB }}</el-radio-button>
                        </el-radio-group>
                        
                        <div class="w-full flex justify-center">

                            <!-- gpt view -->
                            <el-card class="my-2.5 w-full" v-if="resultSource===sources.AI">
                                <template #header>
                                    <span class="flex justify-start font-bold">AI suggestions</span>
                                </template>
                                <el-skeleton :rows="8" :loading="aiLoading" animated>
                                    <template #default>
                                        <GptResView  :text="gptResponse"></GptResView>
                                    </template>
                                </el-skeleton>
                            </el-card>
                            
                            <!-- web search -->
                            <el-card class="my-2.5 w-full" v-if="resultSource===sources.WEB">
                                <template #header>
                                    <span class="flex justify-start font-bold">Web search</span>
                                </template>
                                <el-skeleton :rows="8" :loading="webLoading" animated>
                                    <template #default>
                                        <Weblink :links="webSearchResults"></Weblink>
                                    </template>
                                </el-skeleton>
                            </el-card>

                            <!-- github search -->
                            <el-card class="my-2.5 w-full" v-if="resultSource===sources.GITHUB">
                                <template #header>
                                    <span class="flex justify-start font-bold">Github search</span>
                                </template>
                                <el-skeleton :rows="8" :loading="githubLoading" animated>
                                    <template #default>
                                        <GithubReposView :repos="githubSearchResults"></GithubReposView>
                                    </template>
                                </el-skeleton>
                            </el-card>
                        </div>
                    </div>
                </div>
            </div>
        </el-scrollbar>
        
    </div>
    
</template>



<style scoped>
/* 使用 Tailwind CSS 样式 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
    0% {
     opacity: 0;
     scale: 0.97;
    }
    100% {
     opacity: 1;
     scale: 1;
    } 
}

@keyframes fadeOut {
    0% {
     opacity: 1;
     scale: 1;
    }
    100% {
     opacity: 0;
     scale: 0.97;
    } 
}

.button {
  animation: pulse 0.5s;
}

.el-input {
  animation: fadeIn 0.5s;
}

.el-card{
    animation: fadeIn 0.4s ease-in-out;
}

.side-menu{
    width: 60px;
    height: 100%;
    background-color:rgba(29,30,31,0.5);
    border-right: 0.3px solid #4c4d4f;
    box-shadow: 0 10px 10px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
}

.lang-choose:hover{
    cursor: pointer;
    background-color: rgba(255,255,255,0.1);
    border-radius: 8px;
}

.lang-choose{
    width: fit-content;
    height: 35px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 4px;
    padding-bottom: 4px;
    margin-right: 30px;
}

.header{
    margin-top: 10px;
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: end;
}

.bing-suggestion{
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: start;
    padding-top: 5px;
    padding-bottom: 5px;
    padding-left: 10px;
    padding-right: 10px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
}

.bing-suggestion:hover{
    cursor: pointer;
    background-color: rgba(255,255,255,0.1);
    border-radius: 8px;
}

</style>