// src/api/application.js
import { request } from './request.js'

export const applicationApi = {
    // 获取申请列表
    getApplications(data) {
        return request({
            url: '/admin/getApplication',
            method: 'get',
            params: data
        })
    },
    // 审核申请
    auditApplication(data) {
        return request({
            url: '/admin/auditApplication',
            method: 'post',
            data: data
        })
    }
}