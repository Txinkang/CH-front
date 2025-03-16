import { request } from './request.js'

export const forumApi = {
    // 获取帖子列表
    getPost(data) {
        return request({
            url: '/admin/getPost',
            method: 'get',
            params: data
        })
    },
    // 创建帖子
    addPost(data) {
        return request({
            url: '/admin/addPost',
            method: 'post',
            data: data
        })
    },
    // 更新帖子
    updatePost(data) {
        return request({
            url: '/admin/updatePost',
            method: 'patch',
            data: data
        })
    },
    // 删除帖子
    deletePost(data) {
        return request({
            url: '/admin/deletePost',
            method: 'delete',
            params: data
        })
    }
} 