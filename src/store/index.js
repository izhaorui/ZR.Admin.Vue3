import { createStore } from 'vuex'
import app from './modules/app'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import getters from './getters'
import socket from './modules/socket'

const store = createStore({
  modules: {
    app,
    user,
    tagsView,
    permission,
		settings,
		socket
  },
  getters
});


export default store