<template>
  <div>
    <el-popover placement="bottom" trigger="hover" width="300px" popper-class="el-popover-pupop-user-news">
      <template #reference>
        <el-badge :is-dot="noticeDot" style="line-height: 18px">
          <el-icon><bell /></el-icon>
        </el-badge>
      </template>
      <div class="layout-navbars-breadcrumb-user-news">
        <div class="head-box">
          <div class="head-box-title">通知</div>
          <div class="head-box-btn" v-if="noticeList.length > 0" @click="onAllReadClick">全部已读</div>
        </div>
        <div class="content-box">
          <template v-if="noticeList.length > 0">
            <div class="content-box-item" v-for="(v, k) in noticeList" :key="k">
              <div>{{ v.noticeTitle }}</div>
              <div class="content-box-msg" v-html="v.noticeContent"></div>
              <div class="content-box-time">{{ v.updateTime }}</div>
            </div>
          </template>
          <div class="content-box-empty" v-else>
            <div class="content-box-empty-margin">
              <el-icon><Promotion /></el-icon>
              <div class="mt15">全部已读</div>
            </div>
          </div>
        </div>
        <div class="foot-box" @click="onGoToGiteeClick" v-if="noticeList.length > 0">前往通知中心</div>
      </div>
    </el-popover>
  </div>
</template>

<script setup name="noticeIndex">
import useSocketStore from '@/store/modules/socket'

const { proxy } = getCurrentInstance()

// 小红点
const newsDot = ref(false)

const noticeList = computed(() => {
  return useSocketStore().noticeList
})
const noticeDot = computed(() => {
  return useSocketStore().noticeDot
})
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

<style lang="scss">
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
  .content-box-item {
    padding-top: 12px;
    &:last-of-type {
      padding-bottom: 12px;
    }
    .content-box-msg {
      color: #999999;
      margin-top: 5px;
      margin-bottom: 5px;
    }
    .content-box-time {
      color: #999999;
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
