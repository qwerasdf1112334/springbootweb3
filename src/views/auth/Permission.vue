<template>
  <section>
    <!--高级搜索栏-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="queryData">
        <el-form-item>
          <el-input v-model="queryData.keyword" placeholder="权限名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getPermissions">查询</el-button>
        </el-form-item>

      </el-form>
    </el-col>

    <el-table
        :data="pageInfo.data"
        highlight-current-row
        v-loading="listLoading"
        @selection-change="selsChange"
        style="width: 100%;">

      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="名称" width="180" sortable>
      </el-table-column>

      <el-table-column prop="descs" label="描述" width="180" sortable>
      </el-table-column>

      <el-table-column prop="sn" label="sn" width="320" sortable>
      </el-table-column>

      <el-table-column prop="parent.name" label="父权限" width="120" sortable>
      </el-table-column>

      <el-table-column prop="url" label="请求路径" width="120" sortable>
      </el-table-column>

    </el-table>

    <!--分页条和删除全部-->
    <el-col :span="24" class="toolbar">
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="queryData.pageSize"
                     :total="pageInfo.total" style="float:right;">
      </el-pagination>
    </el-col>


   
  </section>
</template>

<script>
// 下面注释的内容是属于mock的内容我们要请求自己的接口 所以 不需要mock了
// 	import util from '../../common/js/util'
// 	//import NProgress from 'nprogress'
// 	import { getUserListPage, removeUser, batchRemoveUser, editUser, addUser } from '../../api/api';
//  No 'Access-Control-Allow-Origin
export default {
  data() {
    return {
      queryData: {
        keyword: '',
        pageSize: 10,
        currentPage: 1
      },
      pageInfo: {
        data: [],
        total: 0,
      },
      page: 1,
      listLoading: false,
      sels: [],//列表选中列
    }
  },
  methods: {
    // 获取上级部门列表
    getParents(){
      this.$http.get("/permission/parent")
          .then(res => {
            res = res.data
            if (res.success){
              this.deptTree = res.data
            }

          })
          .catch(res => {
          })
    },
   
   
    handleCurrentChange(val) {
      this.queryData.currentPage = val;
      this.getPermissions();
    },
    //获取用户列表
    getPermissions() {
      // 获取参数 - currentPage pageSize keyword
      // 发起请求
      this.$http.post("/permission", this.queryData)
          .then(res => {
            console.log(res)
            res = res.data
            if (res.success) {
              this.pageInfo = res.data
            } else {
              this.$message.error("网络异常请联系管理员");
            }
          })
          .catch(res => {
          })
    },
    //删除
    handleDel: function (index, row) {
      this.$confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true; // 加载框
        // 发送请求
        this.deletebyId(row.id)
      }).catch(() => {

      });
    },
    // 删除单条方法
    deletebyId(id) {
      // 发起请求
      this.$http.delete("/permission/" + id)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '删除成功', type: 'success'});
              this.listLoading = false; // 加载框
              this.queryData.currentPage = 1
              this.getPermissions()
            } else {
              this.$message.error("网络异常请联系管理员");
            }
          })
          .catch(res => {
          })
    },
    //显示编辑界面
    handleEdit: function (index, row) {
      this.saveFormVisible = true;
      var assign = Object.assign({}, row);
      this.saveForm = assign;
      if (!assign.parent) {
        this.saveForm.parent = {name: "", id: null}
      }
      if (!assign.manager) {
        this.saveForm.manager = {username: "", id: null}
      }
      // 父级部门回显
      console.log();
      if(this.saveForm.parent){
        var split = this.saveForm.path.split("/");
        var parents = []
        for (let i = 1; i < split.length-1; i++) {
          parents.push(parseInt(split[i]))
        }
        this.saveForm.parent = parents
      }
      // 查询主管列表
      this.getPermissions();
      // 查询上级部门列表
      this.getParents();
    },
    //显示新增界面
    handleAdd: function () {
      this.saveFormVisible = true;
      this.saveForm = {
        id: null,
        name: "",
        intro: "",
        manager: {
          id: null,
          username: ""
        },
        parent: {
          id: null,
          name: ""
        },
        state: ""
      };
      // 查询主管列表
      this.getPermissions();
      // 查询上级部门列表
      this.getParents();
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);
            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
            editUser(para).then((res) => {
              this.editLoading = false;
              //NProgress.done();
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.$refs['editForm'].resetFields();
              this.editFormVisible = false;
              this.getPermissions();
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      this.$refs.saveForm.validate((valid) => {
        if (valid) {
          this.$confirm('确认提交吗？', '提示', {}).then(() => {
            this.addLoading = true;
            // 发送 修改请求
            this.saveOrUpdate()
          });
        }
      });
    },
    // 新增或者是修改的方法
    saveOrUpdate() {
      var parent = this.saveForm.parent;
      if (parent){
        this.saveForm.parent = {
          id: parent[parent.length-1]
        }
      }else{
        this.saveForm.parent = {
          id: null
        }
      }

      this.$http.put("/permission", this.saveForm)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '保存成功', type: 'success'});
              this.queryData.currentPage = 1
              this.getPermissions()
              this.saveFormVisible = false;
              this.addLoading = false
            } else {
              this.$message.error("网络异常请联系管理员");
            }
          })
          .catch(res => {
          })
    },
    selsChange: function (sels) {
      var ids = sels.map(x => x.id)
      this.sels = ids;
    },
    //批量删除
    batchRemove: function () {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm('确认删除选中记录吗？', '提示', {
        type: 'warning'
      }).then(() => {
        this.listLoading = true;
        //NProgress.start();

        // 批量删除的方法
        this.batchDelete()
      }).catch(() => {

      });
    },
    batchDelete() {
      console.log(this.sels)
      // 发起请求
      this.$http.patch("/permission", this.sels)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '删除成功', type: 'success'});
              this.listLoading = false; // 加载框
              this.queryData.currentPage = 1
              this.getPermissions()
            } else {
              this.$message.error("网络异常请联系管理员");
            }
          })
          .catch(res => {
          })
    }
  },

  mounted() {
    this.getPermissions();
  }

}

</script>

<style scoped>

</style>