<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :lg="12">
        <el-form-item prop="tplCategory">
          <template #label>生成模板</template>
          <el-select v-model="info.tplCategory" @change="tplSelectChange">
            <el-option label="单表（增删改查）" value="crud" />
            <!-- <el-option label="单表查询" value="select" /> -->
            <el-option label="树表（增删改查）" value="tree" />
            <el-option label="导航查询(1对1)" value="subNav"></el-option>
            <el-option label="导航查询(1对多)" value="subNavMore"></el-option>
            <!-- <el-option label="主子表（增删改查）" value="sub" /> -->
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="baseNameSpace">
          <template #label>
            生成命名空间前缀
            <el-tooltip content="比如 ZR." placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.baseNameSpace" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="moduleName">
          <template #label>
            生成模块名
            <el-tooltip content="可理解为子系统名，例如 system、user、tool（一般文件夹归类）" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.moduleName" auto-complete="" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="businessName">
          <template #label>
            生成业务名
            <el-tooltip content="可理解为功能英文名，例如 user" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.businessName" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item prop="functionName">
          <template #label>
            生成功能名
            <el-tooltip content="用作类描述，例如 用户,代码生成,文章系统" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.functionName" />
        </el-form-item>
      </el-col>

      <el-col :lg="12">
        <el-form-item>
          <template #label>
            上级菜单
            <el-tooltip content="分配到指定菜单下，例如 系统管理" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-cascader
            class="w100"
            :options="menuOptions"
            :props="{ checkStrictly: true, value: 'menuId', label: 'menuName', emitPath: false }"
            placeholder="请选择上级菜单"
            clearable
            v-model="info.parentMenuId">
            <template #default="{ node, data }">
              <span>{{ data.menuName }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item label="默认查询排序字段">
          <el-select v-model="info.sortField" placeholder="请选择字段" class="mr10" clearable="">
            <el-option v-for="item in columns" :key="item.columnId" :label="item.csharpField" :value="item.csharpField"> </el-option>
          </el-select>

          <el-radio v-model="info.sortType" label="asc">正序</el-radio>
          <el-radio v-model="info.sortType" label="desc">倒序</el-radio>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="permissionPrefix">
          <template #label>
            权限前缀
            <el-tooltip content="eg：system:user:add中的'system:user'" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.permissionPrefix" placeholder="请输入权限前缀"></el-input>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="genType">
          <template #label>
            生成代码方式
            <el-tooltip content="默认为zip压缩包下载" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-radio v-model="info.genType" label="0">zip压缩包</el-radio>
          <el-radio v-model="info.genType" label="1">自定义路径</el-radio>
        </el-form-item>
      </el-col>

      <el-col :lg="24" v-if="info.genType == '1'">
        <el-form-item prop="genPath">
          <template #label>
            自定义路径
            <el-tooltip content="填写磁盘绝对路径，若不填写，则生成到当前Web项目下" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-input v-model="info.genPath"></el-input>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item prop="colNum" label="一行显示列">
          <el-radio v-model="info.colNum" :label="12">2列</el-radio>
          <el-radio v-model="info.colNum" :label="24">1列</el-radio>
        </el-form-item>
      </el-col>
      <el-col :lg="24" v-show="info.tplCategory != 'select'">
        <el-form-item label="显示按钮">
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
          </el-checkbox-group>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row v-show="info.tplCategory == 'tree'">
      <h4 class="form-header">其他信息</h4>
      <el-col :lg="12">
        <el-form-item>
          <template #label>
            树编码字段
            <el-tooltip content="树显示的编码字段名， 如：dept_id" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.treeCode" placeholder="请选择树编码字段">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.csharpField + '：' + column.columnComment"
              :value="column.csharpField"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item>
          <template #label>
            树父编码字段
            <el-tooltip content="树显示的父编码字段名， 如：parent_Id" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.treeParentCode" placeholder="请选择树父编码字段">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.csharpField + '：' + column.columnComment"
              :value="column.csharpField"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item>
          <template #label>
            树名称字段
            <el-tooltip content="树节点的显示名称字段名， 如：dept_name" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.treeName" placeholder="请选择树名称字段">
            <el-option
              v-for="(column, index) in columns"
              :key="index"
              :label="column.csharpField + '：' + column.columnComment"
              :value="column.csharpField"></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
    <el-row v-show="info.tplCategory == 'sub' || info.tplCategory == 'subNav' || info.tplCategory == 'subNavMore'">
      <el-col :lg="24">
        <h4 class="form-header">关联信息</h4>
      </el-col>

      <el-col :lg="12">
        <el-form-item>
          <template #label>
            关联子表的表名
            <el-tooltip content="关联子表的表名， 如：sys_user" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.subTableName" filterable placeholder="请选择" @change="subSelectChange(this)">
            <el-option v-for="(table, index) in tables" :key="index" :label="table.tableName + '：' + table.tableComment" :value="table.tableName">
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :lg="12">
        <el-form-item>
          <template #label>
            子表关联的外键名
            <el-tooltip content="子表关联的外键名， 如：user_id" placement="top">
              <el-icon>
                <question-filled />
              </el-icon>
            </el-tooltip>
          </template>
          <el-select v-model="info.subTableFkName">
            <el-option v-for="(column, index) in subColumns" :key="index" :label="column.csharpField" :value="column.csharpField">
              <span style="float: left">{{ column.csharpField }}</span>
              <span style="float: right">{{ column.columnComment }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup name="genInfoForm">
import { listMenu } from '@/api/system/menu'
import { queryColumnInfo } from '@/api/tool/gen'

const subColumns = ref([])
const menuOptions = ref([])

const props = defineProps({
  info: {
    type: Object,
    default: null,
  },
  // 字表
  tables: {
    type: Array,
    default: null,
  },
  // 列
  columns: {
    type: Array,
    default: [],
  },
})
// 表单校验
const rules = ref({
  tplCategory: [{ required: true, message: '请选择生成模板', trigger: 'blur' }],
  moduleName: [
    {
      required: true,
      message: '请输入生成模块名',
      trigger: 'blur',
      pattern: /^[A-Za-z]+$/,
    },
  ],
  businessName: [
    {
      required: true,
      message: '请输入生成业务名',
      trigger: 'blur',
      pattern: /^[A-Za-z]+$/,
    },
  ],
  functionName: [{ required: true, message: '请输入生成功能名', trigger: 'blur' }],
  permissionPrefix: {
    required: true,
    message: '请输入权限前缀',
    trigger: 'blur',
  },
})
function subSelectChange(value) {
  props.info.subTableFkName = ''
}
function tplSelectChange(value) {
  if (value !== 'sub') {
    props.info.subTableName = ''
    props.info.subTableFkName = ''
  }
}
function setSubTableColumns(value) {
  if (value == null || value == undefined || value == '') {
    return
  }
  for (var item in props.tables) {
    const obj = props.tables[item]
    if (value === obj.tableName) {
      queryColumnInfo(obj.tableId).then((res) => {
        if (res.code == 200) {
          subColumns.value = res.data.columns
        }
      })
      break
    }
  }
}
/** 查询菜单下拉树结构 */
function getMenuTreeselect() {
  /** 查询菜单下拉列表 */
  listMenu({ menuTypeIds: 'M,C' }).then((response) => {
    menuOptions.value = response.data
  })
}
function checkedBtnSelect(value) {
  console.log(value)
}
watch(
  () => props.info.subTableName,
  (val) => {
    setSubTableColumns(val)
  },
)

getMenuTreeselect()
</script>
