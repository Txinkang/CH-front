import { request } from './request.js'

export const announcementApi = {
    // 获取公告列表
    getAnnouncement(data) {
        return request({
            url: '/user/getAnnouncement',
            method: 'get',
            params: data
        })
    },
} 