<template>
  <div>
    <div
      class="preview-images el-upload-list el-upload-list--picture-card"
      ref="previewContainer"
      :style="{
        '--preview-width': realWidth,
        '--preview-height': realHeight,
        '--el-upload-picture-card-size': realWidth,
        '--el-upload-list-picture-card-size': realWidth
      }">
      <div v-for="(img, index) in internalImages" :key="`${img}-${index}`" class="preview-item el-upload-list__item" @click="openDialog">
        <el-image :src="img" fit="contain" class="preview-thumb" />

        <div class="fun-wrap el-upload-list__item-actions" @click.stop>
          <el-tooltip content="更换" placement="top">
            <el-icon class="delete-icon" @click="openDialog">
              <RefreshRight />
            </el-icon>
          </el-tooltip>
          <el-tooltip content="查看" placement="top">
            <el-icon class="delete-icon" @click="handlePreview(index)">
              <Search />
            </el-icon>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-icon class="delete-icon" @click="removeImage(img)">
              <Delete />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
      <el-image-viewer
        v-if="showPreview"
        :hide-on-click-modal="true"
        :url-list="internalImages"
        :initial-index="previewStartIndex"
        @close="showPreview = false" />
      <div class="img-upload" v-if="limit > internalImages.length" @click="openDialog">
        <svg-icon name="upload"></svg-icon>
      </div>
    </div>

    <!-- 弹窗 -->
    <el-dialog v-model="dialogVisible" draggable append-to-body title="选择资源" :width="dialogWidth" @closed="handleDialogClosed">
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
                  @node-click="handleCategoryClick"
                  class="category-tree">
                  <template #default="{ node, data }">
                    <span class="custom-tree-node">
                      <span>
                        <svg-icon name="index" v-if="data.children && data.children.length > 0"></svg-icon>
                        {{ node.label }}
                      </span>
                    </span>
                  </template>
                </el-tree>
              </el-scrollbar>
              <div class="mt-2">
                <el-button text @click="handleAddGroup" v-hasPermi="['filegroup:add']">添加分类</el-button>
                <el-button text icon="refresh" @click="handleQueryFileGroupTree">刷新</el-button>
              </div>
            </el-tab-pane>
            <el-tab-pane label="历史记录" name="history">
              <div class="history-panel">
                <div class="history-top">
                  <span class="history-count">最近使用 {{ recentUsedImages.length }} 张</span>
                  <el-button text type="danger" size="small" @click="clearAllHistory" v-if="recentUsedImages.length > 0">清空</el-button>
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
                          <el-icon class="action-icon delete" @click="removeFromHistory(img)">
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
                <el-button icon="rank" type="primary" plain @click="enterMoveMode" v-if="uploadedImages.length > 0">进入移动模式</el-button>
                <UploadImage
                  ref="uploadRef"
                  :show-file-list="false"
                  :limit="props.limit"
                  :fileSize="props.fileSize"
                  :data="form"
                  @success="handleUploadSuccess"
                  listType="text">
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
              <div class="image-list" v-loading="loading">
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
            <div class="strip-list" v-if="currentSelectedUrls.length">
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
            layout="total, prev, pager, next"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
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
        <el-button text @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确认</el-button>
      </template>
    </el-dialog>

    <!-- 添加或修改文件分组对话框 -->
    <fileGroupForm ref="fileGroupRef" @success="handleQueryFileGroupTree()"></fileGroupForm>
  </div>
</template>

<script setup>
import { listSysfileByGroup, moveFileGroup, delSysfile, updateSysfile } from '@/api/tool/file'
import { treelistFileGroup } from '@/api/tool/filegroup.js'
import { debounce } from '@/utils'
import { ElMessage } from 'element-plus'
import Sortable from 'sortablejs'
import { Delete, Search, EditPen, Close, RefreshRight } from '@element-plus/icons-vue'
import fileGroupForm from '@/views/components/form/fileGroupForm.vue'

const HISTORY_STORAGE_KEY = 'imageSelectorHistory'
const HISTORY_MAX_COUNT = 20

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: [String, Array],
    default: () => []
  },
  limit: {
    type: Number,
    default: 1
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5
  },
  width: {
    type: [Number, String],
    default: '80px'
  },
  height: {
    type: [Number, String],
    default: '80px'
  }
})
const queryParams = reactive({
  pageNum: 1,
  pageSize: 15,
  categoryId: undefined,
  realName: ''
})
const emit = defineEmits(['update:modelValue'])

const normalizeImages = (val) => {
  if (!val || val === '') return []
  return Array.isArray(val) ? [...val].filter(Boolean) : String(val).split(',').filter(Boolean)
}

const internalImages = ref(normalizeImages(props.modelValue))

watch(
  () => props.modelValue,
  (val) => {
    const next = normalizeImages(val)
    const current = internalImages.value
    if (next.length === current.length && next.every((item, index) => item === current[index])) return
    internalImages.value = next
  }
)
const realWidth = computed(() => (typeof props.width == 'string' ? props.width : `${props.width}px`))
const realHeight = computed(() => (typeof props.height == 'string' ? props.height : `${props.height}px`))
const form = reactive({
  categoryId: 0
})
const total = ref(0)
const dialogVisible = ref(false)
const selectedImagesTemp = ref([])
const selectedForMove = ref([])
const selectedMoveIds = ref({})
const uploadedImages = ref([])
const loading = ref(false)
const moving = ref(false)
const moveGroupId = ref(undefined)
const isMoveMode = ref(false)
const leftPanelTab = ref('category')
const recentUsedImages = ref([])
const renameDialogVisible = ref(false)
const renameForm = reactive({
  id: undefined,
  name: '',
  ext: ''
})
const renaming = ref(false)
const showDialogPreview = ref(false)
const previewIndex = ref(0)
const previewStartIndex = ref(0)
const showHistoryPreview = ref(false)
const historyPreviewIndex = ref(0)
const isMobile = ref(false)

const categories = ref([])
const fileGroupRef = ref()
const categoryTreeRef = ref()
const uploadRef = ref()
const moveGroupOptions = computed(() => categories.value.filter((item) => item.groupId !== 0))
const selectedFileIds = computed(() => selectedForMove.value.map((url) => selectedMoveIds.value[url]).filter(Boolean))
const currentSelectedUrls = computed(() => (isMoveMode.value ? selectedForMove.value : selectedImagesTemp.value))

const clearMoveSelection = () => {
  selectedForMove.value = []
  selectedMoveIds.value = {}
}
const uploadedPreviewList = computed(() => uploadedImages.value.map((x) => x.accessUrl))
const dialogWidth = computed(() => (isMobile.value ? '95%' : '960px'))
const categoryScrollHeight = computed(() => (isMobile.value ? '220px' : '400px'))
const imageScrollHeight = computed(() => (isMobile.value ? '48vh' : '360px'))
const emptyDescription = computed(() => (queryParams.realName ? '未找到匹配的文件' : '暂无图片'))

const isSelected = (url) => {
  return isMoveMode.value ? selectedForMove.value.includes(url) : selectedImagesTemp.value.includes(url)
}

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const parseHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.warn('读取历史记录失败:', error)
    return []
  }
}

const extractHistoryUrls = (history) => {
  const allImages = new Map()
  history.forEach((record) => {
    if (!Array.isArray(record?.urls)) return
    record.urls.forEach((url) => {
      if (url && !allImages.has(url)) {
        allImages.set(url, true)
      }
    })
  })
  return Array.from(allImages.keys())
}

/**
 * 查询分组
 */
const handleQueryFileGroupTree = () => {
  treelistFileGroup().then((res) => {
    categories.value = [
      {
        groupId: 0,
        groupName: '全部'
      },
      {
        groupId: -1,
        groupName: '未分类'
      },
      ...(res.data || [])
    ]
    nextTick(() => {
      categoryTreeRef.value?.setCurrentKey(queryParams.categoryId ?? 0)
    })
  })
}
const handleAddGroup = () => {
  fileGroupRef.value?.handleAdd()
}

const loadSelectionHistory = () => {
  recentUsedImages.value = extractHistoryUrls(parseHistory())
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

const removeFromHistory = (url) => {
  try {
    const history = parseHistory().map((record) => ({
      ...record,
      urls: record.urls ? record.urls.filter((u) => u !== url) : []
    }))
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    loadSelectionHistory()
    ElMessage.success('已从历史记录中移除')
  } catch (error) {
    console.warn('移除历史记录失败:', error)
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
      localStorage.removeItem(HISTORY_STORAGE_KEY)
      recentUsedImages.value = []
      ElMessage.success('已清空所有历史记录')
    })
    .catch(() => {})
}

const handleCategoryClick = (node) => {
  form.categoryId = node.groupId
  queryParams.categoryId = node.groupId
  queryParams.pageNum = 1
  getList()
}

const getList = async () => {
  loading.value = true
  try {
    const res = await listSysfileByGroup(queryParams)
    if (res.code === 200) {
      uploadedImages.value = res.data?.result || []
      total.value = res.data?.totalNum || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

const debouncedSearch = debounce(handleSearch, 400)

const openDialog = () => {
  dialogVisible.value = true
  selectedImagesTemp.value = [...internalImages.value]
  clearMoveSelection()
  moveGroupId.value = undefined
  isMoveMode.value = false
  leftPanelTab.value = 'category'
  queryParams.pageNum = 1
  queryParams.realName = ''
  getList()
  handleQueryFileGroupTree()
  loadSelectionHistory()
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
  uploadedImages.value.forEach((img) => {
    if (!img.accessUrl) return
    if (!selectedForMove.value.includes(img.accessUrl)) {
      selectedForMove.value.push(img.accessUrl)
    }
    if (img.id) {
      nextIds[img.accessUrl] = img.id
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
    await moveFileGroup({
      groupId: moveGroupId.value,
      ids: selectedFileIds.value
    })
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

const handleDeleteImage = (img) => {
  proxy.$modal
    .confirm(`确定删除图片“${img.realName || img.accessUrl}”吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(async () => {
      if (!img.id) {
        ElMessage.warning('该图片缺少ID，无法删除')
        return
      }
      await delSysfile(img.id)
      selectedImagesTemp.value = selectedImagesTemp.value.filter((x) => x !== img.accessUrl)
      selectedForMove.value = selectedForMove.value.filter((x) => x !== img.accessUrl)
      if (selectedMoveIds.value[img.accessUrl]) {
        const next = { ...selectedMoveIds.value }
        delete next[img.accessUrl]
        selectedMoveIds.value = next
      }
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}

const splitFileName = (realName, fileExt) => {
  const raw = String(realName || '').trim()
  const ext = String(fileExt || '')
    .replace(/^\./, '')
    .trim()
  if (ext && raw.toLowerCase().endsWith(`.${ext.toLowerCase()}`)) {
    return { name: raw.slice(0, -(ext.length + 1)), ext }
  }
  const lastDot = raw.lastIndexOf('.')
  if (lastDot > 0) {
    return { name: raw.slice(0, lastDot), ext: ext || raw.slice(lastDot + 1) }
  }
  return { name: raw, ext }
}

const joinFileName = (name, ext) => {
  const stem = String(name || '').trim()
  if (!stem) return ''
  return ext ? `${stem}.${ext}` : stem
}

const handleRenameImage = (img) => {
  const { name, ext } = splitFileName(img.realName, img.fileExt)
  renameForm.id = img.id
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
  const current = uploadedImages.value.find((x) => x.id === renameForm.id)
  if (!current) {
    ElMessage.warning('未找到当前图片')
    return
  }

  const realName = joinFileName(name, renameForm.ext)
  renaming.value = true
  try {
    await updateSysfile({ ...current, realName })
    current.realName = realName
    ElMessage.success('重命名成功')
    renameDialogVisible.value = false
  } finally {
    renaming.value = false
  }
}

const toggleSelect = (img) => {
  const url = typeof img === 'string' ? img : img?.accessUrl
  if (!url) return

  if (isMoveMode.value) {
    const idx = selectedForMove.value.indexOf(url)
    if (idx >= 0) {
      selectedForMove.value.splice(idx, 1)
      const next = { ...selectedMoveIds.value }
      delete next[url]
      selectedMoveIds.value = next
    } else {
      selectedForMove.value.push(url)
      const id = typeof img === 'object' ? img.id : uploadedImages.value.find((x) => x.accessUrl === url)?.id
      if (id) {
        selectedMoveIds.value = { ...selectedMoveIds.value, [url]: id }
      }
    }
  } else {
    const idx = selectedImagesTemp.value.indexOf(url)
    if (idx >= 0) {
      selectedImagesTemp.value.splice(idx, 1)
    } else {
      pushToSelection(url)
    }
  }
}

const handleItemDblClick = (img) => {
  if (isMoveMode.value || props.limit !== 1) return
  const url = img?.accessUrl
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

const saveSelectionHistory = (urls) => {
  try {
    let history = parseHistory()
    history.unshift({
      timestamp: new Date().toISOString(),
      urls,
      count: urls.length
    })
    history = history.slice(0, HISTORY_MAX_COUNT)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
    recentUsedImages.value = extractHistoryUrls(history)
  } catch (error) {
    console.warn('保存选择历史记录失败:', error)
  }
}

const confirmSelection = () => {
  const urls = [...selectedImagesTemp.value]

  if (urls.length > props.limit) {
    ElMessage.warning(`最多只能选择 ${props.limit} 张图片`)
    return
  }
  internalImages.value = urls
  emit('update:modelValue', urls.join(','))

  if (urls.length > 0) {
    saveSelectionHistory(urls)
  }

  dialogVisible.value = false
  nextTick(() => initSortable())
}

// 供外部按钮打开素材库（例如富文本编辑器「从素材库插入图片」）
defineExpose({ openDialog })

const removeImage = (url) => {
  const newList = internalImages.value.filter((item) => item !== url)
  internalImages.value = newList
  emit('update:modelValue', newList.join(','))
}
const showPreview = ref(false)
function handlePreview(index = 0) {
  previewStartIndex.value = index
  showPreview.value = true
}

let sortableInstance = null
const previewContainer = ref(null)
const initSortable = () => {
  if (!previewContainer.value) return
  if (sortableInstance) sortableInstance.destroy()
  sortableInstance = Sortable.create(previewContainer.value, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    draggable: '.preview-item',
    chosenClass: 'sortable-chosen',
    filter: '.img-upload',
    onEnd(evt) {
      const newList = [...internalImages.value]
      const moved = newList.splice(evt.oldIndex, 1)[0]
      newList.splice(evt.newIndex, 0, moved)
      internalImages.value = newList
      emit('update:modelValue', newList.join(','))
    }
  })
}

onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
  initSortable()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateIsMobile)
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})
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
    padding: 8px 0 12px 0;
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
