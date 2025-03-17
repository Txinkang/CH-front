import { request } from './request.js'

export const myApi = {
    // 获取用户信息
    getUserInfo(data) {
        return request({
            url: '/user/getUserInfo',
            method: 'get',
            params: data
        })
    },
    // 修改用户信息
    updateUserInfo(data) {
        return request({
            url: '/user/updateUserInfo',
            method: 'patch',
            data: data
        })
    },
    // 充值
    recharge(data) {
        return request({
            url: '/user/recharge',
            method: 'get',
            params: data
        })
    },
    // 获取用户非遗项目
    getSelfProject(data) {
        return request({
            url: '/user/getSelfProject',
            method: 'get',
            params: data
        })
    },
    // 获取用户非遗项目失败原因
    getFailReason(data) {
        return request({
            url: '/user/getFailReason',
            method: 'get',
            params: data
        })
    },
    // 删除用户非遗项目
    deleteProject(data) {
        return request({
            url: '/user/deleteProject',
            method: 'delete',
            params: data
        })
    },
    // 重新申请非遗项目
    retryApplication(data) {
        return request({
            url: '/user/retryApplication',
            method: 'get',
            params: data
        })
    },
    // 更新用户非遗项目
    updateProject(data) {
        return request({
            url: '/user/updateProject',
            method: 'patch',
            data: data
        })
    },
    // 获取订单列表
    getOrders(data) {
        return request({
            url: '/user/getOrder',
            method: 'get',
            params: data
        })
    },
    // 获取订单详情
    evaluateProduct(data) {
        return request({
            url: '/user/evaluateProduct',
            method: 'post',
            data: data
        })
    }

}