<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <template v-slot:header>
            <div class="clearfix">
              <span>{{ $t('user.personalInfo') }}</span>
            </div>
          </template>
          <div>
            <div class="text-center">
              <userAvatar />
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon name="user" />{{ $t('user.userName') }}
                <div class="pull-right">{{ state.user.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="phone" />{{ $t('user.phoneNumber') }}
                <div class="pull-right">{{ state.user.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="email" />{{ $t('user.userEmail') }}
                <div class="pull-right">{{ state.user.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="tree" />{{ $t('user.department') }}
                <div class="pull-right">{{ state.user.deptName }} / {{ state.postGroup }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="peoples" />{{ $t('user.role') }}
                <div class="pull-right">
                  <span v-for="item in state.roles" :key="item">{{ item }}</span>
                </div>
              </li>
              <li class="list-group-item">
                <svg-icon name="date" />{{ $t('user.registerTime') }}
                <div class="pull-right">{{ state.user.createTime }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <!-- <template v-slot:header>
            <div class="clearfix">
              <span>{{ $t('user.basicInfo') }}</span>
            </div>
          </template> -->
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('user.basicInfo')" name="userinfo">
              <userInfo :user="state.user" />
            </el-tab-pane>
            <el-tab-pane :label="$t('user.changePwd')" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
            <el-tab-pane :label="$t('menu.operLog')" name="log">
              <operLog></operLog>
            </el-tab-pane>
            <el-tab-pane :label="$t('menu.loginLog')" name="loginlog">
              <loginLog></loginLog>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Profile">
import userAvatar from './userAvatar'
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import operLog from './operLog.vue'
import loginLog from './loginLog.vue'
import { getUserProfile } from '@/api/system/user'

const activeTab = ref('userinfo')
const state = reactive({
  user: {},
  roles: [],
  roleGroup: {},
  postGroup: {}
})

function getUser() {
  getUserProfile().then((response) => {
    state.user = response.data.user
    state.roles = response.data.roles
    state.roleGroup = response.data.roleGroup
    state.postGroup = response.data.postGroup
  })
}

getUser()
</script>

<style scoped>
.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  /* border-top: 1px solid #e7eaec; */
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.pull-right {
  float: right !important;
}
</style>
