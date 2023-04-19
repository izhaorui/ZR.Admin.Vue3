<template>
  <div class="app-container">
    <el-row>
      <el-col :lg="24" class="card-box" v-if="server.cpu">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <div><Cpu style="width: 1em; height: 1em; vertical-align: middle" /> <span style="vertical-align: middle">CPU/内存</span></div>
              <el-button text @click="getList()">刷新</el-button>
            </div>
          </template>

          <div class="col-item">
            <div class="title">CPU使用率</div>
            <div class="content">
              <el-progress type="dashboard" :percentage="parseFloat(server.cpu.cpuRate)" />
            </div>
            <div class="footer" v-if="server.sys">{{ server.sys.cpuNum }} 核心</div>
          </div>

          <div class="col-item">
            <div class="title">内存使用率</div>
            <el-tooltip placement="top-end">
              <template #content>
                <div style="font-size: 12px">
                  <div style="padding: 3px">总量：{{ server.cpu.totalRAM }}</div>
                  <div style="padding: 3px">已使用：{{ server.cpu.usedRam }}</div>
                  <div style="padding: 3px">空闲：{{ server.cpu.freeRam }}</div>
                </div>
              </template>

              <div class="content">
                <el-progress type="dashboard" :percentage="parseFloat(server.cpu.ramRate)" />
              </div>
            </el-tooltip>
            <div class="footer">{{ server.cpu.usedRam }} / {{ server.cpu.totalRAM }}</div>
          </div>

          <div class="col-item">
            <div class="title">.NETCore服务</div>
            <div class="content">
              <el-progress type="dashboard" :percentage="parseFloat(appPercent)" />
            </div>
            <div class="footer" v-if="server.app">{{ server.app.appRAM }}</div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="24" class="card-box">
        <el-card>
          <template #header>
            <Files style="width: 1em; height: 1em; vertical-align: middle" /> <span style="vertical-align: middle">磁盘状态</span>
          </template>
          <div class="col-item" v-for="sysFile in server.disk" :key="sysFile.diskName">
            <div class="title">{{ sysFile.diskName }}盘使用率</div>
            <div class="content">
              <el-tooltip placement="top-end">
                <template #content>
                  <div style="font-size: 12px">
                    <div style="padding: 3px">总量：{{ sysFile.totalSize }}GB</div>
                    <div style="padding: 3px">空闲：{{ sysFile.availableFreeSpace }}GB</div>
                    <div style="padding: 3px">已用：{{ sysFile.used }}GB</div>
                  </div>
                </template>
                <div class="content">
                  <el-progress type="dashboard" :percentage="parseFloat(sysFile.availablePercent)" />
                </div>
              </el-tooltip>
            </div>
            <div class="footer">{{ sysFile.availableFreeSpace }}GB可用，共{{ sysFile.totalSize }}GB</div>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="24" class="card-box">
        <el-card>
          <template #header>
            <Monitor style="width: 1em; height: 1em; vertical-align: middle" /> <span style="vertical-align: middle">服务器信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%" v-if="server.sys">
              <tbody>
                <tr>
                  <td>
                    <div class="cell">服务器名称</div>
                  </td>
                  <td>
                    <div class="cell">{{ server.sys.computerName }}</div>
                  </td>
                  <td>
                    <div class="cell">操作系统</div>
                  </td>
                  <td>
                    <div class="cell">{{ server.sys.osName }}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">服务器IP</div>
                  </td>
                  <td>
                    <div class="cell">{{ server.sys.serverIP }}</div>
                  </td>
                  <td>
                    <div class="cell">系统架构</div>
                  </td>
                  <td>
                    <div class="cell">{{ server.sys.osArch }}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">系统运行时长</div>
                  </td>
                  <td>
                    <div class="cell">{{ server.sys.runTime }}</div>
                  </td>
                  <td>
                    <div class="cell"></div>
                  </td>
                  <td>
                    <div class="cell"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="24" class="card-box">
        <el-card>
          <template #header>
            <Platform style="width: 1em; height: 1em; vertical-align: middle" /> <span style="vertical-align: middle">.NET信息</span>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td>
                    <div class="cell">环境变量</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.name }}</div>
                  </td>
                  <td>
                    <div class="cell">.Net版本</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.version }}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">启动时间</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.startTime }}</div>
                  </td>
                  <td>
                    <div class="cell">运行时长</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.runTime }}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">占用内存</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.appRAM }}</div>
                  </td>
                  <td>
                    <div class="cell">启动地址</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.host }}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="cell">ContentRootPath</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.rootPath }}</div>
                  </td>
                  <td>
                    <div class="cell">webPath</div>
                  </td>
                  <td>
                    <div v-if="server.app">{{ server.app.webRootPath }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="server">
import { getServer } from '@/api/monitor/server'
import { onBeforeRouteLeave } from 'vue-router'
onBeforeRouteLeave((to) => {
  clear()
})
const appPercent = ref(0)
// 服务器信息
const server = ref([])
const intervalId = ref(null)
const { proxy } = getCurrentInstance()
/** 查询服务器信息 */
function getList() {
  getServer()
    .then((response) => {
      server.value = response.data
      proxy.$modal.closeLoading()
    })
    .catch((err) => {
      proxy.$modal.closeLoading()
    })
}
// 打开加载层
function openLoading() {
  proxy.$modal.loading('拼命读取中')
}
function dataRefreh() {
  if (intervalId.value != null) {
    return
  }
  intervalId.value = setInterval(() => {
    getList()
  }, 10000)
}
/**
 * 停止定时器
 */
function clear() {
  clearInterval(intervalId.value)
  intervalId.value = null
}
watch(
  () => server.value,
  (val) => {
    if (val && val.app) {
      const appRam = val.app.appRAM.replace(' MB', '')
      const totalRam = val.cpu.totalRAM.replace('GB', '') * 1024

      const p = appRam / totalRam
      appPercent.value = p.toFixed(2)
    }
  },
  { immediate: true }
)
getList()
openLoading()
dataRefreh()
</script>
<style scoped>
table tr {
  height: 30px;
}
.is-leaf {
  text-align: center;
  padding: 0 10px;
}
.title {
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #999;
  margin-bottom: 16px;
}
.footer {
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  color: #999;
  margin-top: -5px;
  margin-bottom: 10px;
}
.content {
  text-align: center;
  margin-top: 5px;
  margin-bottom: 5px;
}
.col-item {
  width: 200px;
  display: inline-block;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
