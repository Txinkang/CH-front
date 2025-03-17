import { request } from './request.js'

export const productApi = {
    // 获取商品列表
    getProduct(data) {
        return request({
            url: '/admin/getProduct',
            method: 'get',
            params: data
        })
    },
    // 创建商品
    addProduct(data) {
        return request({
            url: '/admin/addProduct',
            method: 'post',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    // 更新商品
    updateProduct(data) {
        return request({
            url: '/admin/updateProduct',
            method: 'patch',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    // 删除商品
    deleteProduct(data) {
        return request({
            url: '/admin/deleteProduct',
            method: 'delete',
            params: data
        })
    },
    // 获取商品评价
    getProductComments(data) {
        return request({
            url: '/admin/getProductComments',
            method: 'get',
            params: data
        })
    }
} 