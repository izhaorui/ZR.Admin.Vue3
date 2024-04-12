<template>
  <div class="uploadData">
    <el-upload
      ref="uploadRef"
      :limit="1"
      name="file"
      accept=".xlsx,.xls"
      :data="uploadData"
      :headers="headers"
      :action="uploadFileUrl"
      :disabled="isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :on-error="handleFileError"
      :auto-upload="true">
      <el-button type="primary" icon="Upload">上传文件</el-button>

      <template #tip>
        <div class="el-upload__tip text-center">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" @click="importTemplate" icon="Bottom"> 下载模板 </el-link>
        </div>
      </template>
    </el-upload>
    <slot></slot>
  </div>
</template>
<script setup>
import { getToken } from '@/utils/auth'

const { proxy } = getCurrentInstance()
const emit = defineEmits()

const props = defineProps({
  importUrl: {
    type: String
  },
  templateUrl: {
    type: String
  },
  // 上传携带的参数
  data: {
    type: Object
  }
})

const baseUrl = import.meta.env.VITE_APP_BASE_API
const uploadFileUrl = ref(baseUrl + props.importUrl) // 上传数据url
const headers = ref({ Authorization: 'Bearer ' + getToken() })
const uploadData = computed(() => props.data)
const isUploading = ref(false)

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  isUploading.value = true
}
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  const { code, msg } = response

  isUploading.value = false
  proxy.$refs['uploadRef'].clearFiles()
  proxy.$refs['uploadRef'].handleRemove(file)

  if (code != 200) {
    proxy.$modal.msgError('导入数据失败,原因：' + msg)
  } else {
    emit('success', response)
  }
}
const handleFileError = function (error) {
  proxy.$modal.msgError('导入数据失败,原因：' + error)
}
function importTemplate() {
  proxy.downFile(props.templateUrl)
}
</script>
<style lang="scss" scoped>
.uploadData {
  padding: 10px;
}
</style>
