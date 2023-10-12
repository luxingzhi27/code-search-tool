<script setup lang="ts">
interface repo{
    full_name:string
    description:string
    url:string
    stargazers_count:number
    updated_at:string
}

const props=defineProps({
    repos:{
        type:Array as ()=>repo[],
        required:true
    }
})
</script>

<template>
    <div class="w-full flex-col justify-start items-center">
        <div class="single-repo" v-for="(repo,index) in repos" :key="index">
            <div class='repo-header'>
                <a :href="repo.url" class="repo-name">{{ repo.full_name }}</a>
                <div class="repo-star">
                    <el-icon><StarFilled /></el-icon>
                    <div class="star-number">{{ repo.stargazers_count }}</div>
                </div>
            </div>
            <div class="repo-body">
                <div class="repo-description">
                    {{ repo.description }}
                </div>
            </div>
            <div class="repo-footer">
                <div class="repo-update-time">
                    {{ repo.updated_at }}
                </div>
            </div>
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
    margin-top: 6px;
    margin-bottom: 6px;
    margin-left: 6px;
    margin-right: 6px;
}

.repo-header{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

.repo-header .repo-name{
    font-size: 18px;
    font-weight: 500;
    color: #fff;
}

.repo-header .repo-star{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.repo-header .repo-star el-icon{
    width: 20px;
    height: 20px;
    background-color: #ffd700;
    margin-left: 4px;
    margin-right: 4px;
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
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    text-align: left;
}

.repo-footer{
    margin-top: 8px;
    margin-bottom: 8px;
    margin-left: 8px;
    margin-right: 8px;
    display: flex;
    justify-content: end;
    align-items:center ;
}   

.repo-footer .repo-update-time{
    font-size: 12px;
    font-weight: 400;
    color: #fff;
    text-align: center;
}

</style>