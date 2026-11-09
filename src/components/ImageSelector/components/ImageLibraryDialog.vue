<template>
  <el-dialog v-model="visible" draggable append-to-body title="选择资源" :width="dialogWidth" @closed="handleDialogClosed">
    <el-row class="dialog-wrap" :gutter="10">
      <div class="left">
        <el-tabs v-model="leftPanelTab">
          <el-tab-pane label="分类" name="category">
            <el-scrollbar :height="categoryScrollHeight">
              <el-tree
                ref="categoryTreeRef"
                :data="categories"
                :props="{ label: 'groupName', children: 'children' }"
                node-key="groupId"
                highlight-current
                default-expand-all
                :expand-on-click-node="false"
                class="category-tree"
                @node-click="handleCategoryClick">
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span>
                      <svg-icon v-if="data.children && data.children.length > 0" name="index"></svg-icon>
                      {{ node.label }}
                    </span>
                  </span>
                </template>
              </el-tree>
            </el-scrollbar>
            <div class="mt-2">
              <el-button v-hasPermi="['filegroup:add']" text @click="handleAddGroup">添加分类</el-button>
              <el-button text icon="refresh" @click="handleQueryFileGroupTree">刷新</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="历史记录" name="history">
            <div class="history-panel">
              <div class="history-top">
                <span class="history-count">最近使用 {{ recentUsedImages.length }} 张</span>
                <el-button v-if="recentUsedImages.length > 0" text type="danger" size="small" @click="clearAllHistory">清空</el-button>
              </div>
              <el-scrollbar :height="categoryScrollHeight">
                <div class="recent-images-grid">
                  <div v-if="recentUsedImages.length === 0" class="empty-state">暂无历史使用图片</div>
                  <div v-for="(img, index) in recentUsedImages" :key="`${img}-${index}`" class="recent-image-item" @click="addToSelection(img)">
                    <el-image :src="img" fit="contain" :style="{ width: '100%', height: '80px' }" />
                    <div class="item-actions" @click.stop>
                      <el-tooltip content="查看">
                        <el-icon class="action-icon" @click="handleViewHistory(index)">
                          <Search />
                        </el-icon>
                      </el-tooltip>
                      <el-tooltip content="移除记录">
                        <el-icon class="action-icon delete" @click="handleRemoveFromHistory(img)">
                          <Delete />
                        </el-icon>
                      </el-tooltip>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="right">
        <div class="image-top">
          <div class="selected-count">
            <span v-if="!isMoveMode">
              已选择
              <span class="text-danger"> {{ selectedImagesTemp.length }}/{{ props.limit }} </span>
            </span>
            <span v-else class="move-mode-indicator">
              <el-tag type="warning" effect="dark">移动模式</el-tag>
              已选择
              <span class="text-danger"> {{ selectedForMove.length }} </span>
              张
            </span>
          </div>

          <el-input
            v-if="!isMoveMode"
            v-model="queryParams.realName"
            class="search-input"
            clearable
            placeholder="搜索文件名"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
            @input="debouncedSearch">
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div class="image-top-actions">
            <template v-if="!isMoveMode">
              <el-button v-if="uploadedImages.length > 0" icon="rank" type="primary" plain @click="enterMoveMode">进入移动模式</el-button>
              <UploadImage
                ref="uploadRef"
                :show-file-list="false"
                :limit="props.limit"
                :fileSize="props.fileSize"
                :data="form"
                listType="text"
                @success="handleUploadSuccess">
                <template #icon>
                  <el-button icon="upload" type="primary">上传 </el-button>
                </template>
              </UploadImage>
            </template>
            <template v-else>
              <el-button plain @click="selectAllCurrentPage">本页全选</el-button>
              <el-button plain @click="clearMoveSelection">清空已选</el-button>
              <el-cascader
                v-model="moveGroupId"
                :options="moveGroupOptions"
                :props="{ checkStrictly: true, value: 'groupId', label: 'groupName', emitPath: false }"
                class="move-cascader"
                clearable
                placeholder="选择目标分类" />
              <el-button type="success" :loading="moving" :disabled="!selectedForMove.length || !moveGroupId" @click="handleMoveSelected">
                执行移动
              </el-button>
              <el-button icon="RemoveFilled" @click="exitMoveMode">退出移动</el-button>
            </template>
          </div>
        </div>

        <div class="img-wrap">
          <el-scrollbar :height="imageScrollHeight">
            <div v-loading="loading" class="image-list">
              <div
                v-for="(img, index) in uploadedImages"
                :key="img.id || img.accessUrl"
                class="image-item"
                :class="{ 'is-selected': isSelected(img.accessUrl) }"
                @click="toggleSelect(img)"
                @dblclick="handleItemDblClick(img)">
                <el-image :class="{ selected: isSelected(img.accessUrl) }" :src="img.accessUrl" fit="contain" loading="lazy">
                  <template #error>
                    <div class="image-error">加载失败</div>
                  </template>
                </el-image>

                <div class="hover-actions">
                  <div class="action-row" @click.stop @dblclick.stop>
                    <el-tooltip content="查看" placement="top">
                      <el-icon class="action-icon" @click="handleViewImage(index)">
                        <Search />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="重命名" placement="top">
                      <el-icon class="action-icon" @click="handleRenameImage(img)">
                        <EditPen />
                      </el-icon>
                    </el-tooltip>
                    <el-tooltip content="删除" placement="top">
                      <el-icon class="action-icon danger" @click="handleDeleteImage(img)">
                        <Delete />
                      </el-icon>
                    </el-tooltip>
                  </div>
                </div>
                <div class="image-meta" @click.stop @dblclick.stop>
                  <el-checkbox :model-value="isSelected(img.accessUrl)" @change="() => toggleSelect(img)">
                    <span class="name">
                      <el-tooltip placement="top">
                        <template #content>
                          图片大小：{{ img.fileSize }}
                          <br />
                          扩展名：{{ img.fileExt }}
                          <br />
                          原图片名：{{ img.realName }}
                        </template>
                        {{ img.realName }}
                      </el-tooltip>
                    </span>
                  </el-checkbox>
                </div>
              </div>
              <el-empty v-if="!loading && uploadedImages.length === 0" :description="emptyDescription" />
            </div>
          </el-scrollbar>
        </div>

        <div class="selected-strip">
          <span class="strip-label">{{ isMoveMode ? '待移动' : '已选' }}</span>
          <div v-if="currentSelectedUrls.length" class="strip-list">
            <div v-for="url in currentSelectedUrls" :key="url" class="strip-item">
              <el-image :src="url" fit="contain" />
              <el-icon class="strip-remove" @click.stop="removeFromCurrentSelection(url)">
                <Close />
              </el-icon>
            </div>
          </div>
          <span v-else class="strip-empty">{{ isMoveMode ? '点击图片加入待移动' : '点击图片加入已选' }}</span>
        </div>
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          layout="total, prev, pager, next"
          :total="total"
          @pagination="getList" />

        <el-image-viewer
          v-if="showDialogPreview"
          :hide-on-click-modal="true"
          :url-list="uploadedPreviewList"
          :initial-index="previewIndex"
          @close="showDialogPreview = false" />
        <el-image-viewer
          v-if="showHistoryPreview"
          :hide-on-click-modal="true"
          :url-list="recentUsedImages"
          :initial-index="historyPreviewIndex"
          @close="showHistoryPreview = false" />
      </div>
    </el-row>

    <el-dialog v-model="renameDialogVisible" title="重命名图片" width="420px" append-to-body>
      <el-input v-model="renameForm.name" placeholder="请输入图片名称" maxlength="120" show-word-limit @keyup.enter="submitRename">
        <template v-if="renameForm.ext" #append>.{{ renameForm.ext }}</template>
      </el-input>
      <template #footer>
        <el-button @click="renameDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="renaming" @click="submitRename">确定</el-button>
      </template>
    </el-dialog>

    <template #footer>
      <el-button text @click="visible = false">取消</el-button>
      <el-button type="primary" @click="confirmSelection">确认</el-button>
    </template>
  </el-dialog>

  <fileGroupForm ref="fileGroupRef" @success="handleQueryFileGroupTree"></fileGroupForm>
</template>

<script setup>
import { Close, Delete, EditPen, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { debounce } from '@/utils'
import fileGroupForm from '@/views/components/form/fileGroupForm.vue'
import { useImageHistory } from '../composables/useImageHistory'
import { useImageLibrary } from '../composables/useImageLibrary'
import { joinFileName, splitFileName } from '../utils/fileName'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialSelection: {
    type: Array,
    default: () => []
  },
  openKey: {
    type: Number,
    required: true
  },
  limit: {
    type: Number,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['confirm', 'update:modelValue'])
const { proxy } = getCurrentInstance()

const {
  categories,
  deleteFile,
  findImageById,
  form,
  getList,
  loadCategories,
  loading,
  moveFiles,
  moveGroupOptions,
  queryParams,
  resetForOpen,
  search,
  selectCategory,
  total,
  updateFileName,
  uploadedImages
} = useImageLibrary()
const { clearHistory, loadSelectionHistory, recentUsedImages, removeFromHistory, saveSelectionHistory } = useImageHistory()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
const selectedImagesTemp = ref([])
const selectedForMove = ref([])
const selectedMoveIds = ref({})
const moving = ref(false)
const moveGroupId = ref(undefined)
const isMoveMode = ref(false)
const leftPanelTab = ref('category')
const renameDialogVisible = ref(false)
const renameForm = reactive({
  id: undefined,
  name: '',
  ext: ''
})
const renaming = ref(false)
const showDialogPreview = ref(false)
const previewIndex = ref(0)
const showHistoryPreview = ref(false)
const historyPreviewIndex = ref(0)
const isMobile = ref(window.innerWidth <= 768)
const fileGroupRef = ref()
const categoryTreeRef = ref()
const uploadRef = ref()

const selectedFileIds = computed(() => selectedForMove.value.map((url) => selectedMoveIds.value[url]).filter(Boolean))
const currentSelectedUrls = computed(() => (isMoveMode.value ? selectedForMove.value : selectedImagesTemp.value))
const uploadedPreviewList = computed(() => uploadedImages.value.map((image) => image.accessUrl))
const dialogWidth = computed(() => (isMobile.value ? '95%' : '960px'))
const categoryScrollHeight = computed(() => (isMobile.value ? '220px' : '400px'))
const imageScrollHeight = computed(() => (isMobile.value ? '48vh' : '360px'))
const emptyDescription = computed(() => (queryParams.realName ? '未找到匹配的文件' : '暂无图片'))
const debouncedSearch = debounce(search, 400)

const clearMoveSelection = () => {
  selectedForMove.value = []
  selectedMoveIds.value = {}
}

const isSelected = (url) => {
  return isMoveMode.value ? selectedForMove.value.includes(url) : selectedImagesTemp.value.includes(url)
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const pushToSelection = (url) => {
  if (!url) return false
  if (selectedImagesTemp.value.includes(url)) return false
  if (selectedImagesTemp.value.length >= props.limit) {
    selectedImagesTemp.value.shift()
  }
  selectedImagesTemp.value.push(url)
  return true
}

const initializeDialog = () => {
  selectedImagesTemp.value = [...props.initialSelection]
  clearMoveSelection()
  moveGroupId.value = undefined
  isMoveMode.value = false
  leftPanelTab.value = 'category'
  resetForOpen()
  getList()
  handleQueryFileGroupTree()
  loadSelectionHistory()
}

const handleQueryFileGroupTree = async () => {
  await loadCategories()
  nextTick(() => {
    categoryTreeRef.value?.setCurrentKey(queryParams.categoryId ?? 0)
  })
}

const handleAddGroup = () => {
  fileGroupRef.value?.handleAdd()
}

const handleCategoryClick = (node) => {
  selectCategory(node)
}

const handleSearch = () => {
  search()
}

const addToSelection = (url) => {
  if (isMoveMode.value) {
    ElMessage.info('请先退出移动模式再选择图片')
    return
  }
  if (selectedImagesTemp.value.includes(url)) {
    ElMessage.info('该图片已在选择中')
    return
  }
  pushToSelection(url)
  ElMessage.success('已添加到选择')
}

const removeFromCurrentSelection = (url) => {
  if (isMoveMode.value) {
    selectedForMove.value = selectedForMove.value.filter((item) => item !== url)
    if (selectedMoveIds.value[url]) {
      const next = { ...selectedMoveIds.value }
      delete next[url]
      selectedMoveIds.value = next
    }
    return
  }
  selectedImagesTemp.value = selectedImagesTemp.value.filter((item) => item !== url)
}

const handleRemoveFromHistory = (url) => {
  if (removeFromHistory(url)) {
    ElMessage.success('已从历史记录中移除')
  }
}

const clearAllHistory = () => {
  proxy.$modal
    .confirm('确定要清空所有历史使用图片吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      clearHistory()
      ElMessage.success('已清空所有历史记录')
    })
    .catch(() => {})
}

const handleDialogClosed = () => {
  showDialogPreview.value = false
  showHistoryPreview.value = false
  renameDialogVisible.value = false
  isMoveMode.value = false
  clearMoveSelection()
}

const handleUploadSuccess = (response) => {
  const files = Array.isArray(response) ? response : []
  files
    .map((file) => file.url || file.accessUrl)
    .filter(Boolean)
    .forEach((url) => pushToSelection(url))
  ElMessage.success('上传成功')
  queryParams.pageNum = 1
  getList()
  nextTick(() => {
    uploadRef.value?.clearFiles?.()
  })
}

const selectAllCurrentPage = () => {
  const nextIds = { ...selectedMoveIds.value }
  uploadedImages.value.forEach((image) => {
    if (!image.accessUrl) return
    if (!selectedForMove.value.includes(image.accessUrl)) {
      selectedForMove.value.push(image.accessUrl)
    }
    if (image.id) {
      nextIds[image.accessUrl] = image.id
    }
  })
  selectedMoveIds.value = nextIds
}

const handleMoveSelected = async () => {
  if (selectedForMove.value.length === 0) {
    ElMessage.warning('请先选择要移动的图片')
    return
  }
  if (!moveGroupId.value) {
    ElMessage.warning('请选择目标分类')
    return
  }
  if (selectedFileIds.value.length === 0) {
    ElMessage.warning('所选图片缺少ID，无法移动')
    return
  }

  moving.value = true
  try {
    await moveFiles(moveGroupId.value, selectedFileIds.value)
    ElMessage.success(`已移动 ${selectedFileIds.value.length} 张图片`)
    clearMoveSelection()
    moveGroupId.value = undefined
    isMoveMode.value = false
    getList()
  } finally {
    moving.value = false
  }
}

const handleViewImage = (index) => {
  previewIndex.value = index
  showDialogPreview.value = true
}

const handleViewHistory = (index) => {
  historyPreviewIndex.value = index
  showHistoryPreview.value = true
}

const handleDeleteImage = (image) => {
  proxy.$modal
    .confirm(`确定删除图片“${image.realName || image.accessUrl}”吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      if (!image.id) {
        ElMessage.warning('该图片缺少ID，无法删除')
        return
      }
      await deleteFile(image.id)
      selectedImagesTemp.value = selectedImagesTemp.value.filter((item) => item !== image.accessUrl)
      selectedForMove.value = selectedForMove.value.filter((item) => item !== image.accessUrl)
      if (selectedMoveIds.value[image.accessUrl]) {
        const next = { ...selectedMoveIds.value }
        delete next[image.accessUrl]
        selectedMoveIds.value = next
      }
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}

const handleRenameImage = (image) => {
  const { name, ext } = splitFileName(image.realName, image.fileExt)
  renameForm.id = image.id
  renameForm.name = name
  renameForm.ext = ext
  renameDialogVisible.value = true
}

const submitRename = async () => {
  let name = String(renameForm.name || '').trim()
  if (renameForm.ext && name.toLowerCase().endsWith(`.${renameForm.ext.toLowerCase()}`)) {
    name = name.slice(0, -(renameForm.ext.length + 1)).trim()
  }
  if (!name) {
    ElMessage.warning('请输入图片名称')
    return
  }
  const current = findImageById(renameForm.id)
  if (!current) {
    ElMessage.warning('未找到当前图片')
    return
  }

  const realName = joinFileName(name, renameForm.ext)
  renaming.value = true
  try {
    await updateFileName(current, realName)
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } finally {
    renaming.value = false
  }
}

const toggleSelect = (image) => {
  const url = typeof image === 'string' ? image : image?.accessUrl
  if (!url) return

  if (isMoveMode.value) {
    const index = selectedForMove.value.indexOf(url)
    if (index >= 0) {
      selectedForMove.value.splice(index, 1)
      const next = { ...selectedMoveIds.value }
      delete next[url]
      selectedMoveIds.value = next
    } else {
      selectedForMove.value.push(url)
      const id = typeof image === 'object' ? image.id : uploadedImages.value.find((item) => item.accessUrl === url)?.id
      if (id) {
        selectedMoveIds.value = { ...selectedMoveIds.value, [url]: id }
      }
    }
    return
  }

  const index = selectedImagesTemp.value.indexOf(url)
  if (index >= 0) {
    selectedImagesTemp.value.splice(index, 1)
  } else {
    pushToSelection(url)
  }
}

const handleItemDblClick = (image) => {
  if (isMoveMode.value || props.limit !== 1) return
  const url = image?.accessUrl
  if (!url) return
  selectedImagesTemp.value = [url]
  confirmSelection()
}

const enterMoveMode = () => {
  isMoveMode.value = true
  clearMoveSelection()
}

const exitMoveMode = () => {
  isMoveMode.value = false
  clearMoveSelection()
  moveGroupId.value = undefined
}

const confirmSelection = () => {
  const urls = [...selectedImagesTemp.value]

  if (urls.length > props.limit) {
    ElMessage.warning(`最多只能选择 ${props.limit} 张图片`)
    return
  }

  emit('confirm', urls)
  if (urls.length > 0) {
    saveSelectionHistory(urls)
  }
  visible.value = false
}

watch(
  () => props.openKey,
  () => {
    initializeDialog()
  },
  { immediate: true }
)

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
})
</script>

<style scoped lang="scss">
.dialog-wrap {
  display: flex;

  .left {
    position: relative;
    width: 190px;
  }

  .left::after {
    position: absolute;
    width: 0.1rem;
    background-color: #ccc;
    height: 100%;
  }

  .right {
    flex: 1;
    margin-left: 10px;
    min-width: 0;
  }
}

.history-panel {
  display: flex;
  flex-direction: column;

  .history-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0 12px;
    border-bottom: 1px solid #eee;

    .history-count {
      font-size: 12px;
      color: #909399;
    }
  }

  .recent-images-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px;

    .empty-state {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #909399;
      font-size: 14px;
    }

    .recent-image-item {
      position: relative;
      border-radius: 4px;
      border: 1px solid #eee;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

        .item-actions {
          opacity: 1;
        }
      }

      .item-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        gap: 4px;
        justify-content: center;
        padding: 4px;
        background: rgba(0, 0, 0, 0.6);
        opacity: 0;
        transition: opacity 0.2s;

        .action-icon {
          cursor: pointer;
          color: white;
          font-size: 16px;
          transition: color 0.2s;

          &:hover {
            color: #409eff;
          }

          &.delete:hover {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

.image-list {
  display: grid;
  grid-template-columns: repeat(5, 130px);
  gap: 10px;
  min-height: 160px;

  :deep(.el-empty) {
    grid-column: 1 / -1;
  }
}

.image-item {
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  .image-meta {
    display: flex;
    align-items: center;
    width: 100%;

    .name {
      max-width: 100px;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      font-size: 13px;
      text-align: left;
      word-break: break-all;
    }
  }

  .hover-actions {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 90px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding: 8px 0 6px;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;

    .action-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      pointer-events: auto;
    }

    .action-icon {
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      pointer-events: auto;

      &:hover {
        color: #67c23a;
      }

      &.danger:hover {
        color: #f56c6c;
      }
    }
  }

  .el-image {
    border-radius: 5px;
    margin-bottom: 5px;
    height: 90px;
    background: #f8f8f8;
    width: 100%;
    border: 1px solid transparent;
    position: relative;

    &.selected {
      border-color: #409eff;
    }

    &.selected::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      font-weight: bold;
    }
  }

  .image-error {
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #909399;
    font-size: 12px;
    background: #f5f7fa;
  }

  &:hover {
    .hover-actions {
      opacity: 1;
    }
  }
}

.image-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  align-items: center;
  flex-wrap: wrap;

  .selected-count {
    white-space: nowrap;
    line-height: 32px;
    display: flex;
    align-items: center;
    gap: 8px;

    .move-mode-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }

  .search-input {
    width: 180px;
    flex: 0 0 auto;
  }

  .image-top-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-left: auto;
  }

  .move-cascader {
    width: 180px;
  }
}

.selected-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 4px;
  min-height: 52px;

  .strip-label {
    flex-shrink: 0;
    font-size: 12px;
    color: #909399;
  }

  .strip-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .strip-item {
    position: relative;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
    background: #f8f8f8;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .strip-remove {
      position: absolute;
      top: 0;
      right: 0;
      width: 16px;
      height: 16px;
      font-size: 12px;
      color: #fff;
      background: rgba(0, 0, 0, 0.55);
      cursor: pointer;
    }
  }

  .strip-empty {
    font-size: 12px;
    color: #c0c4cc;
  }
}

@media (max-width: 768px) {
  .dialog-wrap {
    flex-direction: column;
    gap: 10px;

    .left {
      width: 100%;
      display: none;
    }

    .right {
      margin-left: 0;
      width: 100%;
    }
  }

  .image-top {
    flex-direction: column;
    align-items: stretch;

    .selected-count {
      line-height: 1.6;
    }

    .search-input {
      width: 100%;
    }

    .image-top-actions {
      justify-content: flex-start;
      margin-left: 0;
    }

    .move-cascader {
      width: 100%;
      min-width: 0;
    }
  }

  .image-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .image-item {
    .el-image {
      height: 110px;
      margin-bottom: 0;
    }

    .hover-actions {
      position: static;
      height: auto;
      opacity: 1;
      pointer-events: auto;
      background: #f5f7fa;
      border: 1px solid #ebeef5;
      margin-top: 4px;
      padding: 6px 4px;

      .action-icon {
        color: #409eff;

        &.danger {
          color: #f56c6c;
        }
      }
    }

    .image-meta {
      .name {
        color: #303133;
      }
    }
  }
}
</style>
