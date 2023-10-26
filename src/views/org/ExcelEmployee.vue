<template>
  <div class="home">
    <el-upload
        action="#"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :show-file-list="false"
    >
      <el-button type="primary">点击上传Excel文件</el-button>
    </el-upload>
<!--    id-->
<!--    username-->
<!--    password-->
<!--    email-->
<!--    headImage-->
<!--    age-->
<!--    department_id-->
<!--    phone-->


    <el-table
        :data="tableData"
        style="margin-top: 20px"
        border
        stripe
    >
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="password" label="密码"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="headImage" label="头像"></el-table-column>
      <el-table-column prop="age" label="年龄"></el-table-column>
      <el-table-column prop="department.name" label="部门"></el-table-column>
      <el-table-column prop="phone" label="手机"></el-table-column>
      <!-- 其他列 -->
    </el-table>

    <el-button style="margin-top: 20px" type="primary" @click="exportExcel">导出Excel</el-button>
  </div>
</template>

<script>
import FileSaver from "file-saver";
export default {
  data() {
    return {
      tableData: [], // 存储导入的数据
    };
  },
  methods: {
    beforeUpload(file) {
      console.log(file)

      const formData = new FormData();
      formData.append('file', file);
      console.log(formData)

      // 发送POST请求到后端的上传接口
      this.$http.post('/excel', formData,{
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
          .then(response => {
            console.log(response.data)
            // 处理上传成功的逻辑
          this.tableData=response.data.data

          })
          .catch(error => {
            // 处理上传失败的逻辑
            console.error('上传失败:', error);
          });

      return false; // 返回true表示允许上传，返回false表示取消上传
    },
    handleSuccess(response, file, fileList) {
      console.log(response); // 输出响应数据，查看是否有问题
      if (response.data.success) {
        this.tableData = response.data; // 数据字段名
      }
    },
    exportExcel() {
      // 调用后端导出接口
      this.$http
          .get("/excel", { responseType: "blob" }) // 设置响应类型为blob
          .then((response) => {
            if (response.status === 200) {
              let fileName = "exported.xlsx"; // 默认文件名

              const contentDisposition = response.headers["content-disposition"];
              if (contentDisposition) {
                const matches = contentDisposition.match(/filename=([^;]+)/);
                if (matches) {
                  fileName = decodeURI(matches[1]);
                }
              }

              const blob = new Blob([response.data], {
                type: "application/vnd.ms-excel",
              });

              // 使用FileSaver保存文件
              FileSaver.saveAs(blob, fileName);
            } else {
              this.$message.error("导出失败");
            }
          })
          .catch((error) => {
            console.error("导出错误", error);
            this.$message.error("导出失败");
          });
    },

  },
};
</script>

<style scoped>
.home {
  padding: 20px;
}
</style>