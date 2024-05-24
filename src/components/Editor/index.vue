<template>
  <div style="border: 1px solid #ccc" v-if="show">
    <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig" :mode="mode" />
    <Editor
      style="height: 300px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="handleChange" />
  </div>
</template>
<script setup>
import '@wangeditor/editor/dist/css/style.css' // 引入 css

import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
const editorRef = shallowRef()
const emit = defineEmits()
const props = defineProps({
  placeholder: {
    type: String,
    default: () => '请输入内容...'
  },
  // 工具栏
  toolbarConfig: {
    type: [Object],
    default: () => {}
  },
  modelValue: [Object, String]
})
const mode = ref('default')
const show = ref(false)
const valueHtml = ref('')
const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_APP_BASE_API + '/common/UploadFile',
      // form-data fieldName ，默认值 'wangeditor-uploaded-image'
      fieldName: 'file',
      // 单个文件的最大体积限制，默认为 2M
      maxFileSize: 1 * 1024 * 1024, // 1M
      // 最多可上传几个文件，默认为 100
      maxNumberOfFiles: 10,
      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['image/*'],
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,
      // 自定义增加 http  header
      headers: {
        Authorization: 'Bearer ' + getToken(),
        userid: useUserStore().userId
      },
      // 跨域是否传递 cookie ，默认为 false
      withCredentials: true,
      // 超时时间，默认为 10 秒
      timeout: 5 * 1000, // 5 秒
      // 自定义插入图片
      customInsert(res, insertFn) {
        ;-(
          // 从 res 中找到 url alt href ，然后插图图片
          insertFn(res.data.url)
        )
      }
    },
    uploadVideo: {
      server: import.meta.env.VITE_APP_BASE_API + '/common/UploadFile',
      // form-data fieldName ，默认值 'wangeditor-uploaded-video'
      fieldName: 'file',
      // 单个文件的最大体积限制，默认为 10M
      maxFileSize: 5 * 1024 * 1024, // 5M
      // 最多可上传几个文件，默认为 5
      maxNumberOfFiles: 3,
      // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
      allowedFileTypes: ['video/*'],
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,
      // 自定义增加 http  header
      headers: {
        Authorization: 'Bearer ' + getToken(),
        userid: useUserStore().userId
      },
      // 跨域是否传递 cookie ，默认为 false
      withCredentials: true,
      // 超时时间，默认为 30 秒
      timeout: 15 * 1000, // 15 秒
      // 自定义插入视频
      customInsert(res, insertFn) {
        ;-(
          // 从 res 中找到 url alt href ，然后插图图片
          insertFn(res.data.url)
        )
      }
    }
  },
  placeholder: props.placeholder
}

onBeforeUnmount(() => {
  console.log('editor销毁')
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
const handleCreated = (editor) => {
  editorRef.value = editor
}
const handleChange = (editor) => {
  emit('update:modelValue', editor.getHtml())
}
watch(
  () => props.modelValue,
  (value) => {
    show.value = true
    const editor = editorRef.value
    if (value == undefined) {
      editor.clear()
      return
    }
    valueHtml.value = value
  }
)
onMounted(() => {
  show.value = true
  valueHtml.value = props.modelValue
})
</script>
