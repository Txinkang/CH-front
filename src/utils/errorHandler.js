import { ElMessageBox } from 'element-plus'

export const errorHandler = {
  /**
   * 统一处理错误信息
   * @param {string} title - 错误信息标题
   * @param {Error} error - 错误对象
   *
   */
  showError(title, error) {
    const url = error.config?.url || '未知路径'
    console.log(title + '：' + url, error)
    ElMessageBox.alert(title, {
      dangerouslyUseHTMLString: true,
      showClose: false,
      confirmButtonText: '确定'
    })
  }
}
