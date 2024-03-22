<template>
  <div>
    <el-form v-model="form">
      <el-row :gutter="10">
        <el-col :lg="12">
          <el-input rows="15" v-model="form.beforeData" type="textarea" placeholder="请输入文本"></el-input>

          <el-button class="mt10" type="danger" @click="handleClearLeft()">清空</el-button>
        </el-col>

        <el-col :lg="12">
          <el-input rows="15" show-word-limit v-model="form.afterData" type="textarea" placeholder="请输入文本"></el-input>

          <el-button class="mt10" type="danger" @click="handleClearRight">清空</el-button>
        </el-col>
      </el-row>
      <el-row class="mt10">
        <el-col :lg="24">
          <el-button link type="primary" @click="resetText">重置文本(reset text)</el-button>

          <span>
            显示方式：
            <el-radio-group v-model="form.showtype">
              <el-radio value="line-by-line">line-by-line</el-radio>
              <el-radio value="side-by-side">side-by-side</el-radio>
            </el-radio-group>
          </span>
        </el-col>
      </el-row>
      <el-row>
        <el-col :lg="24" :gutter="5">
          <code-diff :old-string="form.beforeData" :new-string="form.afterData" language="json" :output-format="form.showtype" />
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
<script setup name="codecompare">
import { CodeDiff } from 'v-code-diff'
const form = reactive({
  beforeData: '',
  afterData: '',
  showtype: 'side-by-side'
})
function handleClearLeft() {
  form.beforeData = ''
}

function handleClearRight() {
  form.afterData = ''
}
function resetText() {
  handleClearLeft()
  handleClearRight()
}
</script>
