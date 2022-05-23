<template>
  <div class="app-container">
    <el-row>
      <el-col :lg="24" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%">
              <tbody>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Redis版本</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.redis_version }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">运行模式</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.redis_mode == 'standalone' ? '单机' : '集群' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">端口</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.tcp_port }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">客户端数</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.connected_clients }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">运行时间(天)</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.uptime_in_days }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">使用内存</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.used_memory_human }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">使用CPU</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ parseFloat(cache.info.used_cpu_user_children).toFixed(2) }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">内存配置</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.maxmemory_human }}</div>
                  </td>
                </tr>
                <tr>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">AOF是否开启</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.aof_enabled == '0' ? '否' : '是' }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">RDB是否成功</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">{{ cache.info.rdb_last_bgsave_status }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">Key数量</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.dbSize">{{ cache.dbSize }}</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell">网络入口/出口</div>
                  </td>
                  <td class="el-table__cell is-leaf">
                    <div class="cell" v-if="cache.info">
                      {{ cache.info.instantaneous_input_kbps }}kps/{{ cache.info.instantaneous_output_kbps }}kps
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :lg="8" class="card-box">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>命令统计</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <div ref="commandstatsRef" style="height: 300px" />
          </div>
        </el-card>
      </el-col>

      <el-col :lg="8" class="card-box" v-if="cache.info">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>内存消耗</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <gauge
              name="内存消耗"
              :max="100"
              :data="[
                {
                  value: (parseFloat(cache.info.used_memory_human) / parseFloat(cache.info.total_system_memory_human)).toFixed(2),
                  name: '内存消耗',
                },
              ]" />
          </div>
        </el-card>
      </el-col>
      <el-col :lg="8" class="card-box" v-if="cache.info">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>使用CPU</span>
            </div>
          </template>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <gauge name="CPU" :max="100" :data="[{ value: parseFloat(cache.info.used_cpu_user_children * 100).toFixed(0), name: 'CPU消耗' }]" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="cache">
import { getCache } from '@/api/monitor/cache'
import * as echarts from 'echarts'
import Gauge from '@/components/Echarts/Gauge.vue'

// 统计命令信息
const commandstats = ref(null)
// 使用内存
const usedmemory = ref(null)
// cache信息
const cache = ref([])
const commandstatsRef = ref(null)
const { proxy } = getCurrentInstance()

/** 查缓存询信息 */
function getList() {
  getCache().then((response) => {
    cache.value = response.data
    // this.$modal.closeLoading();

    // 命令使用占比
    commandstats.value = echarts.init(proxy.$refs.commandstatsRef)
    commandstats.value.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      series: [
        {
          name: '命令',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: response.data.commandStats,
          animationEasing: 'cubicInOut',
          animationDuration: 1000,
        },
      ],
    })
  })
}

onMounted(() => {
  getList()
})
</script>
