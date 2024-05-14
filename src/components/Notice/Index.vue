<template>
  <div>
    <el-popover placement="bottom" trigger="click" width="400px" popper-class="el-popover-pupop-user-news">
      <template #reference>
        <el-badge :show-zero="false" :value="allDotNum" style="line-height: 18px">
          <el-icon><bell /></el-icon>
        </el-badge>
      </template>

      <el-tabs v-model="noticeType">
        <el-tab-pane name="0">
          <template #label>
            <el-badge :show-zero="false" :value="dotNumInfo.noticeNum"> 通知 </el-badge>
          </template>
          <div class="content-box">
            <el-scrollbar>
              <div class="content-box-item" v-for="item in noticeList">
                <div class="left">
                  <svg-icon name="gonggao" color="#fff" size="16"></svg-icon>
                </div>
                <div class="content" @click="handleDetails(item, 0)">
                  <div class="title">
                    {{ item.noticeTitle }}
                  </div>
                  <div class="content-box-time">{{ dayjs(item.create_time).format('YYYY-MM-DD') }}</div>
                </div>
                <!-- <div v-if="!readList.includes(item.noticeId)">
                  <el-button text @click="handleReadNotice(item)">已读</el-button>
                </div> -->
              </div>
            </el-scrollbar>
            <el-empty v-if="noticeList.length <= 0" :image-size="60"></el-empty>
          </div>
          <div class="foot-box">
            <div class="read" @click="onAllReadClick" v-show="dotNumInfo.noticeNum > 0">标记当前页已读</div>
            <div class="goNotice" @click="handleToNotice" v-if="settings.noticeUrl">前往通知中心</div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="1">
          <template #label>
            <el-badge :show-zero="false" :value="dotNumInfo.chatNum"> 私信 </el-badge>
          </template>
          <div class="content-box">
            <el-scrollbar>
              <div class="content-box-item" v-for="item in chatList" @click="handleDetails(item, 1)">
                <el-avatar :src="item.fromUser.avatar"></el-avatar>
                <div class="content">
                  <div class="title">
                    <span class="name">{{ item.fromUser.nickName }}</span>
                    回复：{{ item.message }}
                  </div>
                  <div class="content-box-time">{{ formatTime(item.chatTime) }}</div>
                </div>
              </div>
              <el-empty v-if="chatList.length <= 0" :image-size="60"></el-empty>
            </el-scrollbar>
          </div>
          <div class="foot-box">
            <div class="read" @click="onAllReadClick" v-if="dotNumInfo.chatNum > 0">标记当前页已读</div>
          </div>
        </el-tab-pane>
        <el-tab-pane name="2">
          <template #label>
            <el-badge :show-zero="false" :value="dotNumInfo.sysMsgNum"> 系统 </el-badge>
          </template>

          <div class="content-box">
            <el-scrollbar>
              <div class="content-box-item" v-for="item in sysList">
                <div class="left">
                  <svg-icon name="gonggao" color="#fff" size="16"></svg-icon>
                </div>
                <div class="content">
                  <div class="title">
                    {{ item.content }}
                  </div>
                  <div class="content-box-time">{{ formatTime(dayjs(item.addTime).valueOf()) }}</div>
                </div>
                <div v-if="item.isRead == 0">
                  <el-button text @click="handleRead(item)">已读</el-button>
                </div>
              </div>
              <el-empty v-if="sysList.length <= 0" :image-size="60"></el-empty>
            </el-scrollbar>
          </div>
          <div class="foot-box">
            <div class="read" @click="onAllReadClick" v-if="dotNumInfo.sysMsgNum > 0">标记当前页已读</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
    <noticeInfo ref="noticeInfoRef"></noticeInfo>
  </div>
</template>

<script setup name="noticeIndex">
import { listMySysUserMsg, readSysUserMsg } from '@/api/system/sysusermsg'
import noticeInfo from './noticeInfo.vue'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { dayjs } from 'element-plus'
import { formatTime } from '@/utils/index'
import settings from '@/settings'
const { proxy } = getCurrentInstance()
const socketStore = useSocketStore()
const noticeType = ref('0')

const noticeList = computed(() => {
  return socketStore.noticeList
})

const allDotNum = computed(() => {
  return socketStore.getAllDotNum
})
const chatList = computed(() => {
  return socketStore.getSessionList(useUserStore().userId)
})
/**
 * 小红点信息
 */
const dotNumInfo = computed(() => {
  return socketStore.getMsgNum
})
const noticeInfoRef = ref()
/**
 * 查看公告详情
 * @param {*} item
 * @param {*} type
 */
function handleDetails(item, type) {
  var info = {}
  if (type == 0) {
    info = { type, ...item, title: item.noticeTitle }
  } else if (type == 1) {
    info = { type, title: item.fromUser.nickName, userId: item.userId }
  }
  proxy.$refs['noticeInfoRef'].handleOpen(type, info)
}
/**
 * 已读消息
 * @param {*} item
 */
function handleRead(item) {
  readSysUserMsg(item.msgId, 1).then(() => {
    init()
  })
}
// 全部已读点击
function onAllReadClick() {
  if (noticeType.value == 2) {
    readSysUserMsg(0, 1).then(() => {
      init()
    })
  }
  useSocketStore().readAll(noticeType.value)
}
/**
 * 已读通知
 */
function handleReadNotice(item) {
  useSocketStore().readPromptNotice(item.noticeId)
}
// 前往通知中心点击
function handleToNotice() {
  window.open(settings.noticeUrl)
}

const sysList = ref([])
function init() {
  listMySysUserMsg({ isRead: 0, msgType: 1 }).then((res) => {
    const { result, totalNum } = res.data
    sysList.value = result

    socketStore.setSysMsgNum(totalNum)
  })
}
init()
</script>

<style lang="scss" scoped>
.content-box {
  font-size: 13px;
  height: 200px;
  overflow: hidden;

  .content-box-item {
    margin-bottom: 10px;
    margin-right: 10px;
    display: flex;
    cursor: pointer;

    .left {
      display: flex;
      align-items: center;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      justify-content: center;
      background: linear-gradient(23deg, rgba(110, 227, 225, 0.18) 0%, #00d9f5 100%);
    }
    &:hover {
      color: var(--el-color-primary);
    }

    .content {
      margin-left: 8px;
      word-wrap: break-word;
      word-break: break-all;
      position: relative;
      flex: 1;

      .name {
        color: var(--el-color-primary);
      }
    }

    .content-box-time {
      margin-top: 3px;
      color: #ccc;
    }
  }
}
.foot-box {
  color: var(--el-color-primary);
  font-size: 13px;
  cursor: pointer;
  height: 25px;
  line-height: 25px;
  border-top: 1px solid #eee;

  .read {
    top: 7px;
    right: 0;
    color: var(--el-color-primary);
    cursor: pointer;
    z-index: 2;
    font-size: 12px;
    float: left;
  }
  .goNotice {
    float: right;
  }
}
</style>
