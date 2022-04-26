<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="getters.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!$store.state.settings.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="$store.state.settings.topNav" />

    <div class="right-menu">
      <template v-if="getters.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <el-tooltip content="源码地址" effect="dark" placement="bottom">
          <zr-git class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-tooltip content="文档地址" effect="dark" placement="bottom">
          <zr-doc class="right-menu-item hover-effect" />
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>
      </template>
      <!-- 通知 -->
      <div class="right-menu-item">
        <el-popover placement="bottom" trigger="click" v-model:visible="isShowUserNewsPopover" width="300" popper-class="el-popover-pupop-user-news">
          <template #reference>
            <el-badge @click.stop="isShowUserNewsPopover = !isShowUserNewsPopover" :is-dot="true" slot="reference" style="line-height: 32px">
              <el-icon><bell /></el-icon>
            </el-badge>
          </template>
          <Notice v-show="isShowUserNewsPopover" />
        </el-popover>
      </div>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <img :src="getters.avatar" class="user-avatar" />
            <span class="name">{{ getters.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </div>
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
const isShowUserNewsPopover = ref(false)

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
  line-height: 46px !important;
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
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          vertical-align: middle;
          margin-right: 5px;
					margin-top: 5px;
        }
        .name {
          font-size: 12px;
        }
        i {
          cursor: pointer;
          position: absolute;
          right: -30px;
          top: 15px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
