<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('newVisitis')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon name="peoples" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <el-statistic :title="$t('layout.onlineUsers')" :value="state.onlineNum" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('messages')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon name="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <el-statistic :value="state.order" :title="$t('layout.message')"> </el-statistic>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('purchases')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon name="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <el-statistic :value="state.order" :title="$t('layout.amount')">
            <template #title>
              <div style="display: inline-flex; align-items: center">{{ $t('layout.amount') }}</div>
            </template>
          </el-statistic>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleSetLineChartData('shoppings')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon name="shopping" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <el-statistic :value="state.order" :title="$t('layout.order')">
            <template #title>
              <div style="display: inline-flex; align-items: center">{{ $t('layout.order') }}</div>
            </template>
          </el-statistic>
          <div class="statistic-footer">
            <div class="footer-item">
              <span>环比</span>
              <span style="color: green">
                16%
                <el-icon>
                  <CaretTop />
                </el-icon>
              </span>

              <span>同比</span>
              <span style="color: red">
                -16%
                <el-icon>
                  <CaretBottom />
                </el-icon>
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import useSocketStore from '@/store/modules/socket'
const emit = defineEmits()

const state = reactive({
  chatNum: 1390,
  onlineNum: computed(() => {
    return useSocketStore().onlineNum
  }),
  amount: 99998,
  order: 1999
})
function handleSetLineChartData(type) {
  emit('handleSetLineChartData', type)
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 90px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    // background: var(--base-bg-main);
    box-shadow: 4px 4px 40px rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3;
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3;
    }

    .card-panel-icon-wrapper {
      // float: left;
      margin: 0px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 28px;
    }

    .card-panel-description {
      // float: right;
      font-weight: bold;
      margin-right: 20px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: var(--base-color-white);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
        color: var(--base-color-white);
      }
    }
  }
}

@media (max-width: 550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
