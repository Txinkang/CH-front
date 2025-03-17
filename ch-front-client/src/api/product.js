import { request } from './request.js'

export const productApi = {
    // 获取商品列表
    getProduct(data) {
        return request({
            url: '/user/getProduct',
            method: 'get',
            params: data
        })
    },

    // 获取商品评价
    getProductComment(data) {
        return request({
            url: '/user/getProductComment',
            method: 'get',
            params: data
        })
    },

    // 获取商品简介
    getDescription(data) {
        return request({
            url: '/user/getDescription',
            method: 'get',
            params: data
        })
    },

    // 加入购物车
    addCart(data) {
        return request({
            url: '/user/addCart',
            method: 'post',
            data: data
        })
    },

    // 购买商品
    buyProduct(data) {
        return request({
            url: '/user/pay',
            method: 'post',
            data: data
        })
    }
} 