<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition appear name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>
<script setup>
import useTagsViewStore from '@/store/modules/tagsView'
// const route = useRoute()
const tagsViewStore = useTagsViewStore()
// tagsViewStore.addCachedView(route)
const cachedViews = computed(() => {
  return tagsViewStore.cachedViews
})
</script>
