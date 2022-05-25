<template>
  <div></div>
</template>
<!-- ！！！这里有坑 template里面要有div标签，不然页面会出现各种问题-->
<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { params, query } = route
const { path } = params

router.replace({ path: '/' + path, query })
</script>
