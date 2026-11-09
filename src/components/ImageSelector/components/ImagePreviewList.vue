<template>
  <div
    ref="previewContainer"
    class="preview-images el-upload-list el-upload-list--picture-card"
    :style="{
      '--preview-width': width,
      '--preview-height': height,
      '--el-upload-picture-card-size': width,
      '--el-upload-list-picture-card-size': width
    }">
    <div v-for="(img, index) in images" :key="`${img}-${index}`" class="preview-item el-upload-list__item" @click="emit('open')">
      <el-image :src="img" fit="contain" class="preview-thumb" />

      <div class="fun-wrap el-upload-list__item-actions" @click.stop>
        <el-tooltip content="更换" placement="top">
          <el-icon class="delete-icon" @click="emit('open')">
            <RefreshRight />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="查看" placement="top">
          <el-icon class="delete-icon" @click="handlePreview(index)">
            <Search />
          </el-icon>
        </el-tooltip>
        <el-tooltip content="删除" placement="top">
          <el-icon class="delete-icon" @click="emit('remove', img)">
            <Delete />
          </el-icon>
        </el-tooltip>
      </div>
    </div>
    <el-image-viewer
      v-if="showPreview"
      :hide-on-click-modal="true"
      :url-list="images"
      :initial-index="previewStartIndex"
      @close="showPreview = false" />
    <div v-if="limit > images.length" class="img-upload" @click="emit('open')">
      <svg-icon name="upload"></svg-icon>
    </div>
  </div>
</template>

<script setup>
import { Delete, RefreshRight, Search } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    required: true
  },
  width: {
    type: String,
    required: true
  },
  height: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['open', 'remove', 'reorder'])

const previewContainer = ref(null)
const showPreview = ref(false)
const previewStartIndex = ref(0)
let sortableInstance = null

const handlePreview = (index = 0) => {
  previewStartIndex.value = index
  showPreview.value = true
}

const refreshSortable = () => {
  if (!previewContainer.value) return
  if (sortableInstance) sortableInstance.destroy()

  sortableInstance = Sortable.create(previewContainer.value, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    draggable: '.preview-item',
    chosenClass: 'sortable-chosen',
    filter: '.img-upload',
    onEnd(event) {
      const newList = [...props.images]
      const moved = newList.splice(event.oldIndex, 1)[0]
      newList.splice(event.newIndex, 0, moved)
      emit('reorder', newList)
    }
  })
}

onMounted(refreshSortable)

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})

defineExpose({ refreshSortable })
</script>

<style scoped lang="scss">
.preview-images {
  --preview-width: 80px;
  --preview-height: 80px;
  --el-upload-picture-card-size: var(--preview-width);
  --el-upload-list-picture-card-size: var(--preview-width);
  margin-bottom: 10px;

  &.el-upload-list--picture-card {
    :deep(.el-upload-list__item.preview-item),
    .preview-item {
      width: var(--preview-width);
      height: var(--preview-height);
      margin: 0 8px 8px 0;
      box-sizing: border-box;
    }
  }

  .img-upload {
    width: var(--preview-width);
    height: var(--preview-height);
    margin: 0 8px 8px 0;
  }

  .preview-thumb {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.img-upload {
  border: 1px dashed var(--el-border-color-darker, #c0c4cc);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  text-align: center;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  vertical-align: top;
  background-color: var(--el-fill-color-lighter, #fafafa);

  &:hover {
    border-color: var(--el-color-primary, #409eff);
    color: var(--el-color-primary, #409eff);
  }
}

.preview-item {
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  .fun-wrap {
    justify-content: space-around;
  }
}

.sortable-ghost {
  opacity: 0.5;
}

.sortable-chosen {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
  z-index: 10;
}

.preview-item:hover {
  .fun-wrap {
    display: flex;
  }
}
</style>
