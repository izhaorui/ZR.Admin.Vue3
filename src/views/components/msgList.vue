<template>
  <div style="height: 400px">
    <div class="message_content">
      <el-scrollbar height="100%" ref="scrollContainer">
        <template v-for="item in conversionMsgList">
          <div class="talk_item talk_primary" v-if="item.self">
            <div class="head">
              <el-avatar shape="square"> 我 </el-avatar>
            </div>
            <div class="content">
              <div class="bubble">{{ item.message }}</div>
            </div>
          </div>

          <div class="talk_item talk_other" v-else>
            <div class="head">
              <el-avatar :src="item.fromUser.avatar" shape="square" />
            </div>
            <div class="content">
              <div class="bubble">{{ item.message }}</div>
            </div>
          </div>
        </template>
      </el-scrollbar>
    </div>
    <div class="talk_bottom">
      <div class="talk_area">
        <textarea class="textarea" placeholder="请输入聊天内容" @keyup.enter="handleSend" v-model="content"></textarea>

        <div class="talk_btn">
          <el-button type="success" size="default" @click="handleSend">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="msglist">
import useSocketStore from '@/store/modules/socket'
const socketStore = useSocketStore()
const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {}
})
const conversionMsgList = computed(() => {
  return socketStore.getMessageList(props.modelValue)
})
const content = ref('')
function handleSend() {
  if (content.value.trim().length <= 0) {
    proxy.$modal.msgError('请输入聊天内容')
    return
  }
  var obj = {
    toUserId: props.modelValue,
    message: content.value
  }
  socketStore
    .sendChat(obj)
    .then(() => {
      content.value = ''
      scrollBottom()
    })
    .catch(() => {
      proxy.$modal.msgError('发送失败')
    })
}
/**
 * 滚动聊天记录
 * @param {*} type
 */
function scrollBottom(type) {
  setTimeout(() => {
    const scrollWrapper = computed(() => proxy.$refs.scrollContainer.$refs.wrapRef)
    const height = scrollWrapper.value.scrollHeight

    if (type == 1) {
      scrollWrapper.value.scrollTop = height
    } else {
      scrollWrapper.value.scrollTo({ top: height + 120, behavior: 'smooth' })
    }
  }, 100)
}
watch(
  () => props.modelValue,
  () => {
    scrollBottom(1)
  },
  {
    immediate: true
  }
)
</script>
<style lang="scss" scoped>
.message_content {
  width: 100%;
  height: 300px;
  border-top: 1px solid #ddd;
  padding-top: 10px;
}

.talk_item {
  position: relative;
  display: flex;
  height: auto;
  margin-bottom: 1rem;

  .head {
    display: block;
    width: 3rem;
    height: 3rem;
    float: left;
    cursor: pointer;
    img {
      border-radius: 0.3rem;
      width: 90%;
      height: 90%;
    }
  }

  .content {
    display: block;
    overflow: hidden;
    margin-right: 0.4rem;
    max-width: 70%;

    .bubble {
      display: inline-block;
      position: relative;
      text-align: left;
      font-size: 1rem;
      margin-right: 0.2rem;
      border-radius: 0.4rem;
      background: var(--el-color-success);
      color: #fff;
      padding: 4px 10px;
    }
  }
}

.talk_primary {
  flex-direction: row-reverse;
  padding-right: 5px;
}

.talk_item:after {
  clear: both;
}

.talk_bottom {
  border-top: 1px solid #ddd;

  .talk_btn {
    position: absolute;
    right: 10px;
    padding: 0 10px;
    bottom: 20px;
  }

  .talk_area {
    position: relative;
    height: 100px;

    .textarea {
      padding: 10px 0.2rem;
      width: 100%;
      flex: 1;
      resize: none;
      background: none;
      border: none;
      outline: none;
      height: 100%;
    }
    .textarea:focus {
      outline: none;
    }
  }
}
</style>
