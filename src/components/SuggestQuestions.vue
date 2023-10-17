<script setup lang="ts">
import{Ref} from 'vue'
defineProps({
    questions: {
        type: Array<String>,
        required: true
    },
})

const emit = defineEmits(['select'])
const handleSelect = (ques: string) => {
    emit('select', ques)
}
</script>

<template>
    <div class="flex flex-col w-full justify-center items-center mb-2">
        <div class="w-full flex justify-start items-center flex-wrap">
            <el-tag v-for="(ques,index) in questions" :key="index" class="mx-2.5 my-1" @click="handleSelect(ques.toString())">{{ ques }}</el-tag>
        </div>
    </div>
</template>

<style scoped>
.el-tag {
    cursor: pointer;
}
</style>