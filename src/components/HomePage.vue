<script setup lang="ts">
import { ref, watch ,reactive, onMounted,Ref,onBeforeMount, nextTick} from 'vue'
import { getGptResponse } from '../api/gpt/gpt'
import { useGpt } from '../api/gpt/GptStreamVue'
import {bingWebSearch,bingWebSearchSize} from '../api/bing/bingSearch'
import {githubSearchRepo,githubSearchRepoSize} from '../api/github/githubRepo'
import Weblink from './Weblink.vue';
import GptResView from './GptResView.vue';
import GithubReposView from './GithubReposView.vue';
import SuggestQuestions from './SuggestQuestions.vue';
import KeyWordsLink from './KeyWordsLink.vue';
import {bingAutoSuggest} from '../api/bing/bingSuggestions'
import {wikipediaSearch,SearchResult} from '../api/mediawiki/wikipediaSearch'
import { ElScrollbar } from 'element-plus'
import StackoverflowArticles from './SuggestArticles.vue'
import { ipcRenderer } from 'electron'
import { ElMessage } from 'element-plus'

const gptApiKey:Ref<string>=ref(ipcRenderer.sendSync('electron-store-get','gpt-api-key'))
const isGptApiFilled:Ref<boolean>=ref(ipcRenderer.sendSync('electron-store-get','gpt-api-key-filled'))
const isBingApiFilled:Ref<boolean>=ref(ipcRenderer.sendSync('electron-store-get','bing-api-key-filled'))
const bingApiKey:Ref<string>=ref(ipcRenderer.sendSync('electron-store-get','bing-api-key'))

const programLanguages:Array<string>=['C','C++','Java','Python','C#','JavaScript','Vue','React','Rust','Go','TypeScript','Swift','Bash','Powershell']
const question = ref('')
const preferredLanguage = ref(programLanguages[2])
const webSearchResults=ref([{snippet:'',name:'这里空空如也~',url:'https://www.bing.com'}])
const githubSearchResults=ref([{full_name:'',description:'',url:'',stars:-3,updated_at:''}])

const suggestQuestions:Ref<string[]>=ref([])
const keyWords:Ref<string[]>=ref([])  //联想关键词
const wikiRes:Ref<SearchResult[]>=ref([]) //wiki搜索结果
const searchBingSuggestions:Ref<string[]>=ref([])
const showBingSuggestions=ref(false)
const beginSearch=ref(false)

const handleLanguageChange = (val:string) => {
    preferredLanguage.value=val
}

// search results sources
const sources={
    AI:"AI建议",
    WEB:"网络搜索",
    GITHUB:"Github搜索"
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


watch(question,(newVal)=>{
    if(showBingSuggestions.value){
        getBingSuggestions(newVal)
    }else{
        searchBingSuggestions.value=[]
    }
})

watch(preferredLanguage,(newVal)=>{
    handleQuestionSearch()
})


//github分页
const githubCurrentPage=ref(1)
const githubTotalCount=ref(0)
const githubPageSize=ref(10)

const handleGithubPageChange=()=>{
    githubLoading.value=true
    githubSearchRepo(keyWords.value[0],preferredLanguage.value,githubCurrentPage.value,githubPageSize.value).then((res)=>{
        if(res.length>0){
            githubSearchResults.value=res
            githubLoading.value=false
        }else{
            githubLoading.value=false
        }
    })
}

//web搜索分页
const webCurrentPage=ref(1)
const webTotalCount=ref(0)
const webPageSize=ref(10)

const handleWebPageChange=()=>{
    webLoading.value=true
    bingWebSearch(question.value+`${preferredLanguage.value}`,webCurrentPage.value,webPageSize.value,bingApiKey.value).then((res)=>{
        if(res.length>0){
            webSearchResults.value=res
            webLoading.value=false
        }else{
            webLoading.value=false
        }
    })
}

const { msgList, streaming, streamingText, stream } = useGpt(gptApiKey.value, false)

const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const scrollTopValue= ref(0)
const handleScroll=({scrollTop}:any)=>{
    scrollTopValue.value=scrollTop
}
// 监听streamingText变化，滚动到底部
watch(streamingText, (val) => {
  if (val) {
    if(val.length===0){
        aiLoading.value=true
    }
    if(val.length>0){
        aiLoading.value=false
    }
    if(Math.abs(scrollTopValue.value+innerRef.value!.clientHeight-innerRef.value!.scrollHeight)<20){
        scrollbarRef.value?.setScrollTop(innerRef.value!.clientHeight);
    }
  }
})

const handleQuestionSearch = async () => {
    beginSearch.value=true
    aiLoading.value=true
    webLoading.value=true
    githubLoading.value=true
    let content=`${question.value}`
    let prompt=`假设你是一个帮助我学习代码的助手,下面我将提出一个问题,请你给出一些${preferredLanguage.value}的例子}`
    if(programLanguages.some((lang)=>{
        return question.value.toLocaleLowerCase().includes(lang.toLocaleLowerCase())
    })){
        prompt=`假设你是一个帮助我学习代码的助手,下面我将提出一个问题,请你给出三个例子}`
    }
    stream(prompt+'\n'+content)


    getSuggestQuestion(question.value)

    bingWebSearchSize(question.value+` ${preferredLanguage.value}`,bingApiKey.value).then((res)=>{
        webTotalCount.value=res
    })

    bingWebSearch(question.value+` ${preferredLanguage.value}`,webCurrentPage.value,webPageSize.value,bingApiKey.value).then((res)=>{
        if(res.length>0){
            webSearchResults.value=res
            webLoading.value=false
        }else{
            console.log('no result')
            webLoading.value=false
        }
    })

    getKeyWordsFromGpt(question.value).then((res)=>{
            keyWords.value=res
            console.log('keywords',keyWords.value)
            let githubSearchPrompt=question.value
            if(keyWords.value.length>0){
                githubSearchPrompt=keyWords.value[0]
            }
            if(keyWords.value.length>1){
                githubSearchPrompt=keyWords.value[0]
            }
            githubSearchRepoSize(githubSearchPrompt,preferredLanguage.value).then((res)=>{
                githubTotalCount.value=res
            })
            githubSearchRepo(githubSearchPrompt,preferredLanguage.value,1,githubPageSize.value).then((res)=>{
                if(res.length>0){
                    githubSearchResults.value=res
                    githubLoading.value=false
                }else{
                    githubLoading.value=false
                }
            })
            getWikiRes()
    })
}

const getWikiRes = async () => {
  wikiRes.value = [];
  for (const word of keyWords.value) {
    try {
      wikipediaSearch(word).then((res)=>{
        if (res) {
            let flag=false
            wikiRes.value.forEach((wiki)=>{
                if(wiki.key===res.key){
                    flag=true
                    return
                }
            })
            if(flag===false){
                wikiRes.value.push(res);
            }
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};


//TODO: 响应异常处理
const getKeyWordsFromGpt=async (question:string):Promise<string[]>=>{
    keyWordsLoading.value=true
    let prompt=`假设你是搜索引擎助手,我给出问题,请你用中文给出不超过10个这个问题有关编程技术的相关联想关键词,而不是编程语言的语法关键词,每一个关键词单独用{}括起来,例如{关键词1},{关键词2}...,问题的内容是${question}`
    return getGptResponse({
        'messages':[
            {'role':'user','content':prompt},
        ]
    },gptApiKey.value).then((res:string)=>{
        const getWords=(res:string):string[]=>{
            const regex = /{([^}]+)}/g;
            const words=res.match(regex)
            return words?.map((w: string) => w.slice(1, -1)) || [];
        }
        let words=getWords(res)
        keyWordsLoading.value=false
        console.log('keywordsloading',keyWordsLoading.value)
        return words
    }).catch((err)=>{
        console.log(err)
        let words=[err.message||'error']
        keyWordsLoading.value=false
        return words
    })
}

//TODO: 响应异常处理
const getSuggestQuestion=(question:string='')=>{
    suggestQuestionsLoading.value=true
    let prompt=`假设你是搜索引擎助手,我给出问题,请你给出6个我接下来可能会问的相关联想问题,每一个联想问题单独用{}括起来,例如{如何解析json文件},请不要包含任何多余的内容,我要问的问题的内容是${question}`
    if(question.length===0){
        prompt=`请给我6个有关于编程技术方面的问题,问题用{}单独括起来,例如{如何解析json文件},请不要包含任何多余的内容`
    }
    getGptResponse({
        'messages':[
            {'role':'user','content':prompt},
        ]
    },gptApiKey.value).then((res:string)=>{
        const getQuestions=async (res:string):Promise<string[]>=>{
            const regex = /{([^}]+)}/g;
            const questions=res.match(regex)
            return questions?.map((q: string) => q.slice(1, -1)) || [];
        }
        getQuestions(res).then((res)=>{
            suggestQuestions.value=res
            suggestQuestionsLoading.value=false
        })
    }).catch((err)=>{
        console.log(err)
        suggestQuestions.value=[err.message||'error']
        suggestQuestionsLoading.value=false
    })
}

 
const getBingSuggestions=(question:string)=>{
    bingAutoSuggest(question,bingApiKey.value).then((res)=>{
        searchBingSuggestions.value=res
    })
}

const handleBingSuggestionSelect=(suggestion:string)=>{
    showBingSuggestions.value=false
    question.value=suggestion
    handleQuestionSearch()
}


const handleSuggestionsSelect=(ques:string)=>{
    question.value=ques
    handleQuestionSearch()
}

import { shell } from 'electron'
const handleKeyWordsClick=(word:string)=>{
    const url='https://www.bing.com/search?q='+word
    shell.openExternal(url)
}

const returnToHome=()=>{
    beginSearch.value=false
}


const submitGptApiKey=()=>{
    if(gptApiKey.value.length===0){
        ElMessage({
            message: 'key不能为空',
            type: 'warning'
        })
        return
    }
    ipcRenderer.send('electron-store-set','gpt-api-key',gptApiKey.value)
    ipcRenderer.send('electron-store-set','gpt-api-key-filled',true)
    setTimeout(() => {
        isGptApiFilled.value=ipcRenderer.sendSync('electron-store-get','gpt-api-key-filled')
        gptApiKey.value=ipcRenderer.sendSync('electron-store-get','gpt-api-key')
    }, 100);
}

const submitBingApiKey=()=>{
    if (bingApiKey.value.length===0) {
        ElMessage({
            message: 'key不能为空',
            type: 'warning'
        })
        return
    }
    ipcRenderer.send('electron-store-set','bing-api-key',bingApiKey.value)
    ipcRenderer.send('electron-store-set','bing-api-key-filled',true)
    setTimeout(() => {
        isBingApiFilled.value=ipcRenderer.sendSync('electron-store-get','bing-api-key-filled')
        bingApiKey.value=ipcRenderer.sendSync('electron-store-get','bing-api-key')
    }, 100);
}


onBeforeMount(()=>{
    getSuggestQuestion()
})

</script>


<template>
    <div class="flex w-full h-full">
        <div class="flex w-full h-full justify-center items-center flex-col" v-if="!isGptApiFilled||!isBingApiFilled">
            <h1 class="my-5">还没有填写gpt与bing搜索的api key喔~</h1>
            <p class="my-5">请前往http://gpt.zhizengzeng.com/ 购买gpt api key</p>
            <p class="my-5">请前往https://portal.azure.com/注册Azure账户获得bing api key</p>
            <div class="flex justify-center items-center w-2/3">
                <label for="gpt-api-key-input">gpt</label>
                <el-input id="gpt-api-key-input" v-model="gptApiKey" @keyup.enter.native="submitGptApiKey" class="my-2 ml-2 mr-1" placeholder="enter your gpt api key"></el-input>
                <button class="my-2 ml-1 mr-2" @click="submitGptApiKey">OK</button>
            </div>
            <div class="flex justify-center items-center w-2/3">
                <label for="bing-api-key-input">bing</label>
                <el-input id="bing-api-key-input" v-model="bingApiKey" @keyup.enter.native="submitBingApiKey" class="my-2 ml-2 mr-1" placeholder="enter your bing api key"></el-input>
                <button class="my-2 ml-1 mr-2" @click="submitBingApiKey">OK</button>
            </div>
        </div>
        <el-scrollbar ref="scrollbarRef"  class="w-full" @scroll="handleScroll" v-if="isGptApiFilled&&isBingApiFilled">
            <div ref="innerRef" class="w-full">
                <div class="header">
                    <div class="return-button" @click="returnToHome">
                        <el-icon><Back /></el-icon>
                    </div>
                    <div class="flex flex-wrap items-center justify-around">
                        <el-dropdown size="large">
                            <div class="lang-choose">
                                <el-text>Api Key</el-text>
                                <el-icon class="ml-2"><ArrowDown /></el-icon>
                            </div>
                            <template #dropdown>
                                <div class="flex flex-col justify-center items-start p-4">
                                    <div class="flex justify-around items-center">
                                        <span>gpt</span>
                                        <el-input v-model="gptApiKey" @keyup.enter="submitGptApiKey" class="my-2 ml-2 mr-1" placeholder="enter your gpt api key"></el-input>
                                        <button class="my-2 ml-1 mr-2" @click="submitGptApiKey">OK</button>
                                    </div>
                                    <div class="flex justify-around items-center">
                                        <span>bing</span>
                                        <el-input v-model="bingApiKey" @keyup.enter="submitBingApiKey" class="my-2 ml-2 mr-1" placeholder="enter your bing api key"></el-input>
                                        <button class="my-2 ml-1 mr-2" @click="submitBingApiKey">OK</button>
                                    </div>
                                </div>
                            </template>
                        </el-dropdown>
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
                </div>
                <div class="flex flex-col h-screen items-center w-full">
                    <div class="flex justify-start items-center w-3/4 mt-1 mb-2">
                        <div class="w-full" style="position: relative;">
                            <el-input
                                placeholder="请输入您的问题"
                                v-model="question"
                                clearable
                                @focus="()=>{
                                    showBingSuggestions=true
                                    getBingSuggestions(question)
                                }"
                                @blur="showBingSuggestions=false"
                                @keyup.enter.native="handleQuestionSearch"
                            >
                                <template #prefix><el-icon><Search/></el-icon></template>
                            </el-input>
                            <div v-if="showBingSuggestions&&searchBingSuggestions.length>0" class="flex flex-col justify-start items-start p-2" 
                                style="background-color: rgba(26,26,26,0.9);backdrop-filter: blur(8px); border-radius: 8px;position: absolute;z-index: 999; width: 100%; top: 40px">
                                <div  class="bing-suggestion" v-for="(suggestion,index) in searchBingSuggestions" :key="index" @mousedown.prevent="handleBingSuggestionSelect(suggestion)">
                                    {{ suggestion }}
                                </div>
                            </div>
                        </div>
                        <button class="mx-2.5" @click="handleQuestionSearch">Go!</button>
                    </div>
                    
                    <div class="w-3/4">
                        <div class="w-full mb-4 mt-5">
                            <h2 class="text-2xl font-bold">猜你想搜</h2>
                        </div>
                        <el-skeleton :rows="1" animated :loading="suggestQuestionsLoading">
                            <template #default>
                                <SuggestQuestions :questions="suggestQuestions" @select="handleSuggestionsSelect"></SuggestQuestions>
                            </template>
                        </el-skeleton>
                    </div>

                    <div class="w-3/4" v-if="!beginSearch">
                        <h2 class="text-2xl font-bold mb-6 mt-2">推荐文章</h2>
                        <StackoverflowArticles/>
                    </div>
                    
                    <div class="w-full flex justify-center" v-if="beginSearch">
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
                                    <el-skeleton :rows="5" :loading="aiLoading" animated>
                                        <template #default>
                                            <GptResView  :text="streamingText"></GptResView>
                                        </template>
                                    </el-skeleton>
                                </el-card>
                                
                                <!-- web search -->
                                <el-card class="my-2.5 w-full" v-if="resultSource===sources.WEB">
                                    <template #header>
                                        <span class="flex justify-start font-bold">Web search</span>
                                    </template>
                                    <el-skeleton :rows="8" :loading="webLoading" animated>
                                        <template #template>
                                            <div class="github-loading-skeleton">
                                                <div class="github-loading-skeleton-single" v-for="(index) in 10" :key="index">
                                                    <el-skeleton-item variant="p" class="mt-1.5 mb-2" style="width: 80%;"></el-skeleton-item>
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 33%;"></el-skeleton-item>
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 100%;"></el-skeleton-item>
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 45%;"></el-skeleton-item>
                                                </div>
                                            </div>
                                        </template>
                                        <template #default>
                                            <Weblink :links="webSearchResults"></Weblink>
                                        </template>
                                    </el-skeleton>
                                    <div class="flex justify-center items-center">
                                        <el-pagination :total="webTotalCount" v-model:current-page="webCurrentPage" v-model:page-size="webPageSize" layout="prev,pager,next" @current-change="handleWebPageChange"></el-pagination>
                                    </div>
                                </el-card>

                                <!-- github search -->
                                <el-card class="my-2.5 w-full" v-if="resultSource===sources.GITHUB">
                                    <template #header>
                                        <span class="flex justify-start font-bold">Github search</span>
                                    </template>
                                    <el-skeleton :loading="githubLoading" animated>
                                        <template #template>
                                            <div class="github-loading-skeleton">
                                                <div class="github-loading-skeleton-single" v-for="(index) in 10" :key="index">
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 20%;"></el-skeleton-item>
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 100%;"></el-skeleton-item>
                                                    <el-skeleton-item variant="text" class="my-1.5" style="width: 33%;"></el-skeleton-item>
                                                </div>
                                            </div>
                                        </template>
                                        <template #default>
                                            <GithubReposView :repos="githubSearchResults"></GithubReposView>
                                        </template>
                                    </el-skeleton>
                                    <div class="flex justify-center items-center">
                                        <el-pagination :total="githubTotalCount" v-model:current-page="githubCurrentPage" v-model:page-size="githubPageSize" layout="prev,pager,next" @current-change="handleGithubPageChange"></el-pagination>
                                    </div>
                                </el-card>

                                <div class="ml-6 flex flex-col justify-start items-start" style="width: 27%;" v-if="beginSearch">
                                    <div class="key-words-header">
                                        联想推荐
                                    </div>
                                    
                                        <el-skeleton animated :loading="keyWordsLoading">
                                            <template #default>
                                                <el-space wrap>
                                                    <el-tag class="search-key-words" v-for="(word,index) in keyWords" type="info" :key="index" @click="handleKeyWordsClick(word)"> {{ word }}</el-tag>
                                                </el-space>
                                            </template>
                                        </el-skeleton>
                                    
                                    <div class="key-words-header">
                                        维基百科
                                    </div>
                                    <el-skeleton animated :loading="keyWordsLoading">
                                        <template #default>
                                            <KeyWordsLink  :keyWords="wikiRes"></KeyWordsLink>
                                        </template>
                                    </el-skeleton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </el-scrollbar>
        
    </div>
    
</template>



<style scoped>

.return-button{
    width: 35px;
    height: 35px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-left: 8px;
    padding-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    margin: 14px;
}

.return-button:hover{
    background-color: rgba(255,255,255,0.2);
    cursor: pointer;
}


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
    justify-content: space-between;
    padding: 15px;
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

.key-words-header{
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 10px;
}

.search-key-words{
    transition: transform 0.1s ease-in-out; 
}

.search-key-words:hover{
    cursor: pointer;
    transform: scale(1.05);
    color: #646cff;
    text-decoration: underline;
}

.github-loading-skeleton{
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    width: 100%;
    margin-top: 4px;
    margin-bottom: 10px;
}

.github-loading-skeleton-single{
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

</style>