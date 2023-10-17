<script setup lang="ts">
import { onMounted,Ref ,ref} from 'vue';
import {wikipediaSearch,SearchResult} from '../api/mediawiki/wikipediaSearch'
const props= defineProps({
    keyWords: {
        type: Array as ()=>string[],
        required: true
    },
})


const results:Ref<SearchResult[]>=ref([])


onMounted(()=>{
    for(let word in props.keyWords){
        wikipediaSearch(word).then((res:SearchResult)=>{
            if(res.key!='null'){
                results.value.push(res)
            }
        })
    }
})

import {shell} from 'electron'
const handleClick=(url:string)=>{
    shell.openExternal(url)
}

</script>

<template>
    <div class="key-words">
        <div class="key-words-header">
            联想推荐
        </div>
        <el-space wrap>
            <el-tag v-for="(word,index) in results" :key="index" type="info" class="word" @click="handleClick(word.url)">
                {{ word.title }}
            </el-tag>
        </el-space>
    </div>
</template>

<style scoped>
.key-words{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: start;
}
.key-words-header{
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 10px;
}    

.word:hover{
    cursor: pointer;
}
</style>