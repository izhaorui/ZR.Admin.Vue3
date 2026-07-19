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
            <div class="goNotice" @click="handleToNotice">前往通知中心</div>
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
              <div class="content-box-item" v-for="item in sysMsgList" :key="item.msgId">
                <div class="left">
                  <svg-icon name="gonggao" color="#fff" size="16"></svg-icon>
                </div>
                <div class="content" @click="handleRead(item)" :style="item.isRead == 0 ? '' : 'opacity:0.6'">
                  <div class="title md-content">
                    <MdPreview :modelValue="item.content" :editorId="'sysmsg-' + item.msgId" />
                  </div>
                  <div class="content-box-time">{{ formatTime(dayjs(item.addTime).valueOf()) }}</div>
                </div>
                <div class="ops">
                  <el-button v-if="item.isRead == 0" text @click.stop="handleRead(item)">已读</el-button>
                  <el-button text @click.stop="handleDelete(item)">删除</el-button>
                </div>
              </div>
              <el-empty v-if="sysMsgList.length <= 0" :image-size="60"></el-empty>
            </el-scrollbar>
          </div>
          <div class="foot-box">
            <div class="goNotice" @click="goMessage">前往消息管理</div>
            <div class="read" @click="onAllReadClick" v-if="dotNumInfo.sysMsgNum > 0">全部已读</div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="3">
          <template #label>
            <el-badge :show-zero="false" :value="dotNumInfo.scheduleNum"> 日程 </el-badge>
          </template>
          <div class="content-box">
            <el-scrollbar>
              <div class="content-box-item" v-for="item in scheduleList" :key="item.id" @click="handleScheduleClick(item)">
                <div class="left">
                  <svg-icon name="gonggao" color="#fff" size="16"></svg-icon>
                </div>
                <div class="content">
                  <div class="title">{{ item.title }}</div>
                  <div class="content-box-time">
                    <span v-if="item.dueTime">截止：{{ dayjs(item.dueTime).format('YYYY-MM-DD HH:mm') }}</span>
                    <span v-else>无截止时间</span>
                    <el-tag v-if="item.priority === 3" size="small" type="danger" style="margin-left: 6px">高</el-tag>
                    <el-tag v-else-if="item.priority === 2" size="small" type="warning" style="margin-left: 6px">中</el-tag>
                  </div>
                </div>
                <div class="ops">
                  <el-button text @click.stop="handleTodoDone(item)">完成</el-button>
                </div>
              </div>
            </el-scrollbar>
            <el-empty v-if="scheduleList.length <= 0" :image-size="60"></el-empty>
          </div>
          <div class="foot-box">
            <div class="goNotice" @click="goSchedule">前往日程管理</div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-popover>
    <noticeInfo ref="noticeInfoRef"></noticeInfo>
  </div>
</template>

<script setup name="noticeIndex">
import { readSysUserMsg, delSysUserMsg } from '@/api/system/sysusermsg'
import { reminderDailySchedules, changeDailyScheduleStatus } from '@/api/system/dailyschedule'
import noticeInfo from './noticeInfo.vue'
import useSocketStore from '@/store/modules/socket'
import useUserStore from '@/store/modules/user'
import { dayjs } from 'element-plus'
import { formatTime } from '@/utils/index'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'
const { proxy } = getCurrentInstance()
const router = useRouter()
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
  if (item.isRead != 0) return
  readSysUserMsg(item.msgId, 1).then(() => {
    socketStore.refreshSysMsg()
  })
}
/**
 * 删除消息
 * @param {*} item
 */
function handleDelete(item) {
  proxy.$modal
    .confirm('确认删除该消息吗？')
    .then(() => {
      delSysUserMsg(item.msgId).then(() => {
        socketStore.refreshSysMsg()
        proxy.$modal.msgSuccess('删除成功')
      })
    })
    .catch(() => {})
}
// 全部已读点击
function onAllReadClick() {
  if (noticeType.value == 2) {
    readSysUserMsg(0, 1).then(() => {
      socketStore.refreshSysMsg()
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
  router.push('/system/user/userMsg')
}

// 系统消息列表（来自 socket store，由 refreshSysMsg 维护）
const sysMsgList = computed(() => socketStore.sysMsgList)

// 日程列表（打开日程 tab 时拉取，不写消息、不轮询）
const scheduleList = ref([])
function fetchReminders() {
  reminderDailySchedules()
    .then((res) => {
      scheduleList.value = res.data || []
      socketStore.setScheduleCount(scheduleList.value.length)
    })
    .catch(() => {})
}
// 切换到待办 tab 时查询未完成待办
watch(noticeType, (val) => {
  if (val === '3') fetchReminders()
})

function init() {
  socketStore.refreshSysMsg()
}
init()

// 点击日程：跳转到日程管理页并定位对应日程
function handleScheduleClick(item) {
  proxy.$router.push({ path: '/personal/dailyschedule', query: { id: item.id } })
}
// 前往日程管理页
function goSchedule() {
  proxy.$router.push('/personal/dailyschedule')
}
function goMessage() {
  proxy.$router.push('/system/user/userMsg')
}
// 日程 tab 内联标记完成：完成后刷新列表与红点
function handleScheduleDone(item) {
  changeDailyScheduleStatus({ id: item.id, status: '1' })
    .then(() => {
      fetchReminders()
      proxy.$modal.msgSuccess('已完成')
    })
    .catch(() => {})
}
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

    .title.md-content {
      :deep(.md-editor-preview-wrapper) {
        padding: 0;
      }
      :deep(.md-editor-preview) {
        padding: 0;
        background: transparent;
        font-size: 13px;
      }
      :deep(.default-theme) {
        font-size: 13px;
      }
    }

    .ops {
      display: flex;
      align-items: center;
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
