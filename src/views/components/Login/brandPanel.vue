<template>
  <div class="brand-panel">
    <div class="brand-inner">
      <div class="brand-logo">
        <span class="logo-mark">LOGO</span>
      </div>
      <h1 class="brand-title">{{ defaultSettings.title }}</h1>
      <p class="brand-subtitle">现代化企业级后台管理框架</p>
      <ul class="brand-features">
        <li>
          <svg viewBox="0 0 24 24" class="feat-icon"><path d="M20 6L9 17l-5-5" /></svg>
          <span>前后端分离架构，开箱即用</span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" class="feat-icon"><path d="M20 6L9 17l-5-5" /></svg>
          <span>完善的权限与SaaS多租户体系</span>
        </li>
        <li>
          <svg viewBox="0 0 24 24" class="feat-icon"><path d="M20 6L9 17l-5-5" /></svg>
          <span>可视化代码生成，高效开发</span>
        </li>
      </ul>
    </div>
    <div class="brand-glow brand-glow-1"></div>
    <div class="brand-glow brand-glow-2"></div>
  </div>
</template>

<script setup name="brandPanel">
import defaultSettings from '@/settings'
</script>

<style scoped lang="scss">
@use '@/assets/styles/login.scss';
</style>
