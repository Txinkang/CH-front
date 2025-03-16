import { request } from './request.js'

export const userApi = {
    // 登录
    login(data) {
        return request({
            url: '/admin/login',
            method: 'post',
            data: data
        })
    },
    // 登出
    logout(data) {
        return request({
            url: '/admin/logout',
            method: 'post',
            data: data
        })
    },
    // 获取用户信息
    getUserInfo(data) {
        return request({
            url: '/admin/getUserInfo',
            method: 'get',
            params: data
        })
    },
    // 更新用户信息
    updateUser(data) {
        return request({
            url: '/admin/updateUser',
            method: 'patch',
            data: data
        })
    },
    // 删除用户
    deleteUser(data) {
        return request({
            url: '/admin/deleteUser',
            method: 'delete',
            params: data
        })
    }
}