<template>
  <div>
    <el-dropdown trigger="hover" @command="handleLanguageChange" style="vertical-align: middle">
      <svg-icon class-name="size-icon" name="language" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of langOptions" :key="item.value" :disabled="lang === item.value" :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
const store = useStore()
const lang = computed(() => store.getters.language)

const { proxy } = getCurrentInstance()
const langOptions = ref([
  { label: '简体中文', value: 'zh-cn' },
  { label: 'English', value: 'en' },
  { label: '繁體中文', value: 'zh-tw' },
])

function handleLanguageChange(lang) {
  proxy.$modal.loading('正在设置语言，请稍候...')
  store.dispatch('app/setLang', lang)
  setTimeout('window.location.reload()', 1000)
}
</script>

<style lang="scss" scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>
