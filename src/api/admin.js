import { request } from './request.js'

export const adminApi = {
    // 获取管理员信息列表
    getAdminInfo(data) {
        return request({
            url: '/admin/getAdminInfo',
            method: 'get',
            params: data
        })
    },
    // 创建管理员
    createAdmin(data) {
        return request({
            url: '/admin/createAdmin',
            method: 'post',
            data: data
        })
    },
    // 更新管理员信息
    updateAdmin(data) {
        return request({
            url: '/admin/updateAdmin',
            method: 'patch',
            data: data
        })
    },
    // 删除管理员
    deleteAdmin(data) {
        return request({
            url: '/admin/deleteAdmin',
            method: 'delete',
            params: data
        })
    }
} 