<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component, route }" :key="route.path">
      <transition appear name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </el-main>
</template>
<script setup>
const route = useRoute()
const store = useStore()
const cachedViews = computed(() => {
  return store.state.tagsView.cachedViews
})
</script>
