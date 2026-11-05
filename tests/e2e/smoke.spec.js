import { test, expect } from '@playwright/test'

/**
 * 冒烟用例不依赖后端：所有 /prod-api 请求统一返回成功空数据，
 * 只验证应用能正常启动、路由守卫与登录页关键元素可用。
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/prod-api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 200, msg: '', data: {} })
    })
  )
})

test('登录页正常渲染账号密码表单', async ({ page }) => {
  await page.goto('/login')

  await expect(page.locator('input[name="username"]')).toBeVisible()
  await expect(page.locator('input[name="password"]')).toBeVisible()
  await expect(page.locator('button.login-btn')).toBeVisible()
})

test('未登录访问首页会跳转登录页并带上回跳地址', async ({ page }) => {
  await page.goto('/index')

  await expect(page).toHaveURL(/\/login\?redirect=/)
  expect(decodeURIComponent(page.url())).toContain('redirect=/index')
})

test('未登录访问受保护路由同样被拦截', async ({ page }) => {
  await page.goto('/system/user')

  await expect(page).toHaveURL(/\/login\?redirect=/)
  expect(decodeURIComponent(page.url())).toContain('redirect=/system/user')
})

test('白名单路由无需登录即可访问', async ({ page }) => {
  await page.goto('/register')

  await expect(page).toHaveURL(/\/register/)
})
