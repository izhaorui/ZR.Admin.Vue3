<template>
  <div class="relation-graph" v-if="mainTable || subTable">
    <div class="relation-graph__header">
      <el-icon><Connection /></el-icon>
      <span>表关系预览</span>
    </div>
    <div class="relation-graph__body">
      <!-- 主表 -->
      <div class="relation-table relation-table--main" v-if="mainTable">
        <div class="relation-table__header">
          <el-tag size="small" type="primary">主表</el-tag>
          <span class="relation-table__name">{{ mainTable.tableName }}</span>
          <span class="relation-table__comment" v-if="mainTable.tableComment">{{ mainTable.tableComment }}</span>
        </div>
        <div class="relation-table__columns">
          <div
            v-for="col in mainTableColumns"
            :key="col.columnId || col.csharpField"
            class="relation-column"
            :class="{ 'relation-column--pk': isPk(col), 'relation-column--fk': isFk(col, fkName) }">
            <span class="relation-column__icon">
              <el-icon v-if="isPk(col)" color="#e6a23c"><Key /></el-icon>
              <el-icon v-else-if="isFk(col, fkName)" color="#409eff"><Link /></el-icon>
              <el-icon v-else><Document /></el-icon>
            </span>
            <span class="relation-column__name">{{ col.csharpField }}</span>
            <span class="relation-column__type">{{ col.csharpType }}</span>
            <span class="relation-column__comment" v-if="col.columnComment">{{ col.columnComment }}</span>
          </div>
          <div v-if="!mainTableColumns.length" class="relation-table__empty">暂无字段信息</div>
        </div>
      </div>

      <!-- 连接线 -->
      <div class="relation-connector" v-if="mainTable && subTable">
        <div class="relation-connector__line"></div>
        <div class="relation-connector__label">
          <span class="relation-connector__cardinality">1</span>
          <span class="relation-connector__fk" v-if="fkName">{{ fkName }}</span>
          <span class="relation-connector__cardinality">N</span>
        </div>
        <div class="relation-connector__arrow">▶</div>
      </div>

      <!-- 子表 -->
      <div class="relation-table relation-table--sub" v-if="subTable">
        <div class="relation-table__header">
          <el-tag size="small" type="success">子表</el-tag>
          <span class="relation-table__name">{{ subTable.tableName }}</span>
          <span class="relation-table__comment" v-if="subTable.tableComment">{{ subTable.tableComment }}</span>
        </div>
        <div class="relation-table__columns">
          <div
            v-for="col in subTableColumns"
            :key="col.columnId || col.csharpField"
            class="relation-column"
            :class="{ 'relation-column--pk': isPk(col), 'relation-column--fk': isFk(col, fkName) }">
            <span class="relation-column__icon">
              <el-icon v-if="isPk(col)" color="#e6a23c"><Key /></el-icon>
              <el-icon v-else-if="isFk(col, fkName)" color="#409eff"><Link /></el-icon>
              <el-icon v-else><Document /></el-icon>
            </span>
            <span class="relation-column__name">{{ col.csharpField }}</span>
            <span class="relation-column__type">{{ col.csharpType }}</span>
            <span class="relation-column__comment" v-if="col.columnComment">{{ col.columnComment }}</span>
          </div>
          <div v-if="!subTableColumns.length" class="relation-table__empty">暂无字段信息</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Connection, Key, Link, Document } from '@element-plus/icons-vue'

const props = defineProps({
  mainTable: {
    type: Object,
    default: null
  },
  mainTableColumns: {
    type: Array,
    default: () => []
  },
  subTable: {
    type: Object,
    default: null
  },
  subTableColumns: {
    type: Array,
    default: () => []
  },
  fkName: {
    type: String,
    default: ''
  }
})

function isPk(col) {
  return col.isPk == 1 || col.isPk === true || col.columnKey === 'PRI'
}

function isFk(col, fkName) {
  return fkName && col.csharpField === fkName
}
</script>

<style scoped>
.relation-graph {
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  border-radius: 8px;
  padding: 16px;
  background: var(--el-fill-color-lighter, #fafafa);
}

.relation-graph__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary, #303133);
}

.relation-graph__body {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.relation-table {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.relation-table--main {
  border-top: 3px solid var(--el-color-primary, #409eff);
}

.relation-table--sub {
  border-top: 3px solid var(--el-color-success, #67c23a);
}

.relation-table__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--el-fill-color-light, #f5f7fa);
  border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
  flex-wrap: wrap;
}

.relation-table__name {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary, #303133);
}

.relation-table__comment {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
}

.relation-table__columns {
  max-height: 280px;
  overflow-y: auto;
}

.relation-column {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  border-bottom: 1px solid var(--el-border-color-extra-light, #f2f6fc);
  transition: background 0.2s;
}

.relation-column:hover {
  background: var(--el-fill-color-light, #f5f7fa);
}

.relation-column--pk {
  background: #fdf6ec;
}

.relation-column--pk:hover {
  background: #faecd8;
}

.relation-column--fk {
  background: #ecf5ff;
}

.relation-column--fk:hover {
  background: #d9ecff;
}

.relation-column__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 14px;
}

.relation-column__name {
  font-weight: 500;
  color: var(--el-text-color-primary, #303133);
  min-width: 80px;
}

.relation-column__type {
  font-size: 12px;
  color: var(--el-text-color-secondary, #909399);
  font-family: 'Consolas', 'Monaco', monospace;
}

.relation-column__comment {
  font-size: 12px;
  color: var(--el-text-color-placeholder, #a8abb2);
  margin-left: auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.relation-table__empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder, #a8abb2);
}

/* 连接线 */
.relation-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 20px 4px;
  position: relative;
}

.relation-connector__line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--el-border-color, #dcdfe6);
}

.relation-connector__label {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--el-fill-color-lighter, #fafafa);
  padding: 4px 8px;
  border-radius: 4px;
}

.relation-connector__cardinality {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-text-color-secondary, #909399);
}

.relation-connector__fk {
  font-size: 11px;
  color: var(--el-color-primary, #409eff);
  font-family: 'Consolas', 'Monaco', monospace;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-connector__arrow {
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: var(--el-border-color, #dcdfe6);
}

@media (max-width: 768px) {
  .relation-graph__body {
    flex-direction: column;
  }

  .relation-connector {
    flex-direction: row;
    min-width: 0;
    min-height: 40px;
    padding: 4px 0;
  }

  .relation-connector__line {
    top: 0;
    bottom: 0;
    left: 50%;
    right: auto;
    width: 2px;
    height: 100%;
  }

  .relation-connector__arrow {
    bottom: -2px;
    top: auto;
    right: 50%;
    transform: translateX(50%) rotate(90deg);
  }
}
</style>
