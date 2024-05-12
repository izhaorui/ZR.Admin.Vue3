<template>
  <div class="app-container">
    <el-form :model="form" ref="formRef" :rules="rules" @submit.prevent>
      <el-row class="mb10">
        <el-col :lg="24">
          <el-form-item label="" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item prop="content" label="">
            <el-input type="textarea" rows="10" placeholder="说点什么吧" maxlength="500" show-word-limit v-model="form.content"></el-input>
          </el-form-item>
        </el-col>

        <el-col :lg="12">
          <el-form-item prop="categoryId" label="选择圈子">
            <el-select v-model="form.categoryId" clearable>
              <el-option v-for="item in categoryOptions" :key="item.categoryId" :label="item.name" :value="item.categoryId"> </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-form-item prop="topicId" label="选择话题">
            <el-radio-group v-model="form.topicId">
              <el-radio-button v-for="item in topicList" :key="item.topicId" :value="item.topicId">
                {{ item.topicName }}
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :lg="8">
          <el-form-item>
            <template #label>
              <span>
                <el-tooltip content="不公开只有自己会看到" placement="top">
                  <el-icon :size="15">
                    <questionFilled />
                  </el-icon>
                </el-tooltip>
                是否公开
              </span>
            </template>
            <el-switch v-model="form.isPublic" inline-prompt :active-value="1" :in-active-value="0" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>

        <el-col :lg="24">
          <el-form-item>
            <UploadImage ref="uploadRef" v-model="form.coverUrl" :limit="9" :fileSize="15" style="width: 90px">
              <template #icon>
                <el-icon class="avatar-uploader-icon"><plus /></el-icon>
              </template>
            </UploadImage>
          </el-form-item>
        </el-col>
        <el-col :lg="24">
          <el-button type="success" icon="upload" @click="handlePublish('1')">立即发布</el-button>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script setup name="articlepublish">
import { addArticle } from '@/api/article/article.js'
import { listArticleCategory } from '@/api/article/articlecategory.js'
import { listArticleTopic } from '@/api/article/articletopic'
const { proxy } = getCurrentInstance()

// 文章目录下拉框
const categoryOptions = ref([])

const formRef = ref()

const data = reactive({
  form: {
    title: undefined,
    cid: undefined,
    content: undefined,
    status: undefined,
    categoryId: undefined,
    isPublic: 1,
    articleType: 2,
    topicId: undefined,
    tags: ''
  },
  rules: {
    title: [{ required: false, message: '标题不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
  }
})
const { form, rules } = toRefs(data)

/** 查询菜单下拉树结构 */
function getCategoryTreeselect() {
  listArticleCategory({ categoryType: 1, pageSize: 100 }).then((res) => {
    if (res.code == 200) {
      categoryOptions.value = res.data.result
    }
  })
}
const topicList = ref([])
listArticleTopic().then((res) => {
  topicList.value = res.data.result
})
/** 提交按钮 */
function handlePublish(status) {
  form.value.status = status
  form.value.tags = topicList.value.find((x) => x.topicId == form.value.topicId)?.topicName

  proxy.$refs['formRef'].validate((valid) => {
    if (valid) {
      addArticle(form.value).then((res) => {
        if (res.code == 200) {
          proxy.$modal.msgSuccess('发布成功')
          proxy.$tab.closeOpenPage({ path: '/article/index' })
        } else {
          proxy.$modal.msgError('发布失败')
        }
      })
    }
  })
}

getCategoryTreeselect()
</script>
<style scoped>
.app-container {
  position: relative;
}
</style>
