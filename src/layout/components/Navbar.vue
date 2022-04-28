<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="getters.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!$store.state.settings.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="$store.state.settings.topNav" />

    <div class="right-menu">
      <template v-if="getters.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" v-waves="'orange'" />
        <zr-git title="源码地址" class="right-menu-item" />
        <zr-doc title="文档地址" class="right-menu-item" />
        <screenfull title="全屏" class="right-menu-item" />
        <size-select title="布局大小" class="right-menu-item" />
      </template>
      <Notice title="通知" class="right-menu-item" />

      <el-dropdown @command="handleCommand" class="right-menu-item avatar-container" trigger="hover">
        <span class="avatar-wrapper">
          <img :src="getters.avatar" class="user-avatar" />
          <span class="name">{{ getters.name }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>个人中心</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout">
              <span>布局设置</span>
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import ZrGit from '@/components/Zr/Git'
import ZrDoc from '@/components/Zr/Doc'
import Notice from '@/components/Notice/Index'

const store = useStore()
const getters = computed(() => store.getters)

function toggleSideBar() {
  store.dispatch('app/toggleSideBar')
}

function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout()
      break
    case 'logout':
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      store.dispatch('LogOut').then(() => {
        location.href = '/index'
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
  .el-menu-item {
    vertical-align: center;
  }
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
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
    height: 100%;
    line-height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      padding: 0 8px;
      color: #5a5e66;
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
          border-radius: 10px;
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
