import router from './router/router'
import store from './store/store'
import jsCookie from 'js-cookie'
import { reqUserInfo } from '@/api/user/user.js'

router.beforeEach(async (to, from, next) => {
    const currentPath = to.path
    const token = jsCookie.get('token')
    if (token) {
        if (currentPath === '/login') {
            // 如果是进入登录页面不需要进行校验
            next()
        } else {
            // 权限控制部分 判断用户信息是否已经有了，如果没有，进行获取和添加路由等操作
            if (store.state.user.roles.length === 0) {
                try {
                    const userInfo = await reqUserInfo()
                    /**
                     * @des  这里为什么要加一个 信息请求接口 而不是放登录接口 主要目的是为了保证存 store 中的数据在刷新的时候重新请求 不丢失
                     * 一般这些数据是比较多的，放cookie中存储又不利于操作
                     */
                    await store.dispatch('user/actionSetUserInfo', userInfo.data)
                    next({ ...to, replace: true })
                } catch (error) {
                    /* 没有获取到信息，即可能登录超时，无法获取用户信息，所以跳转登录页面 */
                    next({ path: '/login' })
                    console.error('beforeEach catch error【in navigationGuard.js】:', error)
                }
            } else {
                next()
            }
        }
    } else {
        /* 这里还有可能是其它的一些路由地址  这里目前只有登录地址 所以直接判断 */
        /* 这里即使只有登录 也要判断 不能直接 next({ path: '/login' }) 防止死循环 */
        if (currentPath === '/login') {
            next()
        } else {
            next({ path: '/login' })
        }
    }
})
