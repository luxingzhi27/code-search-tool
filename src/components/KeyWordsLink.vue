<script setup lang="ts">
import { onBeforeMount, onBeforeUpdate, onMounted,Ref ,ref, watchEffect} from 'vue';
import {wikipediaSearch,SearchResult} from '../api/mediawiki/wikipediaSearch'
const props= defineProps({
    keyWords: {
        type: Array as ()=>SearchResult[],
        required: true
    },
})


 



import {shell} from 'electron'
const handleClick=(url:string)=>{
    shell.openExternal(url)
}

</script>

<template>
    <div class="key-words">
        <el-space wrap>
            <el-tag v-for="(word,index) in keyWords" :key="index" type="info" class="word" @click="handleClick(word.url)">
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
    

.word{
    transition: transform 0.1s ease-in-out;
}

.word:hover{
    cursor: pointer;
    color: #646cff;
    text-decoration: underline;
    transform: scale(1.05);
}
</style>