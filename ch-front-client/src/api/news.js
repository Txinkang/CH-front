import { request } from './request.js'

export const newsApi = {
    // 获取资讯列表
    getNews(data) {
        return request({
            url: '/user/getNew',
            method: 'get',
            params: data
        })
    },
} 