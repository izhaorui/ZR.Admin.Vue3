<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning" style="font-size: 14px">
          【阿里云特惠专区】
          <el-link href="https://www.aliyun.com/minisite/goods?userCode=uotn5vt1&share_source=copy_link" type="primary" target="_black">
            ☛☛点我进入☚☚
          </el-link>
          <br />
          【领取腾讯云通用云产品新用户专属大礼包2860优惠券，每种代金券限量500张，先到先得。】
          <el-link href="https://curl.qcloud.com/5J4nag8D" type="primary" target="_blank"> ☛☛点我进入☚☚ </el-link>
          <br />

          【腾讯云限时秒杀活动】
          <el-link href="https://curl.qcloud.com/4yEoRquq" type="primary" target="_blank">☛☛点我进入☚☚ </el-link>
          <br />

          【华为特惠专区，多款产品限时特价】
          <el-link
            href="https://activity.huaweicloud.com/discount_area_v5/index.html?fromacct=a53709d1-149d-49f4-9b89-bf62bd96ef65&utm_source=aGlkX3N0dnZkMWNxejBnOTJ5OA===&utm_medium=cps&utm_campaign=201905"
            type="primary"
            target="_blank">
            ☛☛点我进入☚☚
          </el-link>
          <br />
          【领取七牛云通用云产品优惠券】
          <el-link href="https://s.qiniu.com/FzEfay" type="primary" target="_blank"> ☛☛点我进入☚☚ </el-link>
          <br />
          【Gitee 企业版优惠专区】
          <el-link href="https://gitee.com/enterprises?invite_code=Z2l0ZWUtMTI1NzM1OQ%3D%3D" type="primary" target="_blank"> ☛☛点我进入☚☚ </el-link>
          <br />
          <h4 class="text-danger">云产品通用红包，可叠加官网常规优惠使用。(仅限新用户)</h4>
        </blockquote>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :lg="16" :sm="24">
        <h2>ZRAdmin.NET {{ $t('layout.backstageManagement') }}</h2>
        <p>
          ZRAdmin.NET借鉴了很多开源项目的优点，让你开发Web管理系统更简单，所以我也把它给开源了（前端
          <code>vue页面</code>主要参考若依，在此表示感谢.)
        </p>
        <p>{{ $t('layout.content1') }}</p>
        <p>
          <b>{{ $t('layout.currentVersion') }}:</b> <span>v{{ version }}</span>
          <el-link
            class="ml10"
            type="primary"
            size="small"
            icon="Document"
            plain
            @click="goTarget('http://www.izhaorui.cn/doc/changelog.html#' + version)"
            >{{ $t('layout.changeLog') }}
          </el-link>
        </p>
        <p>
          <el-button type="primary" size="small" icon="Cloudy" plain @click="goTarget('https://gitee.com/izory/ZrAdminNetCore')">Gitee </el-button>
          <el-button type="primary" size="small" icon="Cloudy" plain @click="goTarget('https://github.com/izhaorui/ZrAdmin.NET')"
            >Github
          </el-button>
        </p>
        <p></p>
        <h3>{{ $t('layout.tip1') }}</h3>
      </el-col>
      <el-col :lg="8" :sm="24">
        <h2>{{ $t('layout.technicalSelection') }}</h2>
        <div style="float: left; width: 50%">
          <h4>{{ $t('layout.backendTechnology') }}</h4>
          <ul>
            <li>NET6</li>
            <li>JWT</li>
            <li>SqlSugar</li>
            <li>Quartz.Net</li>
            <li>MySql</li>
            <li>Mapster</li>
            <li>Epplus</li>
            <li>Redis</li>
            <li>Signalr</li>
            <li>...</li>
          </ul>
        </div>
        <div style="float: right; width: 50%">
          <h4>{{ $t('layout.frontendTechnology') }}</h4>
          <ul>
            <li>Vue3</li>
            <li>Vuex</li>
            <li>Element plus</li>
            <li>Axios</li>
            <li>Sass</li>
            <li>Wangeditor</li>
            <li>Vite</li>
            <li>Composition api</li>
            <li>I18n</li>
            <li>...</li>
          </ul>
        </div>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20" class="mt10">
      <el-col :sm="24" :lg="8">
        <el-card>
          <template #header>
            <span>{{ $t('layout.donationSupport') }}</span>
          </template>

          <div class="body">
            <div style="color: red">{{ $t('layout.rewardUser') }}</div>
            <img src="@/assets/images/reward.jpg" alt="donate" style="width: 100%" />
          </div>
        </el-card>
      </el-col>
      <el-col :sm="24" :lg="8">
        <el-card>
          <template #header>
            <span>{{ $t('layout.contactUs') }}</span>
          </template>
          <div class="body">
            <p>
              <el-icon> <promotion /> </el-icon>{{ $t('layout.officialWebsite') }}：
              <el-link href="http://www.izhaorui.cn/doc" target="_blank"> http://www.izhaorui.cn/doc </el-link>
            </p>
            <p>
              <el-icon> <UserFilled /> </el-icon>{{ $t('layout.qqGroup') }}：
              <el-link
                target="_black"
                href="https://qm.qq.com/cgi-bin/qm/qr?k=Y__-fTGo_K2UIo3nWz7QnvS8LoRfPWKm&authKey=/ldXxiuolv80PF4yC8VtLk/TvAYbIhm2LKP8YVHCxAk+x2I+iqPAM1H/IsxQ+0gC&noverify=0">
                191349103
              </el-link>
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="index">
import defaultSettings from '@/settings'
const version = defaultSettings.version

function goTarget(url) {
  window.open(url, '__blank')
}
</script>

<style scoped lang="scss">
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid #eee;
  }

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eee;
  }

  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: 'open sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>
