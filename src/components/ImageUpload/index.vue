<template>
  <div class="component-upload-image" :title="tipMsg" :style="{ '--upload-size': sizeVar }">
    <el-upload
      multiple
      v-bind="$attrs"
      :action="uploadImgUrl"
      :list-type="listType"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      name="file"
      :data="uploadData"
      :on-remove="handleRemove"
      :show-file-list="showFileList"
      :headers="headers"
      v-model:file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :auto-upload="autoUpload"
      :class="{ hide: fileList.length >= limit }"
      ref="imageUpload"
      @contextmenu.prevent="handleRightClick">
      <slot name="icon">
        <el-icon class="avatar-uploader-icon"><uploadFilled /></el-icon>
      </slot>
      <span v-if="loading">正在上传图片，请稍候...</span>

      <template v-slot:tip>
        <div class="el-upload__tip" v-if="showTip">
          <slot name="tip">
            <template v-if="fileSize">
              大小不超过 <b class="text-danger">{{ fileSize }}MB</b>
            </template>
            <template v-if="fileType">
              格式为 <b class="text-danger">{{ fileType.join('/') }}</b>
            </template>
          </slot>
        </div>
      </template>
    </el-upload>

    <el-dialog title="预览" v-model="dialogVisible" width="400px" append-to-body>
      <div class="mb10">
        <el-image style="display: block; max-width: 50%" :src="dialogImageUrl">
          <template #error>
            <div class="image-slot">加载失败</div>
          </template>
        </el-image>
      </div>

      <div class="mb10" v-if="dialogImageUrl">
        <a class="text-muted" style="font-size: 12px" :href="dialogImageUrl" target="_blank">{{ dialogImageUrl }}</a>
        <el-button text icon="document-copy" size="small" plain class="ml10" v-clipboard:success="copySuccess" v-clipboard:copy="dialogImageUrl">
          复制
        </el-button>
      </div>

      <el-row>
        <el-input type="text" clearable v-model="dialogImageUrl">
          <template #append>
            <el-button type="danger" plain class="ml10" @click="handleReplace()">替换</el-button>
          </template>
        </el-input>
      </el-row>
    </el-dialog>

    <!-- 右键菜单 -->
    <el-dialog width="550px" draggable="" :show-close="false" :modal="false" v-model="showInput">
      <el-form-item
        label-width="70px"
        style="margin-bottom: 10px"
        v-for="(domain, index) in fileList"
        :key="domain.uid || domain.url || index"
        :label="'地址' + (index + 1)"
        :prop="'domains.' + index + '.value'">
        <el-input readonly v-model="domain.url">
          <template #append>
            <el-button icon="delete" @click="handleDelete(domain)"></el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label-width="70px" label="手动输入">
        <el-input v-model="inputUrl" placeholder="请输入地址" style="max-width: 400px">
          <template #append>
            <el-button icon="check" @click="handleAdd()"> </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="recentHistoryDisplay.length" label-width="70px" label="最近上传">
        <div class="history-grid">
          <div v-for="(url, historyIndex) in recentHistoryDisplay" :key="url + historyIndex" class="history-card">
            <el-image
              :src="url"
              fit="cover"
              class="history-thumb"
              :preview-src-list="recentHistoryDisplay"
              :initial-index="historyIndex"
              preview-teleported>
              <template #error>
                <div class="history-error">预览失败</div>
              </template>
            </el-image>
            <div class="history-actions">
              <el-button link type="primary" @click="handleSelectHistory(url)">使用此图</el-button>
            </div>
          </div>
        </div>
        <el-button link type="primary" class="history-clear" @click="clearRecentHistory">清空</el-button>
      </el-form-item>
    </el-dialog>
  </div>
</template>

<script setup>
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { dayjs } from 'element-plus'

const props = defineProps({
  modelValue: [String, Object, Array],
  // 图片数量限制
  limit: {
    type: Number,
    default: 1
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 10
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ['png', 'jpg', 'jpeg', 'webp', 'svga']
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: false
  },
  // 上传携带的参数
  data: {
    type: Object
  },
  // 缩略图尺寸（如 '60px'），控制 picture-card 方块大小。
  // 也可用 :style="{ width: '60px' }" 透传，二者等效。
  width: {
    type: String,
    default: '120px'
  },
  listType: {
    type: String,
    default: 'picture-card'
  },
  // 自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 显示文件列表
  showFileList: {
    type: Boolean,
    default: true
  },
  // 最近上传历史记录条数
  recentLimit: {
    type: Number,
    default: 8
  }
})

const HISTORY_STORAGE_KEY = 'zradmin:image-upload:recent-history'
const { proxy } = getCurrentInstance()
const emit = defineEmits()
const number = ref(0)
const uploadList = ref([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadImgUrl = ref(baseUrl + import.meta.env.VITE_APP_UPLOAD_URL) // 上传的图片服务器地址
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const fileList = ref([])
const recentHistory = ref([])
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))
const uploadData = computed(() => props.data)
const recentHistoryDisplay = computed(() => {
  const maxCount = Number.isFinite(props.recentLimit) ? Math.max(0, props.recentLimit) : 0
  return recentHistory.value.slice(-maxCount).reverse()
})
const attrs = useAttrs()
const sizeVar = computed(() => {
  // 优先取 :style 透传的 width，其次取 width prop，默认 100px
  return (attrs.style && attrs.style.width) || props.width || '120px'
})

const tipMsg = computed(() => {
  const sizeTip = props.fileSize ? `大小不超过 ${props.fileSize}MB` : ''
  const typeTip = props.fileType ? `格式为 ${props.fileType.join('/')}` : ''
  return `${sizeTip}${typeTip}`
})
const loading = ref(false)
watch(
  () => props.modelValue,
  (val) => {
    const list = Array.isArray(val) ? val : typeof val === 'string' ? val.split(',') : val ? [val] : []
    fileList.value = list.filter(Boolean).map((item, index) => {
      const file = typeof item === 'string' ? { name: item, url: item } : { ...item }
      file.name = file.name || file.url || '未命名图片'
      file.uid = file.uid || `${Date.now()}-${index}`
      file.status = file.status || 'success'
      return file
    })
  },
  { deep: true, immediate: true }
)

// 删除图片
function handleRemove(file) {
  fileList.value = fileList.value.filter((f) => f.url !== file.url)
  updateModelValue()
}

// 上传成功回调
function handleUploadSuccess(res) {
  if (res.code !== 200 || !res.data?.url) {
    proxy.$modal.msgError(`上传失败，原因:${res.msg}!`)
    number.value = Math.max(0, number.value - 1)
    completeUploadBatch()
    return
  }
  uploadList.value.push({ name: res.data.fileName || res.data.url, url: res.data.url, status: 'success' })
  number.value = Math.max(0, number.value - 1)
  completeUploadBatch()
}

function completeUploadBatch() {
  if (number.value === 0) {
    fileList.value = fileList.value.filter((f) => f.url !== undefined).concat(uploadList.value)
    pushRecentHistory(uploadList.value.map((item) => item.url))
    uploadList.value = []
    loading.value = false
    if (fileList.value.length) {
      emit('success', fileList.value)
      updateModelValue()
    }
  }
}

// 上传前loading加载
function handleBeforeUpload(file) {
  let isImg = false
  if (props.fileType.length) {
    let fileExtension = ''
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
    }
    isImg = props.fileType.some((type) => {
      const normalizedType = String(type).toLowerCase().replace(/^\./, '')
      return (
        fileExtension.toLowerCase() === normalizedType ||
        String(file.type || '')
          .toLowerCase()
          .includes(normalizedType)
      )
    })
  } else {
    isImg = file.type.indexOf('image') > -1
  }
  if (!isImg) {
    proxy.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join('/')}图片格式文件!`)
    return false
  }
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传头像图片大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  loading.value = true
  // proxy.$modal.loading('正在上传图片，请稍候...')
  number.value++
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

// 上传失败
function handleUploadError() {
  proxy.$modal.msgError('上传图片失败')
  number.value = Math.max(0, number.value - 1)
  completeUploadBatch()
}

// 预览
function handlePictureCardPreview(file) {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  return list
    .filter((item) => item.url !== undefined && !item.url.startsWith('blob:'))
    .map((item) => item.url)
    .join(separator)
}
function copySuccess() {
  proxy.$modal.msgSuccess('复制成功')
}
function handleReplace() {
  const nextUrl = normalizeUrl(dialogImageUrl.value)
  if (!nextUrl || !isHttp(nextUrl)) {
    proxy.$modal.msgError('请输入有效地址')
    return
  }
  fileList.value = [{ name: nextUrl, url: nextUrl, uid: dayjs().valueOf(), status: 'success' }]
  dialogImageUrl.value = nextUrl
  updateModelValue()

  dialogVisible.value = false
}
// 手动收入弹框
const showInput = ref(false)
watch(showInput, (visible) => {
  if (visible) {
    loadRecentHistory()
  }
})
function handleRightClick(event) {
  event.preventDefault() // 阻止默认右键行为
  showInput.value = true
}
const inputUrl = ref('')
function handleAdd(sourceUrl = inputUrl.value) {
  const currentUrl = normalizeUrl(sourceUrl)
  if (!currentUrl || !isHttp(currentUrl)) {
    proxy.$modal.msgError('请输入有效地址')
    return
  }
  if (fileList.value.some((x) => x.url === currentUrl)) {
    proxy.$modal.msgError('当前地址已存在')
    return
  }
  if (fileList.value.length >= props.limit) {
    handleExceed()
    return
  }
  fileList.value.push({
    name: currentUrl,
    url: currentUrl,
    uid: dayjs().valueOf(),
    status: 'success'
  })
  pushRecentHistory([currentUrl])
  updateModelValue()

  inputUrl.value = ''
}

function handleSelectHistory(url) {
  const currentUrl = normalizeUrl(url)
  if (!currentUrl || !isHttp(currentUrl)) {
    proxy.$modal.msgError('历史地址无效')
    return
  }
  if (fileList.value.some((x) => x.url === currentUrl)) {
    proxy.$modal.msgError('当前地址已存在')
    return
  }
  if (fileList.value.length >= props.limit) {
    handleExceed()
    return
  }
  fileList.value.push({
    name: currentUrl,
    url: currentUrl,
    uid: dayjs().valueOf(),
    status: 'success'
  })
  updateModelValue()
}

function handleDelete(item) {
  fileList.value = fileList.value.filter((x) => x.url !== item.url)

  updateModelValue()
}

function clearRecentHistory() {
  recentHistory.value = []
  saveRecentHistory()
}

function normalizeUrl(url) {
  return typeof url === 'string' ? url.trim() : ''
}

function pushRecentHistory(urls = []) {
  const maxCount = Number.isFinite(props.recentLimit) ? Math.max(0, props.recentLimit) : 0
  if (!maxCount) {
    return
  }
  urls
    .map((item) => normalizeUrl(item))
    .filter(Boolean)
    .forEach((url) => {
      const existsIndex = recentHistory.value.findIndex((item) => item === url)
      if (existsIndex >= 0) {
        recentHistory.value.splice(existsIndex, 1)
      }
      recentHistory.value.push(url)
      if (recentHistory.value.length > maxCount) {
        recentHistory.value.shift()
      }
    })
  saveRecentHistory()
}

function saveRecentHistory() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(recentHistory.value))
}

function loadRecentHistory() {
  try {
    const cache = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]')
    const maxCount = Number.isFinite(props.recentLimit) ? Math.max(0, props.recentLimit) : 0
    const historyList = Array.isArray(cache) ? cache.filter((item) => typeof item === 'string') : []
    recentHistory.value = maxCount ? historyList.slice(-maxCount) : []
  } catch (error) {
    recentHistory.value = []
  }
}

function updateModelValue() {
  emit('update:modelValue', listToString(fileList.value))
}

// 手动提交上传
function submitUpload() {
  proxy.$refs.imageUpload.submit()
}
// 清空文件
function clearFiles() {
  proxy.$refs.imageUpload.clearFiles()
}
defineExpose({
  submitUpload,
  clearFiles
})
</script>
<style>
.el-upload__tip {
  font-size: 8px;
  margin-top: 8px !important;
}
.component-upload-image {
  display: table;
  /* 缩略图尺寸：覆盖 Element Plus 在子元素上写死的 148px 默认值 */
  --upload-size: 120px;
}
.component-upload-image .el-upload--picture-card {
  --el-upload-picture-card-size: var(--upload-size);
  width: var(--upload-size);
  height: var(--upload-size);
}
.component-upload-image .el-upload-list--picture-card {
  --el-upload-list-picture-card-size: var(--upload-size);
}
.component-upload-image .el-upload-list--picture-card .el-upload-list__item {
  width: var(--upload-size);
  height: var(--upload-size);
}
.history-grid {
  margin-top: 10px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.history-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 6px;
  background: var(--el-fill-color-blank);
}
.history-thumb {
  width: 100%;
  height: 60px;
  border-radius: 4px;
  cursor: zoom-in;
  overflow: hidden;
}
.history-error {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  background: var(--el-fill-color-light);
}
.history-actions {
  margin-top: 4px;
  text-align: center;
}
.history-clear {
  padding: 0;
  margin-top: 8px;
}
</style>
