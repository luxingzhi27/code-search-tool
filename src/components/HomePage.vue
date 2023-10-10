<template>
    <div class="flex flex-col h-screen">
        <div class="flex justify-center items-center h-1/3">
            <el-input
                placeholder="请输入您的问题"
                v-model="question"
                class="w-1/2"
            ></el-input>
            <el-button class="mx-2.5" type="primary">Go!</el-button>
        </div>
        <div class="flex flex-1">
            <div class="w-1/2 p-4">
                <h2 class="text-lg font-bold mb-4">GPT 结果</h2>
                <p>ai建议</p>
            </div>
            <div class="w-1/2 p-4">
                <h2 class="text-lg font-bold mb-4">编程技术文章</h2>
                <ul>
                    <!-- <li v-for="article in articles" :key="article.id">
                        <a :href="article.url">{{ article.title }}</a>
                    </li> -->
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const question = ref('')
</script>

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

button {
  animation: pulse 0.5s;
}
</style>