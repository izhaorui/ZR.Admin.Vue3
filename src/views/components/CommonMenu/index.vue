<template>
  <div class="tool-wrap">
    <template v-for="item in commonRouters">
      <div class="tool-item" @mouseenter="onMouseOver(item)" @mouseleave="onMouseOut(item)">
        <span class="close-used" @click="removeRoute(item)" v-if="item.hidden">
          <el-icon><CloseBold /></el-icon>
        </span>
        <router-link :to="item.path">
          <svg-icon :name="item.icon" class-name="card-panel-icon mb10" :color="item.color" />
          <div class="title">{{ item.menuTitle }}</div>
        </router-link>
      </div>
    </template>
  </div>

  <el-empty :image-size="80" v-if="commonRouters && commonRouters.length <= 0" />
</template>
<script setup>
import usePermissionStore from '@/store/modules/permission'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})
const showRemove = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    showRemove.value = val
  },
  {
    immediate: true
  }
)
const commonRouters = computed(() => usePermissionStore().commonlyUsedRoutes)

function removeRoute(item) {
  usePermissionStore().removeCommonlyUsedRoutes(item)
}
function onMouseOver(item) {
  item.hidden = true
}
function onMouseOut(item) {
  item.hidden = false
}
</script>
<style lang="scss" scoped>
.tool-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;

  .tool-item {
    text-align: center;
    width: 100px;
    margin-bottom: 30px;
    position: relative;

    .card-panel-icon {
      width: 25px;
      height: 25px;
    }
    .title {
      color: #606266;
      font-size: 13px;
    }
  }
  .close-used {
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
  }
}
</style>
