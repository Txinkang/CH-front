import { request } from './request.js'

export const forumApi = {
    // 获取帖子列表
    getPost(data) {
        return request({
            url: '/user/getPost',
            method: 'get',
            params: data
        })
    },
    // 获取帖子评论
    getComment(data) {
        return request({
            url: '/user/getComment',
            method: 'get',
            params: data
        })
    },
    // 发送评论
    sendComment(data) {
        return request({
            url: '/user/sendComment',
            method: 'post',
            data: data
        })
    }
} 