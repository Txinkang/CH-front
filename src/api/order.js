// src/api/order.js
import { request } from './request.js'

export const orderApi = {
    // 获取订单列表
    getOrders(data) {
        return request({
            url: '/admin/getOrder',
            method: 'get',
            params: data
        })
    }
}