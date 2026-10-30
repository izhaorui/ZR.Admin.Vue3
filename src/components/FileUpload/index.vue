<template>
  <div class="upload-file">
    <el-upload
      multiple
      :action="uploadFileUrl"
      :before-upload="handleBeforeUpload"
      v-model:file-list="fileList"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      :on-success="handleUploadSuccess"
      :show-file-list="false"
      :data="uploadData"
      :drag="drag"
      :headers="headers"
      :auto-upload="autoUpload"
      class="upload-file-uploader"
      ref="fileUpload"
      v-if="!disabled">
      <!-- 拖拽上传 -->
      <template v-if="drag">
        <el-icon class="el-icon--upload">
          <upload-filled />
        </el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </template>
      <!-- 上传按钮 -->
      <el-button type="primary" icon="upload" v-if="!drag">选取文件</el-button>
      <!-- 上传提示 -->
      <template v-slot:tip>
        <div class="el-upload__tip" v-if="showTip">
          <slot name="tip">
            <template v-if="fileSize">
              大小不超过 <b class="text-danger">{{ fileSize }}MB</b>
            </template>
            <template v-if="fileType && fileType.length > 0">
              格式为 <b class="text-danger">{{ fileType.join('/') }}</b>
            </template>
          </slot>
        </div>
      </template>
    </el-upload>
    <!-- 文件列表 -->
    <transition-group ref="fileListRef" class="upload-file-list el-upload-list el-upload-list--text" name="el-fade-in-linear" tag="ul">
      <li :key="file.uid" class="el-upload-list__item ele-upload-list__item-content" v-for="(file, index) in fileList">
        <el-link class="file-link" :href="file.url" underline="never" target="_blank">
          <span class="file-type-icon">{{ getFileExtension(file.name) }}</span>
          <span class="file-info">
            <el-text class="file-name" truncated>{{ file.name }}</el-text>
            <!-- <span class="file-url" v-if="file.url">{{ file.url }}</span> -->
          </span>
        </el-link>
        <div class="ele-upload-list__item-content-action" v-if="!disabled">
          <el-tooltip content="删除文件" placement="top">
            <el-button text type="danger" @click="handleDelete(index)">
              <el-icon><delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </li>
    </transition-group>
  </div>
</template>

<script setup>
import { getToken } from '@/utils/auth'

const props = defineProps({
  modelValue: [String, Object, Array],
  // 数量限制
  limit: {
    type: Number,
    default: 5
  },
  // 大小限制(MB)
  fileSize: {
    type: Number,
    default: 5
  },
  // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileType: {
    type: Array,
    default: () => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf']
  },
  // 是否显示提示
  isShowTip: {
    type: Boolean,
    default: true
  },
  // 是否拖拽
  drag: {
    type: Boolean,
    default: false
  },
  // 自动上传
  autoUpload: {
    type: Boolean,
    default: true
  },
  // 上传携带的参数
  data: {
    type: Object
  },
  // 上传前自定义处理
  beforeUpload: {
    type: Function,
    default: null
  },
  // 禁用组件（仅查看文件）
  disabled: {
    type: Boolean,
    default: false
  }
})

const { proxy } = getCurrentInstance()
const emit = defineEmits()
const number = ref(0)
const uploadList = ref([])
const fileListRef = ref()
const sortable = ref()
const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadFileUrl = ref(baseUrl + import.meta.env.VITE_APP_UPLOAD_URL) // 上传的图片服务器地址
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const fileList = ref([])
const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))
const uploadData = computed(() => props.data)

watch(
  () => props.modelValue,
  (val) => {
    const list = Array.isArray(val) ? val : typeof val === 'string' ? val.split(',') : val ? [val] : []
    fileList.value = list.filter(Boolean).map(normalizeFile)
  },
  { deep: true, immediate: true }
)

function normalizeFile(item) {
  if (typeof item === 'string') {
    return { name: getFileName(item), url: item, uid: `${Date.now()}-${Math.random()}` }
  }
  const file = { ...item }
  file.name = file.name || getFileName(file.url || '')
  file.uid = file.uid || `${Date.now()}-${Math.random()}`
  return file
}

// 上传前校检格式和大小
async function handleBeforeUpload(file) {
  // 校检文件类型
  if (props.fileType.length) {
    let fileExtension = ''
    if (file.name.lastIndexOf('.') > -1) {
      fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1)
    }
    const isTypeOk = props.fileType.some((type) => {
      const normalizedType = String(type).toLowerCase().replace(/^\./, '')
      return fileExtension.toLowerCase() === normalizedType || file.type.toLowerCase().includes(normalizedType)
    })
    if (!isTypeOk) {
      proxy.$modal.msgError(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`)
      return false
    }
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize
    if (!isLt) {
      proxy.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`)
      return false
    }
  }
  const processedFile = props.beforeUpload ? await props.beforeUpload(file) : file
  if (processedFile === false) return false
  proxy.$modal.loading('正在上传文件，请稍候...')
  number.value++
  return processedFile
}

// 文件个数超出
function handleExceed() {
  proxy.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`)
}

// 上传失败
function handleUploadError(err) {
  proxy.$modal.msgError('上传失败')
  number.value = Math.max(0, number.value - 1)
  completeUploadBatch()
}

// 上传成功回调
function handleUploadSuccess(response, uploadFile) {
  if (response.code !== 200 || !response.data?.url) {
    number.value = Math.max(0, number.value - 1)
    proxy.$modal.msgError(`上传失败，原因:${response.msg || '服务器未返回文件地址'}!`)
    completeUploadBatch()
    return
  }
  const { fileName, url, fileId } = response.data
  const tempFile = { name: fileName || getFileName(url), url, fileId, uid: `${Date.now()}-${Math.random()}` }
  uploadList.value.push(tempFile)
  completeUploadBatch()
}

function completeUploadBatch() {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.filter((file) => file.url !== undefined).concat(uploadList.value)
    uploadList.value = []
    number.value = 0
    updateModelValue()
    proxy.$modal.closeLoading()
  } else if (number.value === 0) {
    uploadList.value = []
    proxy.$modal.closeLoading()
  }
}

// 删除文件
function handleDelete(index) {
  fileList.value.splice(index, 1)
  updateModelValue()
}

// 获取文件名称
function getFileName(name) {
  const cleanName = String(name || '').split('?')[0]
  return decodeURIComponent(cleanName.slice(cleanName.lastIndexOf('/') + 1)) || '未命名文件'
}

function getFileExtension(name) {
  const fileName = getFileName(name)
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'FILE'
  return extension.toUpperCase().slice(0, 5)
}

function updateModelValue() {
  const value = listToString(fileList.value)
  emit('update:modelValue', value)
  emit('success', value)
}

// 对象转成指定字符串分隔
function listToString(list, separator) {
  let strs = ''
  separator = separator || ','

  list.forEach((element) => {
    if (element) {
      strs += element.url + separator
    }
  })
  return strs != '' ? strs.substr(0, strs.length - 1) : ''
}

// 手动提交上传
function submitUpload() {
  proxy.$refs.fileUpload.submit()
}
defineExpose({
  submitUpload
})
</script>

<style scoped lang="scss">
.upload-file-uploader {
  margin-bottom: 5px;
}
.upload-file-list .el-upload-list__item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  line-height: 1.4;
  margin-bottom: 5px;
  padding: 4px 2px;
  position: relative;
}
.upload-file-list .ele-upload-list__item-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}
.file-link {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
}
.file-type-icon {
  align-items: center;
  background: #ecf5ff;
  border-radius: 3px;
  color: #409eff;
  display: inline-flex;
  flex: 0 0 28px;
  font-size: 10px;
  font-weight: 600;
  height: 28px;
  justify-content: center;
  margin-right: 8px;
  overflow: hidden;
  padding: 0 3px;
}
.file-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}
.file-url {
  color: #909399;
  font-size: 12px;
  margin-top: 3px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ele-upload-list__item-content-action .el-link {
  margin-right: 10px;
}
.ele-upload-list__item-content-action .el-button {
  margin-left: 6px;
  padding: 4px;
}
.file-name {
  display: block;
  max-width: 100%;
}
</style>
