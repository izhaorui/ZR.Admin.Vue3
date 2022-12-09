<h2 align="center"> ZRAdmin.NET后台管理系统</h2>

<p align="center">
	<a href="https://gitee.com/izory/ZrAdminNetCore"><img src="https://gitee.com/izory/ZrAdminNetCore/badge/star.svg?theme=dark"></a>
	<a href="https://gitee.com/izory/ZrAdminNetCore/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg"></a>
</p>

## 🍟概述
* 本仓库为前端技术栈 [Vue3](https://v3.cn.vuejs.org) + [Element Plus](https://element-plus.org/zh-CN) + [Vite](https://cn.vitejs.dev) 版本。
* 配套后端代码仓库地址[ZRAdmin.NET](https://gitee.com/izory/ZrAdminNetCore/) 版本。
* 前端采用Vue3.0、Element UI Plus、vite、compisition api、Pinia等。
* 支持加载动态权限菜单，多方式轻松权限控制
* 腾讯云秒杀场：[点我进入](https://curl.qcloud.com/4yEoRquq)。
* 腾讯云优惠券：[点我领取](https://curl.qcloud.com/5J4nag8D)。
* 七牛云通用云产品优惠券：[点我进入](https://s.qiniu.com/FzEfay)。
```
如果对您有帮助，您可以点右上角 “Star” 收藏一下 ，这样作者才有继续免费下去的动力，谢谢！~
```

## 🍿在线体验
- 官方文档：http://www.izhaorui.cn/doc
- 体验地址：http://www.izhaorui.cn/vue3
- 管理员：admin
- 密  码：123456

```
由于是个人项目，资金有限，体验服是低配，请大家爱惜，轻戳，不胜感激！！！
```
## 🍁前端运行

```bash
# 克隆项目
git clone https://gitee.com/izory/ZRAdmin-vue.git

# 进入项目目录
cd ZRAdmin-vue

# 安装依赖
yarn --registry=https://registry.npm.taobao.org

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod
# 前端访问地址 http://localhost:8887
```


## 🍖内置功能

1. 用户管理：用户是系统操作者，该功能主要完成系统用户配置。
2. 部门管理：配置系统组织机构（公司、部门、小组），树结构展现。
3. 岗位管理：配置系统用户所属担任职务。
4. 菜单管理：配置系统菜单，操作权限，按钮权限标识等。(支持多语言)
5. 角色管理：角色菜单权限分配。
6. 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
7. 操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
8. 登录日志：系统登录日志记录查询包含登录异常。
9. 系统接口：使用swagger生成相关api接口文档。
10. 参数设置：常用参数配置
11. 发送邮件：可以对多个用户进行发送邮件
12. 任务系统：基于Quartz.NET，可以在线（添加、修改、删除、手动执行)任务调度包含执行结果日志。
13. 文章管理：可以写文章记录。
14. 代码生成：可以一键生成前后端代码(.cs、.vue、.js、SQL文件等)，支持下载，自定义配置前端展示控件、让开发更快捷高效。
15. 文件管理：可以进行上传文件管理，目前支持上传到本地、阿里云
16. 通知管理：系统通知公告信息发布维护
17. 参数管理：对系统动态配置常用参数。
18. 多语言管理：动态修改多语言翻译

## 🎉优势

1. 前台系统不用编写登录、授权、认证模块；只负责编写业务模块即可
2. 后台系统无需任何二次开发，直接发布即可使用
3. 前台与后台系统分离，分别为不同的系统（域名可独立）
4. 全局异常统一处理
5. 自定义的代码生成功能
6. 国际化

## 💐 特别鸣谢
- 👉Ruoyi.vue：[Ruoyi](http://www.ruoyi.vip/)

## 🎀捐赠
如果这个项目对您有所帮助，请扫下方二维码打赏作者喝杯咖啡。
<img src="https://gitee.com/izory/ZrAdminNetCore/raw/master/document/images/pay.jpg"/>

## 源码地址
- [Gitee](https://gitee.com/izory/ZrAdminNetCore/)
- [Github](https://github.com/izhaorui/ZrAdmin.NET/)