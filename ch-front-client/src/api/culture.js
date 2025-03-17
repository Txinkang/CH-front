// src/api/culture.js
import { request } from './request.js'

export const cultureApi = {
    // 获取非遗文化列表
    getProject (params) {
        return request({
            url: '/user/getProject',
            method: 'get',
            params: params
        })
    },
    // 非遗文化申请
    HeritageApplication (params) {
        return request({
            url: '/user/heritageApplication',
            method: 'post',
            data: params
        })
    },
    // 删除非遗文化
    deleteProject(data) {
        return request({
            url: '/user/deleteProject',
            method: 'delete',
            params: data
        })
    }
}