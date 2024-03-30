<template>
  <el-dialog draggable v-model="open" append-to-body>
    <template #header> {{ info.title }} </template>
    <template v-if="info">
      <template v-if="showType == 0">
        <div v-html="info.noticeContent"></div>

        <div class="n_right">{{ info.create_by }}</div>
        <div class="n_right">{{ dayjs(info.create_time).format('YYYY-MM-DD HH:mm') }}</div>
      </template>
      <msgList v-if="showType == 1" v-model="info.userId"> </msgList>
    </template>
    <template #footer v-if="showType == 0">
      <div class="text-center footer">
        <el-button class="next" @click="onNext" link v-if="openNoticeList.length > 1">下一条</el-button>
        <el-button icon="check" plain type="primary" @click="onReadClick(info)">我已已读</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import msgList from '@/views/components/msgList.vue'
import { dayjs } from 'element-plus'
import useSocketStore from '@/store/modules/socket'
import jsCookie from 'js-cookie'
const open = ref(false)
const showType = ref(0)

const openNoticeList = computed(() => {
  return useSocketStore().promptNoticeList
})
onMounted(() => {
  watch(
    () => openNoticeList.value,
    (val) => {
      if (val) {
        var showGonggao = jsCookie.get('gonggao')
        if (!showGonggao) {
          if (openNoticeList.value.length > 0) {
            handleDetails(openNoticeList.value[index.value], 0)
            jsCookie.set('gonggao', 1, { expires: 1 })
          }
        }
      }
    },
    {
      immediate: true
    }
  )
})

const index = ref(0)
function onNext() {
  if (index.value < openNoticeList.value.length - 1) {
    index.value = index.value + 1
  } else {
    index.value = 0
  }
  handleDetails(openNoticeList.value[index.value], 0)
}
const info = ref()
function handleOpen(val, val2) {
  open.value = true
  showType.value = val
  info.value = val2
}
function handleDetails(item, type) {
  open.value = true
  if (type == 0) {
    info.value = { type, ...item, title: item.noticeTitle }
  } else if (type == 1) {
    info.value = { type, title: item.fromUser.nickName, userId: item.userId }
  }
}

function onReadClick() {
  open.value = false
  openNoticeList.value.forEach((item) => {
    useSocketStore().readPromptNotice(item.noticeId)
  })
}
defineExpose({
  handleOpen
})
</script>
<style lang="scss" scoped>
.n_right {
  text-align: right;
  margin: 10px;
}

.footer {
  position: relative;
  .next {
    position: absolute;
    right: 0;
  }
}
</style>
