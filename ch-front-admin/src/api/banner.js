import { request } from './request.js'

export const bannerApi = {
    // 获取轮播图列表
    getBanner(data) {
        return request({
            url: '/admin/getBanner',
            method: 'get',
            params: data
        })
    },
    // 创建轮播图
    addBanner(data) {
        return request({
            url: '/admin/addBanner',
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    // 更新轮播图
    updateBanner(data) {
        return request({
            url: '/admin/updateBanner',
            method: 'patch',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    // 删除轮播图
    deleteBanner(data) {
        return request({
            url: '/admin/deleteBanner',
            method: 'delete',
            params: data
        })
    }
} 