<template>
  <div style="border: 1px solid #ccc">
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
<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
export default {
  components: { Editor, Toolbar },
  props: {
    placeholder: {
      type: String,
      default: () => '请输入内容'
    },
    modelValue: String,
    // 工具栏
    toolbarConfig: {
      type: [Object],
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const editorRef = shallowRef()
    const valueHtml = ref(props.modelValue)
    const editorConfig = {
      MENU_CONF: {},
      placeholder: props.placeholder
    }
    //上传图片
    editorConfig.MENU_CONF['uploadImage'] = {
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
    }
    //上传视频
    editorConfig.MENU_CONF['uploadVideo'] = {
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
    onBeforeUnmount(() => {
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
        const editor = editorRef.value
        if (value == undefined) {
          editor.clear()
          return
        }
        valueHtml.value = value
      }
    )
    return {
      editorRef,
      valueHtml,
      mode: 'default',
      editorConfig,
      handleCreated,
      handleChange,
      toolbarConfig: props.toolbarConfig
    }
  }
}
</script>
