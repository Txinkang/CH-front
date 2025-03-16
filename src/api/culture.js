// src/api/culture.js
import { request } from './request.js'

export const cultureApi = {
    // 获取非遗文化列表
    getCultures(data) {
        return request({
            url: '/admin/getProject',
            method: 'get',
            params: data
        })
    },
    // 更新非遗文化
    updateCulture(data) {
        return request({
            url: '/admin/updateProject',
            method: 'patch',
            data: data,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    },
    // 删除非遗文化
    deleteCulture(data) {
        return request({
            url: '/admin/deleteProject',
            method: 'delete',
            params: data
        })
    }
}