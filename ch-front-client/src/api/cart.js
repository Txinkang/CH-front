import { request } from './request.js'

export const cartApi = {
    // 获取购物车
    getCart(data) {
        return request({
            url: '/user/getCart',
            method: 'get',
            params: data
        })
    },
    // 删除购物车
    deleteCart(data) {
        return request({
            url: '/user/deleteCart',
            method: 'delete',
            params: data
        })
    }
}