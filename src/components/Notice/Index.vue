<template>
  <div>
    <el-popover placement="bottom" trigger="click" width="400px" popper-class="el-popover-pupop-user-news">
      <template #reference>
        <el-badge :hidden="allDotNum <= 0" :value="allDotNum" style="line-height: 18px">
          <el-icon><bell /></el-icon>
        </el-badge>
      </template>
      <div class="layout-navbars-breadcrumb-user-news">
        <div class="read" @click="onAllReadClick">全部已读</div>
        <el-tabs v-model="noticeType">
          <el-tab-pane name="0">
            <template #label>
              <el-badge :hidden="newsDot <= 0" :value="newsDot" class="new-item"> 通知 </el-badge>
            </template>
            <div class="content-box">
              <div class="content-box-item" v-for="item in noticeList" @click="handleDetails(item, 0)">
                <div class="left">
                  <svg-icon name="gonggao" size="16"></svg-icon>
                </div>
                <div class="content">
                  <div class="title">
                    <el-tag size="small" v-if="item.noticeType == 1">通知</el-tag>
                    <el-tag size="small" type="warning" v-if="item.noticeType == 2">公告</el-tag>
                    {{ item.noticeTitle }}
                  </div>
                  <div class="content-box-time">{{ dayjs(item.create_time).format('YYYY-MM-DD') }}</div>
                </div>
              </div>

              <el-empty v-if="noticeList.length <= 0" :image-size="60" description="暂无通知"></el-empty>
            </div>
          </el-tab-pane>

          <el-tab-pane name="1">
            <template #label>
              <el-badge :hidden="chatDotNum <= 0" :value="chatDotNum" class="new-item"> 私信 </el-badge>
            </template>
            <div class="content-box">
              <div class="content-box-item" v-for="item in chatList" @click="handleDetails(item, 1)">
                <el-avatar :src="item.fromUser.avatar"></el-avatar>
                <div class="content">
                  <div class="title">
                    <span class="name">{{ item.fromUser.nickName }}</span>
                    说：{{ item.message }}
                  </div>
                  <div class="content-box-time">{{ formatTime(item.chatTime) }}</div>
                </div>
              </div>
              <el-empty v-if="chatList.length <= 0" :image-size="60" description="暂无私信"></el-empty>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="foot-box">
          <div @click="onGoToGiteeClick" v-if="noticeList.length > 0">前往通知中心</div>
        </div>
      </div>
    </el-popover>
    <noticeInfo ref="noticeInfoRef"></noticeInfo>
  </div>
</template>

<script setup name="noticeIndex">
import noticeInfo from './noticeInfo.vue'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { dayjs } from 'element-plus'
import { formatTime } from '@/utils/index'
const { proxy } = getCurrentInstance()
const noticeType = ref('0')
// 小红点
const newsDot = computed(() => {
  return useSocketStore().newNotice
})
const noticeList = computed(() => {
  return useSocketStore().noticeList
})

const allDotNum = computed(() => {
  return useSocketStore().getAllDotNum()
})
const chatList = computed(() => {
  return useSocketStore().getSessionList(useUserStore().userId)
})
const chatDotNum = computed(() => {
  return useSocketStore().newChat
})
const noticeInfoRef = ref()
function handleDetails(item, type) {
  var info = {}
  if (type == 0) {
    info = { type, ...item, title: item.noticeTitle }
  } else if (type == 1) {
    info = { type, title: item.fromUser.nickName, userId: item.userId }
  }
  proxy.$refs['noticeInfoRef'].handleOpen(type, info)
}
// 全部已读点击
function onAllReadClick() {
  useSocketStore().readAll(noticeType.value)
}
// 前往通知中心点击
function onGoToGiteeClick() {
  window.open('https://gitee.com/izory/ZrAdminNetCore')
}
</script>

<style lang="scss" scoped>
.content-box {
  font-size: 13px;
  min-height: 160px;
  max-height: 230px;
  overflow: auto;

  .content-box-item {
    .left {
      display: flex;
      align-items: center;

      .svg-icon {
        width: 20px;
      }
    }
    display: flex;
    margin-bottom: 20px;
    cursor: pointer;
    &:hover {
      color: var(--el-color-primary);
    }

    &:last-of-type {
      padding-bottom: 12px;
    }
    .content {
      margin-left: 8px;

      .name {
        color: var(--el-color-primary);
      }
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
}
.foot-box {
  height: 35px;
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-top: 1px solid #ebeef5;
  &:hover {
    opacity: 1;
  }
}

.layout-navbars-breadcrumb-user-news {
  position: relative;
  .read {
    position: absolute;
    top: 7px;
    right: 0;
    color: var(--el-color-primary);
    cursor: pointer;
    z-index: 2;
    font-size: 12px;
  }
}
</style>
<style>
.new-item {
  .is-fixed {
    right: -3px !important;
  }
}
</style>
