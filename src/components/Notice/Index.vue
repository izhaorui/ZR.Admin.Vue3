<template>
  <div>
    <el-popover placement="bottom" trigger="click" width="400px" popper-class="el-popover-pupop-user-news">
      <template #reference>
        <el-badge :is-dot="noticeDot" style="line-height: 18px">
          <el-icon><bell /></el-icon>
        </el-badge>
      </template>
      <div class="layout-navbars-breadcrumb-user-news">
        <el-tabs v-model="noticeType">
          <el-tab-pane name="0">
            <template #label>
              <el-badge :is-dot="newsDot" class="item"> 通知 </el-badge>
            </template>
            <div class="content-box">
              <div class="content-box-item" v-for="item in noticeList" @click="handleDetails(item)">
                <el-icon :size="30" color="#409EFF"><bell /></el-icon>
                <div class="content">
                  <div class="title">{{ item.noticeTitle }}</div>
                  <div class="content-box-time">{{ dayjs(item.create_time).format('YYYY-MM-DD') }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="私信" name="1"> <div class="content-box"></div></el-tab-pane>
        </el-tabs>

        <div class="foot-box" @click="onGoToGiteeClick" v-if="noticeList.length > 0">前往通知中心</div>
      </div>
    </el-popover>

    <el-dialog :title="info.noticeTitle" v-model="show" append-to-body>
      <div v-html="info.noticeContent"></div>
    </el-dialog>
  </div>
</template>

<script setup name="noticeIndex">
import useSocketStore from '@/store/modules/socket'
import { dayjs } from 'element-plus'
const { proxy } = getCurrentInstance()
const noticeType = ref('0')
// 小红点
const newsDot = ref(false)
const show = ref(false)
const noticeList = computed(() => {
  return useSocketStore().noticeList
})
const noticeDot = computed(() => {
  return useSocketStore().noticeDot
})
const info = ref({})
function handleDetails(item) {
  show.value = true
  info.value = item
}
// 全部已读点击
function onAllReadClick() {
  newsDot.value = false
  proxy.$modal.msg('请自行实现！！！')
}
// 前往通知中心点击
function onGoToGiteeClick() {
  window.open('https://gitee.com/izory/ZrAdminNetCore')
}
</script>

<style lang="scss" scoped>
.head-box {
  display: flex;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  color: #333333;
  justify-content: space-between;
  height: 35px;
  align-items: center;
  .head-box-btn {
    color: #1890ff;
    font-size: 13px;
    cursor: pointer;
    opacity: 0.8;
    &:hover {
      opacity: 1;
    }
  }
}
.content-box {
  font-size: 13px;
  min-height: 60px;
  max-height: 200px;
  overflow-y: scroll;

  .content-box-item {
    display: flex;
    margin-bottom: 20px;
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }

    &:last-of-type {
      padding-bottom: 12px;
    }
    .icon {
      width: 30px;
      height: 30px;
      margin: 2px 10px 0 0;
    }

    .content-box-time {
      margin-top: 3px;
    }
  }
  .content-box-empty {
    height: 260px;
    display: flex;
    .content-box-empty-margin {
      margin: auto;
      text-align: center;
      i {
        font-size: 60px;
      }
    }
  }
}
.foot-box {
  height: 35px;
  color: #1890ff;
  font-size: 13px;
  cursor: pointer;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #ebeef5;
  &:hover {
    opacity: 1;
  }
}
:deep(.el-empty__description p) {
  font-size: 13px;
}
.head-box-title {
  color: var(--base-color-white);
}
</style>
