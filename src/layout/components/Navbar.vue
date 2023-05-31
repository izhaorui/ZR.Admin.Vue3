<template>
  <div class="navbar" :class="appStore.device">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <template v-if="appStore.device == 'desktop'">
      <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
      <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />
    </template>

    <div class="right-menu">
      <header-search id="header-search" class="right-menu-item" />
      <template v-if="appStore.device == 'desktop'">
        <zr-git title="源码地址" class="right-menu-item" />
        <zr-doc title="文档地址" class="right-menu-item" />
        <screenfull title="全屏" class="right-menu-item" />
      </template>
      <size-select title="布局大小" class="right-menu-item" />
      <LangSelect title="语言设置" class="right-menu-item" />
      <Notice title="通知" class="right-menu-item" />

      <el-dropdown @command="handleCommand" class="right-menu-item avatar-container" trigger="hover">
        <span class="avatar-wrapper">
          <el-avatar :size="25" shape="circle" class="user-avatar" :src="userStore.avatar" />
          <span class="name">{{ userStore.name }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>{{ $t('layout.personalCenter') }}</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout">
              <span>{{ $t('layout.layoutSetting') }}</span>
            </el-dropdown-item>
            <el-dropdown-item command="copyToken" v-if="dev">
              <span>复制token</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>{{ $t('layout.logOut') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import ZrGit from '@/components/Zr/Git'
import ZrDoc from '@/components/Zr/Doc'
import Notice from '@/components/Notice/Index'
import LangSelect from '@/components/LangSelect/index'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
// import { useClipboard } from '@vueuse/core'
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()
const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()

const sideTheme = computed(() => settingsStore.sideTheme)
function toggleSideBar() {
  appStore.toggleSideBar()
}
const dev = ref(import.meta.env.DEV)
function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout()
      break
    case 'logout':
      logout()
      break
    case 'copyToken':
      copyText(userStore.token)
      break
    default:
      break
  }
}

const copyText = async (val) => {
  try {
    await toClipboard(val)
    proxy.$modal.msgSuccess('复制成功！')
  } catch (e) {
    console.log(e)
    proxy.$modal.msgError('当前浏览器不支持')
  }
}
function logout() {
  proxy
    .$confirm(proxy.$t('layout.logOutConfirm'), proxy.$t('common.tips'), {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = import.meta.env.VITE_APP_ROUTER_PREFIX + 'index'
      })
    })
    .catch(() => {})
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}
</script>

<style lang="scss" scoped>
.el-menu {
  // display: inline-table;
  border-bottom: none;
  .el-menu-item {
    vertical-align: center;
  }
}
.navbar {
  height: var(--base-header-height);
  line-height: var(--base-header-height);
  overflow: hidden;
  position: relative;
  background: var(--base-topBar-background);
  // box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: var(--base-header-height);
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }
  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      padding: 0 8px;
      color: var(--base-topBar-color);
      vertical-align: text-bottom;
    }

    .avatar-container {
      .avatar-wrapper {
        display: flex;
        align-items: center;
        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          vertical-align: middle;
          margin-right: 5px;
        }
        .name {
          font-size: 12px;
        }
        i {
          cursor: pointer;
          margin-left: 10px;
        }
      }
    }
  }
}
</style>
