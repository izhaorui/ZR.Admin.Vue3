<template>
  <div class="navbar" :data-theme="sideTheme" :class="appStore.device + ' nav' + settingsStore.navType">
    <hamburger :is-active="appStore.sidebar.opened" :class="appStore.device" class="hamburger-container" @toggleClick="toggleSideBar" />
    <template v-if="appStore.device == 'desktop'">
      <breadcrumb class="breadcrumb-container" v-if="settingsStore.navType == NAV_TYPES.SIDEBAR" />
      <top-nav class="topmenu-container" v-if="settingsStore.navType == NAV_TYPES.MIX" />
      <TopBar v-if="settingsStore.navType == NAV_TYPES.TOP"></TopBar>
    </template>

    <div class="right-menu">
      <header-search class="right-menu-item" />
      <Notice title="通知" class="right-menu-item" />
      <template v-if="appStore.device == 'desktop'">
        <zr-git title="源码地址" class="right-menu-item" />
        <zr-doc title="文档地址" class="right-menu-item" />
        <screenfull title="全屏" class="right-menu-item" />
      </template>
      <size-select title="布局大小" class="right-menu-item" />
      <LangSelect title="语言设置" class="right-menu-item" />

      <div class="right-menu-item">
        <el-dropdown @command="handleCommand" trigger="click" style="vertical-align: middle">
          <span class="avatar-wrapper">
            <el-avatar :size="25" shape="circle" class="user-avatar" :src="userStore.avatar" />
            <span class="name">{{ userStore.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/user/profile" class="dropdown-menu-link">
                <el-dropdown-item>
                  <span class="dropdown-item-content">
                    <el-icon class="menu-icon"><User /></el-icon>
                    <span>{{ $t('layout.personalCenter') }}</span>
                  </span>
                </el-dropdown-item>
              </router-link>

              <el-dropdown-item command="lockScreen">
                <span class="dropdown-item-content">
                  <el-icon class="menu-icon"><Lock /></el-icon>
                  <span>{{ $t('layout.lockscreen') }}</span>
                </span>
              </el-dropdown-item>

              <el-dropdown-item command="copyToken" v-if="dev">
                <span class="dropdown-item-content">
                  <el-icon class="menu-icon"><DocumentCopy /></el-icon>
                  <span>复制token</span>
                </span>
              </el-dropdown-item>
              <el-dropdown-item command="clear">
                <span class="dropdown-item-content">
                  <el-icon class="menu-icon"><Delete /></el-icon>
                  <span>{{ $t('layout.clean_cache') }}</span>
                </span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span class="dropdown-item-content">
                  <el-icon class="menu-icon"><SwitchButton /></el-icon>
                  <span>{{ $t('layout.logOut') }}</span>
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="right-menu-item mr10" @click="handleCommand('setLayout')">
        <el-icon><Setting /></el-icon>
      </div>
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
import useSocketStore from '@/store/modules/socket'
import useLockStore from '@/store/modules/lock'
import { NAV_TYPES } from '@/constants/navigation'
import TopBar from './TopBar'
// import { useClipboard } from '@vueuse/core'
import useClipboard from 'vue-clipboard3'
const { toClipboard } = useClipboard()
const { proxy } = getCurrentInstance()
const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const lockStore = useLockStore()
const route = useRoute()
const router = useRouter()
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
    case 'clear':
      useSocketStore().clear()
      break
    case 'lockScreen':
      lockScreen()
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
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}
function lockScreen() {
  const currentPath = route.fullPath
  lockStore.lockScreen(currentPath)
  router.push('/lock')
}
</script>

<style lang="scss" scoped>
.nav3 {
  .desktop {
    &.hamburger-container {
      display: none;
    }
  }
}

.navbar {
  height: var(--base-header-height);
  line-height: var(--base-header-height);
  overflow: hidden;
  position: relative;
  background: var(--base-topBar-background);
  // box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  &.desktop {
    display: flex;
  }

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
    flex: 1;
  }
  .topmenu-container {
    box-sizing: border-box;
    flex: 1;
    min-width: 0;
    padding-right: 16px;
    overflow: hidden;
  }

  .right-menu {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 0 0 auto;

    .right-menu-item {
      padding: 0 8px;
      color: var(--base-topBar-color);
      vertical-align: text-bottom;
      outline: none;
      cursor: pointer;

      .el-dropdown {
        color: unset !important;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.025);
      }
    }

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
        max-width: 50px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      }
      i {
        cursor: pointer;
        margin-left: 10px;
      }
    }
  }
}

:deep(.el-dropdown-menu__item) {
  min-height: 30px;
  line-height: 30px;
  padding: 0 16px;

  .dropdown-item-content {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .menu-icon {
    width: 16px;
    font-size: 15px;
    color: var(--el-text-color-regular);
  }
}

.dropdown-menu-link {
  display: block;
}
</style>
