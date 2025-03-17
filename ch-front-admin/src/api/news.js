import { request } from './request.js'

export const newsApi = {
    // 获取资讯列表
    getNews(data) {
        return request({
            url: '/admin/getNew',
            method: 'get',
            params: data
        })
    },
    // 创建资讯
    addNews(data) {
        return request({
            url: '/admin/addNew',
            method: 'post',
            data: data
        })
    },
    // 更新资讯
    updateNews(data) {
        return request({
            url: '/admin/updateNew',
            method: 'patch',
            data: data
        })
    },
    // 删除资讯
    deleteNews(data) {
        return request({
            url: '/admin/deleteNew',
            method: 'delete',
            params: data
        })
    }
} 