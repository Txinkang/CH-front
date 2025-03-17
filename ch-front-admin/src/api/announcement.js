import { request } from './request.js'

export const announcementApi = {
    // 获取公告列表
    getAnnouncement(data) {
        return request({
            url: '/admin/getAnnouncement',
            method: 'get',
            params: data
        })
    },
    // 创建公告
    addAnnouncement(data) {
        return request({
            url: '/admin/addAnnouncement',
            method: 'post',
            data: data
        })
    },
    // 更新公告
    updateAnnouncement(data) {
        return request({
            url: '/admin/updateAnnouncement',
            method: 'patch',
            data: data
        })
    },
    // 删除公告
    deleteAnnouncement(data) {
        return request({
            url: '/admin/deleteAnnouncement',
            method: 'delete',
            params: data
        })
    }
} 