import Cookies from 'js-cookie'

export const cookie = {
  set(key, data, expires) {
    Cookies.set(key, data, { expires: expires })
  },
  set(key, data) {
    Cookies.set(key, data)
  },
  remove(key) {
    Cookies.remove(key)
  },
  get(key) {
    Cookies.get(key)
  }
}

export const local = {
  set(key, data) {
    return localStorage.setItem(key, data)
  },
  remove(key) {
    return localStorage.removeItem(key)
  },
  get(key) {
    return localStorage.getItem(key)
  }
}