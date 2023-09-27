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
              <div class="content-box-item" v-for="item in noticeList" @click="handleDetails(item, 0)">
                <el-icon :size="30" color="#409EFF"><bell /></el-icon>
                <div class="content">
                  <div class="title">{{ item.noticeTitle }}</div>
                  <div class="content-box-time">{{ dayjs(item.create_time).format('YYYY-MM-DD') }}</div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane name="1">
            <template #label>
              <el-badge :value="chatList.length"> 私信 </el-badge>
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
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="foot-box">
          <div @click="onGoToGiteeClick" v-if="noticeList.length > 0">前往通知中心</div>
          <div>全部已读</div>
        </div>
      </div>
    </el-popover>

    <el-dialog draggable v-model="show" append-to-body>
      <template #header> {{ info.title }} </template>
      <template v-if="info">
        <div v-if="info.type == 0">
          <div v-html="info.item.noticeContent"></div>
        </div>
        <msgList v-if="info.type == 1" v-model="info.userId"> </msgList>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="noticeIndex">
import msgList from '@/views/components/msgList.vue'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { dayjs } from 'element-plus'
import { formatTime } from '@/utils/index'
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
const chatList = computed(() => {
  return useSocketStore().getSessionList(useUserStore().userId)
})
const info = ref({})
function handleDetails(item, type) {
  show.value = true
  if (type == 0) {
    info.value = { type, item, title: item.noticeTitle }
  } else if (type == 1) {
    info.value = { type, title: item.fromUser.nickName, userId: item.userId }
  }
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
// .head-box {
//   display: flex;
//   border-bottom: 1px solid #ebeef5;
//   box-sizing: border-box;
//   color: #333333;
//   justify-content: space-between;
//   height: 35px;
//   align-items: center;
//   .head-box-btn {
//     color: #1890ff;
//     font-size: 13px;
//     cursor: pointer;
//     opacity: 0.8;
//     &:hover {
//       opacity: 1;
//     }
//   }
// }
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
  justify-content: space-around;
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
