import { request } from './request.js'

export const bannerApi = {
    // 获取轮播图列表
    getBanner() {
        return request({
            url: '/user/getBanner',
            method: 'get',
        })
    }
} 