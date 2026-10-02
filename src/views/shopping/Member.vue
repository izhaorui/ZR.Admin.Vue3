<!--
 * @Descripttion: (会员管理/ums_member)
-->
<template>
  <div>
    <el-form :model="queryParams" label-position="right" inline ref="queryRef" v-show="showSearch" @submit.prevent>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
          <el-option label="正常" :value="0" />
          <el-option label="禁用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="注册时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          :default-time="defaultTime"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button icon="search" type="primary" @click="handleQuery">{{ $t('btn.search') }}</el-button>
        <el-button icon="refresh" @click="resetQuery">{{ $t('btn.reset') }}</el-button>
      </el-form-item>
    </el-form>
    <!-- 工具区域 -->
    <el-row :gutter="15" class="mb10">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table :data="dataList" v-loading="loading" border header-cell-class-name="el-table-header-cell" highlight-current-row>
      <el-table-column prop="id" label="会员Id" align="center" width="100" />
      <el-table-column prop="phone" label="手机号" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="nickName" label="昵称" align="center" :show-overflow-tooltip="true" />
      <el-table-column prop="avatar" label="头像" align="center" width="80">
        <template #default="scope">
          <ImagePreview :src="scope.row.avatar" v-if="scope.row.avatar"></ImagePreview>
        </template>
      </el-table-column>
      <el-table-column prop="gender" label="性别" align="center" width="80">
        <template #default="scope">
          <dict-tag :options="dictStore.memberGenderOptions" :value="scope.row.gender" />
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="0"
            :inactive-value="1"
            v-hasPermi="['shop:member:edit']"
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="registerTime" label="注册时间" align="center" width="160" />
      <el-table-column prop="lastLoginTime" label="最近登录" align="center" width="160" />
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button
            type="info"
            size="small"
            icon="view"
            title="详情"
            v-hasPermi="['shop:member:query']"
            @click="handleDetail(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="会员详情" :lock-scroll="false" v-model="detailOpen" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="会员Id">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detail.nickName }}</el-descriptions-item>
        <el-descriptions-item label="性别">
          <dict-tag :options="dictStore.memberGenderOptions" :value="detail.gender" />
        </el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.status == 0 ? '正常' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="会员等级">{{ detail.memberLevel }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detail.registerTime }}</el-descriptions-item>
        <el-descriptions-item label="最近登录时间">{{ detail.lastLoginTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最近登录IP">{{ detail.lastLoginIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="微信OpenId">{{ detail.openId || '未绑定' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailOpen = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="member">
import { listMember, getMember, changeMemberStatus } from '@/api/shopping/member.js'
import useDictStore from '@/store/modules/dict'
const { proxy } = getCurrentInstance()
const dictStore = useDictStore()
const loading = ref(false)
const showSearch = ref(true)
const total = ref(0)
const dataList = ref([])
const detailOpen = ref(false)
const detail = ref({})
const dateRange = ref([])
const defaultTime = ref([new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)])
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  phone: undefined,
  nickName: undefined,
  status: undefined,
  beginRegisterTime: undefined,
  endRegisterTime: undefined
})

function getList() {
  loading.value = true
  proxy.addDateRange(queryParams, dateRange.value, 'RegisterTime')
  listMember(queryParams).then((res) => {
    const { code, data } = res
    if (code == 200) {
      dataList.value = data.result
      total.value = data.totalNum
    }
    loading.value = false
  })
}

// 查询
function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

// 重置查询操作
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}

// 详情
function handleDetail(row) {
  getMember(row.id).then((res) => {
    if (res.code == 200) {
      detail.value = res.data
      detailOpen.value = true
    }
  })
}

// 启用/禁用（取消时回滚开关状态）
function handleStatusChange(row) {
  const text = row.status === 0 ? '启用' : '禁用'
  proxy.$modal
    .confirm('确认要' + text + '会员「' + row.phone + '」吗？')
    .then(() => {
      return changeMemberStatus({ memberId: row.id, status: row.status })
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(() => {
      row.status = row.status === 0 ? 1 : 0
    })
}

onMounted(() => {
  getList()
})
</script>
