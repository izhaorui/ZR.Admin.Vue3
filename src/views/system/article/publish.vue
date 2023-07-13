<template>
  <div class="app-container">
    <el-row :gutter="24">
      <!-- :model属性用于表单验证使用 比如下面的el-form-item 的 prop属性用于对表单值进行验证操作 -->
      <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" @submit.prevent>
        <el-row :gutter="20">
          <el-col :lg="12">
            <el-form-item label="文章标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入文章标题（必须）" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="文章分类" prop="categoryId">
              <el-cascader
                class="w100"
                :options="categoryOptions"
                :props="{ checkStrictly: true, value: 'categoryId', label: 'name', emitPath: false }"
                placeholder="请选择文章分类"
                clearable
                v-model="form.categoryId" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="是否公开">
              <el-switch v-model="form.isPublic" inline-prompt :active-value="1" :in-active-value="0" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>

          <el-col :lg="12">
            <el-form-item label="文章标签">
              <el-tag v-for="tag in form.dynamicTags" :key="tag" class="mr10" closable :disable-transitions="false" @close="handleCloseTag(tag)">
                {{ tag }}
              </el-tag>
              <el-input v-if="inputVisible" ref="inputRef" v-model="inputValue" @keyup.enter="handleInputConfirm" @blur="handleInputConfirm" />

              <el-button v-else class="button-new-tag" size="small" icon="plus" text @click="showInput">文章标签</el-button>
            </el-form-item>
          </el-col>

          <el-form-item label="文章封面">
            <UploadImage ref="uploadRef" v-model="form.coverUrl" :limit="1" :fileSize="15" :drag="true" />
          </el-form-item>
          <el-form-item prop="content" label="文章内容">
            <MdEditor v-model="form.content" :onUploadImg="onUploadImg" />
          </el-form-item>

          <el-col :lg="24">
            <el-form-item style="text-align: right">
              <el-button type="success" @click="handlePublish('1')">发布文章</el-button>
              <el-button @click="handlePublish('2')">存为草稿</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-row>
  </div>
</template>
<script setup name="articlepublish">
import { addArticle, updateArticle, getArticle } from '@/api/article/article.js'
import { treelistArticleCategory } from '@/api/article/articlecategory.js'
import { upload } from '@/api/common.js'
import MdEditor from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const { proxy } = getCurrentInstance()
const route = useRoute()
// 文章目录下拉框
const categoryOptions = ref([])
const inputVisible = ref(false)
const inputValue = ref('')
const formRef = ref()
const inputRef = ref()
const data = reactive({
  form: {
    dynamicTags: [],
    fmtType: 'markdown',
    tags: undefined,
    cid: undefined,
    content: undefined,
    status: undefined,
    categoryId: undefined,
    isPublic: 1
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
  }
})

const { form, rules } = toRefs(data)

const cid = route.query.cid
form.value.cid = cid

/** 查询菜单下拉树结构 */
function getCategoryTreeselect() {
  treelistArticleCategory({}).then((res) => {
    if (res.code == 200) {
      categoryOptions.value = res.data
    }
  })
}

// 将图片上传到服务器，返回地址替换到md中
async function onUploadImg(files, callback) {
  const res = await Promise.all(
    Array.from(files).map((file) => {
      return new Promise((rev, rej) => {
        const form = new FormData()
        form.append('file', file)

        upload(form)
          .then((res) => rev(res))
          .catch((error) => rej(error))
      })
    })
  )

  callback(res.map((item) => item.data.url))
}

/** 提交按钮 */
function handlePublish(status) {
  form.value.status = status
  form.value.tags = form.value.dynamicTags.toString()

  proxy.$refs['formRef'].validate((valid) => {
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

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.input.focus()
  })
}
// 标签确认
function handleInputConfirm() {
  if (inputValue.value) {
    form.value.dynamicTags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
function getInfo(cid) {
  if (!cid || cid == undefined) return
  getArticle(cid).then((res) => {
    if (res.code == 200) {
      var data = res.data
      form.value = {
        ...data,
        dynamicTags: data.tags != null && data.tags.length > 0 ? data.tags.split(',') : []
      }
    }
  })
}
getInfo(cid)
getCategoryTreeselect()
</script>
<style scoped>
.button-new-tag {
  /* margin-left: 10px; */
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
  width: 90px;
  margin-right: 10px;
  vertical-align: bottom;
}

.vue-treeselect {
  z-index: 1501;
}
</style>
