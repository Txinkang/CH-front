import { request } from './request.js'

export const userApi = {
    // 注册
    register(data) {
        return request({
            url: '/user/register',
            method: 'post',
            data: data
        })
    },
    // 登录
    login(data) {
        return request({
            url: '/user/login',
            method: 'post',
            data: data
        })
    },
    // 登出
    logout(data) {
        return request({
            url: '/user/logout',
            method: 'post',
            data: data
        })
    },
    // 获取用户信息
    getUserInfo(data) {
        return request({
            url: '/user/getUserInfo',
            method: 'get',
            params: data
        })
    },
    // 更新用户信息
    updateUser(data) {
        return request({
            url: '/user/updateUser',
            method: 'patch',
            data: data
        })
    },
    // 删除用户
    deleteUser(data) {
        return request({
            url: '/user/deleteUser',
            method: 'delete',
            params: data
        })
    }
}