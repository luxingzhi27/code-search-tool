<script setup lang="ts">
import {ref} from 'vue'
const props=defineProps({
    question: {
        type: String,
        default: ''
    },
})

const sources={
    AI:"AI suggestions",
    WEB:"Web search"
}
const resultSource=ref(sources.AI)
</script>

<template>
    
</template>
