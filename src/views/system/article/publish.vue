<template>
  <div class="app-container">
    <el-row :gutter="24">
      <!-- :model属性用于表单验证使用 比如下面的el-form-item 的 prop属性用于对表单值进行验证操作 -->
      <el-form :model="form" ref="form" label-width="100px" :rules="rules" @submit.prevent>
        <el-col :lg="12">
          <el-form-item label="文章标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入文章标题（必须）" />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="文章分类" prop="category_id">
            <!-- <treeselect v-model="form.category_id" :options="categoryOptions" :normalizer="normalizer" :show-count="true" /> -->
            <tree-select v-model:value="form.category_id" :options="categoryOptions"
              :objMap="{ value: 'category_id', label: 'name', children: 'children' }" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="文章标签">
            <el-tag size="large" :key="tag" v-for="tag in form.dynamicTags" closable :disable-transitions="false" @close="handleCloseTag(tag)">
              {{tag}}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputVisible" v-model="inputValue" ref="saveTagInput" size="small" @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ 文章标签</el-button>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item prop="content" label="文章内容">
            <!-- <mavon-editor v-model="form.content" ref=md /> -->
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item label="" style="text-align:right;">
            <el-button @click="handlePublish('1')">发布文章</el-button>
            <el-button type="success" @click="handlePublish('2')">存为草稿</el-button>
          </el-form-item>
        </el-col>

      </el-form>
    </el-row>
  </div>
</template>
<script setup name="articlepublish">
import {
  addArticle,
  updateArticle,
  listArticleCategoryTree,
  getArticle,
} from '@/api/system/article.js'
import { upload } from '@/api/common.js'
// import mavonEditor from 'mavon-editor'
// import 'mavon-editor/dist/css/index.css'

import { getCurrentInstance, reactive, toRefs, watch, nextTick } from 'vue-demi'
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance()
const route = useRoute()
// 文章目录下拉框
const categoryOptions = ref([])
// 提交按钮是否显示
const btnSubmitVisible = ref(true)
const inputVisible = ref(false)
const inputValue = ref('')
const html = ref('')

const data = reactive({
  form: {
    dynamicTags: [],
    fmt_type: 'markdown',
    tags: undefined,
    cid: undefined,
    content: undefined,
    status: undefined,
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }],
  },
})

const { form, rules } = toRefs(data)

const cid = route.query.cid
form.value.cid = cid

/** 查询菜单下拉树结构 */
function getCategoryTreeselect() {
  listArticleCategoryTree().then((res) => {
    if (res.code == 200) {
      categoryOptions.value = res.data
    }
  })
}

// 将图片上传到服务器，返回地址替换到md中
function $imgAdd(pos, $file) {
  var formdata = new FormData()
  formdata.append('file', $file)
  upload(formdata).then((res) => {
    console.log(JSON.stringify(res))
    proxy.$refs.md.$img2Url(pos, res.data.url)
  })
}

function change(value, render) {
  // render 为 markdown 解析后的结果
  html.value = render
}

/** 提交按钮 */
function handlePublish(status) {
  form.value.status = status
  form.value.tags = form.value.dynamicTags.toString()

  proxy.$refs['form'].validate((valid) => {
    if (valid) {
      if (form.value.cid != undefined) {
        updateArticle(form.value).then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess('修改文章成功')
            proxy.$tab.closeOpenPage({ path: '/tool/article/index' })
          } else {
            proxy.$modal.msgError('修改文章失败')
          }
        })
      } else {
        addArticle(form.value).then((res) => {
          if (res.code == 200) {
            proxy.$modal.msgSuccess('发布文章成功')
            proxy.$tab.closeOpenPage({ path: '/tool/article/index' })
          } else {
            proxy.$modal.msgError('发布文章失败')
          }
        })
      }
    }
  })
}
function handleCloseTag(tag) {
  form.value.dynamicTags.splice(form.value.dynamicTags.indexOf(tag), 1)
}

function showInput() {
  inputVisible.value = true
  proxy.nextTick((_) => {
    proxy.$refs.saveTagInput.$refs.input.focus()
  })
}
function handleInputConfirm() {
  let inputValue = form.value.inputValue.trim()

  if (
    inputValue &&
    inputValue.length > 0 &&
    form.value.dynamicTags.length < 4
  ) {
    form.value.dynamicTags.push(inputValue)
  }
  inputVisible.value = false
  inputValue.value = ''
}
getInfo(cid)
function handleTreeSelect() {}
function getInfo(cid) {
  if (!cid || cid == undefined) return
  getArticle(cid).then((res) => {
    if (res.code == 200) {
      var data = res.data
      form.value = {
        fmt_type: data.fmt_type,
        cid: parseInt(cid),
        title: data.title,
        content: data.content,
        category_id: data.category_id,
        dynamicTags:
          data.tags != null && data.tags.length > 0 ? data.tags.split(',') : [],
      }
    }
  })
}
getCategoryTreeselect()
</script>
<style scoped>
.el-tag + .el-tag {
  margin-right: 10px;
}
.el-tag {
  margin-right: 10px;
}
.button-new-tag {
  /* margin-left: 10px; */
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-right: 10px;
  vertical-align: bottom;
}
.el-col {
  border-radius: 4px;
  margin-bottom: 10px;
}
.vue-treeselect {
  z-index: 1501;
}
</style>
