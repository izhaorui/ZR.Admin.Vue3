const sessionCache = {
  set(key, value) {
    if (!sessionStorage) {
      return
    }
    if (key != null && value != null) {
      sessionStorage.setItem(key, value)
    }
  },
  get(key) {
    if (!sessionStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return sessionStorage.getItem(key)
  },
  setJSON(key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON(key) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove(key) {
    sessionStorage.removeItem(key);
  }
}
const localCache = {
  set(key, value) {
    if (!localStorage) {
      return
    }
    if (key != null && value != null) {
      localStorage.setItem(key, value)
    }
  },
  get(key) {
    if (!localStorage) {
      return null
    }
    if (key == null) {
      return null
    }
    return localStorage.getItem(key)
  },
  setJSON(key, jsonValue) {
    if (jsonValue != null) {
      this.set(key, JSON.stringify(jsonValue))
    }
  },
  getJSON(key) {
    const value = this.get(key)
    if (value != null) {
      return JSON.parse(value)
    }
  },
  remove(key) {
    localStorage.removeItem(key);
  }
}
import Cookies from 'js-cookie'

// cookie 统一属性：全站路径 + 同站携带；仅 HTTPS 下加 Secure，
// 否则本地 http://localhost 或局域网 IP 调试时浏览器会直接拒收该 cookie
function cookieOptions() {
  return {
    path: '/',
    sameSite: 'Lax',
    secure: window.location.protocol === 'https:'
  }
}

const cookie = {
  set(key, data, expires) {
    const options = cookieOptions()
    if (expires !== undefined && expires !== null) {
      options.expires = expires
    }
    Cookies.set(key, data, options)
  },
  remove(key) {
    // 删除时只需 path 对齐（path 不一致会删不掉）
    Cookies.remove(key, { path: '/' })
  },
  get(key) {
    return Cookies.get(key)
  }
}
export default {
  /**
   * 会话级缓存
   */
  session: sessionCache,
  /**
   * 本地缓存
   */
  local: localCache,
  /**
   * cookie存储
   */
  cookie: cookie
}