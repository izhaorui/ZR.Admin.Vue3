<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px" class="gen-info-form">
    <el-row :gutter="16">
      <el-col :lg="12">
        <el-form-item prop="tplCategory">
          <template #label>生成模板</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option label="单表（增删改查）" value="crud" />
            <!-- <el-option label="单表查询" value="select" /> -->
            <el-option label="树表（增删改查）" value="tree" />
            <!-- <el-option label="导航查询(1对1)" value="subNav"></el-option>
            <el-option label="导航查询(1对多)" value="subNavMore"></el-option> -->
            <el-option label="主子表（增删改查）" value="subNavMore" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="frontTpl">
          <template #label>前端模板</template>
          <el-select v-model="info.frontTpl">
            <el-option label="Vue2 element ui" :value="1" />
            <el-option label="Vue3 element plus" :value="2" />
            <el-option label="Ant design" :value="3" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="baseNameSpace">
          <template #label>
            生成命名空间前缀
            <span>
              <el-tooltip content="比如 ZR." placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.baseNameSpace" />
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="moduleName">
          <template #label>
            生成模块名
            <span>
              <el-tooltip content="可理解为子系统名，例如 system、user、tool（一般文件夹归类）" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.moduleName" auto-complete="" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="businessName">
          <template #label>
            生成业务名
            <span>
              <el-tooltip content="可理解为功能英文名，例如 user" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="functionName">
          <template #label>
            生成功能名
            <span>
              <el-tooltip content="用作类描述，例如 用户,代码生成,文章系统" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item>
          <template #label>
            上级菜单
            <span>
              <el-tooltip content="分配到指定菜单下，例如 系统管理" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-cascader
            class="w100"
            :options="menuOptions"
            :props="{ checkStrictly: true, value: 'menuId', label: 'menuName', emitPath: false }"
            placeholder="请选择上级菜单"
            clearable
            @change="clearParentMent($event)"
            v-model="info.parentMenuId">
            <template #default="{ node, data }">
              <span>{{ data.menuName }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item label="默认查询排序字段" class="sort-field-item">
          <el-select v-model="info.sortField" placeholder="请选择字段" style="width: 100px" class="mr10" clearable="">
            <el-option v-for="item in columns" :key="item.columnId" :label="item.csharpField" :value="item.csharpField"> </el-option>
          </el-select>

          <el-radio-group v-model="info.sortType">
            <el-radio-button value="asc">正序</el-radio-button>
            <el-radio-button value="desc">倒序</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="useSnowflakeId">
          <template #label>
            是否使用雪花id
            <span>
              <el-tooltip content="设置成主键的字段将自动设置为雪花id字段" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio-group :disabled="info.tplCategory != 'crud'" v-model="info.useSnowflakeId">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="permissionPrefix">
          <template #label>
            权限前缀
            <span>
              <el-tooltip content="eg：system:user:add中的'system:user'" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.permissionPrefix" placeholder="请输入权限前缀"></el-input>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="genType">
          <template #label>
            生成代码方式
            <span>
              <el-tooltip content="默认为zip压缩包下载" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio v-model="info.genType" value="0">zip压缩包</el-radio>
          <el-radio v-model="info.genType" value="1">自定义路径</el-radio>
        </el-form-item>
      </el-col>

      <el-col :lg="12" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            自定义路径
            <span>
              <el-tooltip content="填写磁盘绝对路径，若不填写，则生成到当前Web项目下" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-input v-model="info.genPath" placeholder="前端代码路径在后端配置文件gen->vuePath下配置"></el-input>
        </el-form-item>
      </el-col>
      <el-col :lg="8">
        <el-form-item label="是否生成仓储层">
          <template #label>
            是否生成仓储层
            <span>
              <el-tooltip content="不勾选代码将不会生成对应的ZR.Repository代码" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio-group v-model="info.generateRepo">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>

      <el-col :lg="8" v-if="info.genType == '1'">
        <el-form-item prop="generateMenu" label="添加菜单">
          <template #label>
            生成菜单
            <span>
              <el-tooltip content="勾选将会自动生成目录、菜单、按钮菜单" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-switch v-model="info.generateMenu" class="ml-2" />
        </el-form-item>
      </el-col>
      <el-col :lg="8">
        <el-form-item prop="enableColumns" label="启用显隐列">
          <el-switch v-model="info.enableColumns" class="ml-2" />
        </el-form-item>
      </el-col>
      <el-col :lg="8">
        <el-form-item prop="colNum" label="一行显示列">
          <el-radio v-model="info.colNum" :value="12">2列</el-radio>
          <el-radio v-model="info.colNum" :value="24">1列</el-radio>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item>
          <template #label>
            是否记录差异化日志
            <span>
              <el-tooltip content="表编辑、删除会自动记录差异化日志" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-radio-group v-model="info.enableLog">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="operBtnStyle" label="操作按钮样式">
          <el-radio v-model="info.operBtnStyle" :value="1">button</el-radio>
          <el-radio v-model="info.operBtnStyle" :value="2">text button</el-radio>
        </el-form-item>
      </el-col>
      <el-col :lg="24" v-show="info.tplCategory != 'select'">
        <el-form-item label="生成功能" class="feature-check-item">
          <el-checkbox-group v-model="info.checkedBtn" @change="checkedBtnSelect">
            <el-checkbox :label="1">
              <el-tag>添加</el-tag>
            </el-checkbox>
            <el-checkbox :label="2">
              <el-tag type="success">修改</el-tag>
            </el-checkbox>
            <el-checkbox :label="3">
              <el-tag type="danger">删除</el-tag>
            </el-checkbox>
            <el-checkbox :label="4">
              <el-tag type="warning">导出</el-tag>
            </el-checkbox>
            <el-checkbox :label="5">
              <el-tag type="info">查看</el-tag>
            </el-checkbox>
            <el-checkbox :label="6">
              <el-tag type="danger">清空</el-tag>
            </el-checkbox>
            <el-checkbox :label="7">
              <el-tag type="danger">批量删除</el-tag>
            </el-checkbox>
            <el-checkbox :label="8">
              <el-tag>批量导入</el-tag>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 树表配置 -->
    <el-row v-if="info.tplCategory == 'tree'" :gutter="16">
      <el-col :lg="24">
        <h4 class="form-header">树表信息</h4>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="treeCode">
          <template #label>
            树编码字段
            <span>
              <el-tooltip content="树显示的编码字段名， 如：dept_id" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="info.treeCode" placeholder="请选择树编码字段">
            <el-option v-for="(column, index) in columns" :key="index" :label="column.columnComment" :value="column.csharpField">
              <span style="float: left">{{ column.csharpField }}</span>
              <span style="float: right">{{ column.columnComment }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="treeName">
          <template #label>
            树名称字段
            <span>
              <el-tooltip content="树节点的显示名称字段名， 如：dept_name" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="info.treeName" placeholder="请选择树名称字段">
            <el-option v-for="(column, index) in columns" :key="index" :label="column.csharpField" :value="column.csharpField">
              <span style="float: left">{{ column.csharpField }}</span>
              <span style="float: right">{{ column.columnComment }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="24">
        <el-form-item prop="treeParentCode">
          <template #label>
            树父编码字段
            <span>
              <el-tooltip content="树显示的父编码字段名， 如：parent_Id" placement="top">
                <el-icon>
                  <question-filled />
                </el-icon>
              </el-tooltip>
            </span>
          </template>
          <el-select v-model="info.treeParentCode" placeholder="请选择树父编码字段">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.csharpField + '：' + column.columnComment"
              :value="column.csharpField">
              <span style="float: left">{{ column.csharpField }}</span>
              <span style="float: right">{{ column.columnComment }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 主子表配置 -->
    <el-row v-if="info.tplCategory == 'sub' || info.tplCategory == 'subNav' || info.tplCategory == 'subNavMore'" :gutter="16">
      <el-col :lg="24">
        <h4 class="form-header">关联信息</h4>
      </el-col>

      <el-col :lg="12" v-for="(row, index) in subTableRows" :key="index">
        <el-form-item
          :label="index === 0 ? '关联子表' : ''"
          :prop="'subTables.' + index + '.tableName'"
          :rules="[{ required: true, message: '请选择子表', trigger: 'change' }]">
          <div class="sub-table-row">
            <el-select v-model="row.tableName" filterable placeholder="请选择子表" @change="onSubTableChange(row)" class="sub-table-select">
              <el-option
                v-for="table in tableOptions"
                :disabled="table.tableName == info.tableName || isSubTableUsed(table.tableName, row.tableName)"
                :key="table.tableName"
                :label="table.tableName + '：' + table.tableComment"
                :value="table.tableName">
              </el-option>
            </el-select>
            <el-select
              v-model="row.fkName"
              placeholder="外键"
              class="sub-fk-select">
              <el-option
                v-for="column in subColumnsMap[row.tableName] || []"
                :key="column.columnId || column.csharpField"
                :label="column.csharpField"
                :value="column.csharpField">
                <span style="float: left">{{ column.csharpField }}</span>
                <span style="float: right">{{ column.columnComment }}</span>
              </el-option>
            </el-select>
            <el-button icon="delete" text type="danger" @click="removeSubTable(index)" :disabled="subTableRows.length <= 1" />
          </div>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item :label="subTableRows.length ? '' : '关联子表'">
          <el-button type="primary" plain icon="plus" @click="addSubTable">添加子表</el-button>
        </el-form-item>
      </el-col>

      <!-- 表关系可视化（默认折叠，避免把页面撑长） -->
      <el-col :lg="24" v-if="subTableRows.some((r) => r.tableName)">
        <el-form-item label="关系预览">
          <el-collapse class="w100 relation-collapse">
            <el-collapse-item name="graph">
              <template #title>
                <span class="relation-collapse__title">查看表关系图（{{ subTableRows.filter((r) => r.tableName).length }} 张）</span>
              </template>
              <div class="relation-graphs">
                <template v-for="row in subTableRows" :key="'graph-' + row.tableName">
                  <table-relation-graph
                    v-if="row.tableName"
                    :main-table="mainTableInfo"
                    :main-table-columns="columns"
                    :sub-table="getSubTableInfo(row.tableName)"
                    :sub-table-columns="subColumnsMap[row.tableName] || []"
                    :fk-name="row.fkName"
                  />
                </template>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup name="genInfoForm">
import { listMenu } from '@/api/system/menu'
import { queryColumnInfo } from '@/api/tool/gen'
import TableRelationGraph from './components/tableRelationGraph.vue'

const menuOptions = ref([])
// 子表列信息缓存 { tableName: columns }
const subColumnsMap = reactive({})
// 子表配置行列表（一对多），来源于 info.subTables
const subTableRows = computed(() => props.info?.subTables || [])

// 子表下拉选项：仅已导入代码生成的表
const tableOptions = computed(() => props.tables || [])

// 主表信息（从 tables 列表中匹配当前表名）
const mainTableInfo = computed(() => {
  if (!props.info?.tableName || !props.tables) return null
  return props.tables.find((t) => t.tableName === props.info.tableName) || { tableName: props.info.tableName, tableComment: props.info.tableComment }
})

/** 初始化子表配置行（兼容旧版单子表 subTableName/subTableFkName） */
function initSubTables() {
  if (!props.info) return
  let list = props.info.subTables
  if (!Array.isArray(list) || list.length === 0) {
    if (props.info.subTableName) {
      list = [{ tableName: props.info.subTableName, fkName: props.info.subTableFkName }]
    } else {
      list = [{ tableName: '', fkName: '' }]
    }
  }
  props.info.subTables = list.map((r) => ({ tableName: r.tableName || '', fkName: r.fkName || '' }))
  props.info.subTables.forEach((r) => loadSubColumns(r.tableName))
  syncLegacyFields()
}

/** 同步第一行到旧版单子表字段（后端级联模板按 subTableName 判断） */
function syncLegacyFields() {
  const first = props.info.subTables?.[0]
  props.info.subTableName = first?.tableName || ''
  props.info.subTableFkName = first?.fkName || ''
}

/** 加载子表列信息（带缓存） */
function loadSubColumns(tableName) {
  if (!tableName || subColumnsMap[tableName]) return
  const obj = props.tables?.find((t) => t.tableName === tableName)
  if (!obj) return
  queryColumnInfo(obj.tableId).then((res) => {
    if (res.code == 200) {
      subColumnsMap[tableName] = res.data.columns
    }
  })
}

/** 子表选择变化 */
function onSubTableChange(row) {
  row.fkName = ''
  loadSubColumns(row.tableName)
  syncLegacyFields()
}

/** 添加子表行 */
function addSubTable() {
  if (!Array.isArray(props.info.subTables)) {
    props.info.subTables = []
  }
  props.info.subTables.push({ tableName: '', fkName: '' })
}

/** 删除子表行 */
function removeSubTable(index) {
  props.info.subTables.splice(index, 1)
  syncLegacyFields()
}

/** 子表是否已被其他行占用 */
function isSubTableUsed(tableName, currentTableName) {
  return subTableRows.value.some((r) => r.tableName === tableName && r.tableName !== currentTableName)
}

/** 获取子表表信息 */
function getSubTableInfo(tableName) {
  if (!tableName || !props.tables) return { tableName, tableComment: '' }
  return props.tables.find((t) => t.tableName === tableName) || { tableName, tableComment: '' }
}

const props = defineProps({
  info: {
    type: Object,
    default: null
  },
  // 字表
  tables: {
    type: Array,
    default: null
  },
  // 列
  columns: {
    type: Array,
    default: []
  }
})
// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: '请选择生成模板', trigger: 'blur' }],
  moduleName: [
    {
      required: true,
      message: '请输入生成模块名',
      trigger: 'blur',
      pattern: /^[A-Za-z]+$/
    }
  ],
  businessName: [
    {
      required: true,
      message: '请输入生成业务名',
      trigger: 'blur',
      pattern: /^[A-Za-z]+$/
    }
  ],
  functionName: [{ required: true, message: '请输入生成功能名', trigger: 'blur' }],
  permissionPrefix: {
    required: true,
    message: '请输入权限前缀',
    trigger: 'blur'
  },
  genType: [{ required: true, message: '请选择代码生成方式', trigger: 'blur' }],
  treeCode: [{ required: true, message: '请选择树编码字段', trigger: 'blur' }],
  treeParentCode: [{ required: true, message: '请选择树父编码字段', trigger: 'blur' }]
})
function tplSelectChange(value) {
  if (value !== 'sub') {
    props.info.subTables = [{ tableName: '', fkName: '' }]
    props.info.subTableName = ''
    props.info.subTableFkName = ''
  }
}
function clearParentMent(e) {
  if (e == null) {
    props.info.parentMenuId = 0
  }
}
/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  /** 查询菜单下拉列表 */
  listMenu({ menuTypeIds: 'M,C,L' }).then((response) => {
    menuOptions.value = response.data
  })
}
function checkedBtnSelect(value) {
  console.log(value)
}

// info 由 editTable 异步加载后整体替换，触发子表行初始化
watch(
  () => props.info,
  () => initSubTables(),
  { immediate: true }
)

getMenuTreeselect()
</script>

<style scoped>
.gen-info-form {
  padding-bottom: 2px;
}

.sort-field-item .mr10 {
  margin-right: 0 !important;
  min-width: 220px;
  flex: 1 1 220px;
}

.sub-table-row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.sub-table-select {
  flex: 1 1 180px;
  min-width: 160px;
}

.sub-fk-select {
  flex: 1 1 120px;
  min-width: 110px;
}

.relation-collapse {
  width: 100%;
  border-top: none;
}

.relation-collapse :deep(.el-collapse-item__header) {
  height: 32px;
  line-height: 32px;
}

.relation-collapse__title {
  font-size: 13px;
  color: var(--el-color-primary, #409eff);
}

.relation-graphs {
  display: grid;
  gap: 16px;
}

@media (max-width: 768px) {
  .gen-info-form :deep(.el-form-item__label) {
    width: 112px !important;
    padding-right: 8px;
  }

  .gen-info-form :deep(.el-form-item__content) {
    margin-left: 112px !important;
  }
}
</style>
