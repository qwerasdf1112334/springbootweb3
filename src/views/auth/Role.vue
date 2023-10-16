<template>
  <section>
    <!--高级搜索栏-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="queryData">
        <el-form-item>
          <el-input v-model="queryData.keyword" placeholder="部门名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getRoles">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <!--
      private Long id;
      private String name;
      private String intro;
      private Date createTime;
      private Date updateTime;
      private Role manager;
      private Role parent;
      private String path;
      private Integer state;
    -->
    <!--表格-->
    <!--
      users : tableData
      @selection-change="selsChange": 表格的多选列
      sortable:  排序
    -->
    <el-table
        :data="pageInfo.data"
        highlight-current-row
        v-loading="listLoading"
        @selection-change="selsChange"
        style="width: 100%;">
      <el-table-column type="selection" width="55">
      </el-table-column>
      <el-table-column type="index" width="60">
      </el-table-column>
      <el-table-column prop="name" label="名称" width="120" sortable>
      </el-table-column>

      <el-table-column prop="sn" label="sn" width="120" sortable>
      </el-table-column>







      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页条和删除全部-->
    <el-col :span="24" class="toolbar">
      <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="queryData.pageSize"
                     :total="pageInfo.total" style="float:right;">
      </el-pagination>
    </el-col>


    <!--新增/编辑界面-->
    <!--
      对话框的显式  也是一个 布尔值控制的 但是不能使用 v-model 进行绑定
      :visible.sync 这个属性是控制对话框显式的
    -->
    <el-dialog title="新增/修改" :visible.sync="saveFormVisible" :close-on-click-modal="false">
      <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="saveForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="intro">
          <el-input v-model="saveForm.intro" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="部门主管" prop="manager">
          <el-select v-model="saveForm.manager" clearable value-key="id" placeholder="请选择">
            <!--下拉选项
              v-model="saveForm.manager"  我的下拉框绑定的是 管理员对象 而不是管理的id
              clearable : 可清除的
              roles : 员工数组
              :key="item.id" 这个option的唯一标识符
              :label="item.username" 下拉框显式的数据
              :value="item" 就是整个对象
            -->
            <el-option
                v-for="item in roles"
                :key="item.id"
                :label="item.username"
                :value="item">
              <span style="float: left">{{ item.username }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上级部门">
          <el-cascader v-model="saveForm.parent"
                       :options="deptTree"
                       :props="{
							   checkStrictly: true,
							   label:'name',
							   value:'id'
							}"
                       clearable></el-cascader>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-input v-model="saveForm.state" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>


      <div slot="footer" class="dialog-footer">
        <el-button @click.native="addFormVisible = false">取消</el-button>
        <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
      </div>
    </el-dialog>
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
      roles:[],
      deptTree:[],
      saveFormVisible: false,
      saveForm: {
        id: null,
        name: "",
        intro: "",
        manager: {
          id: null,
          username: ""
        },
        parent: {
          id: null,
          name: "",
          path:"",
        },

        state: ""
      },
      saveFormRules: {
        name: [
          {required: true, message: '请输入部门名称', trigger: 'blur'}
        ]
      },
      addFormVisible: false,//新增界面是否显示
      addLoading: false,

      //新增界面数据
      addForm: {
        name: '',
        sex: -1,
        age: 0,
        birth: '',
        addr: ''
      }

    }
  },
  methods: {
    // 获取上级部门列表
    getParents(){
      this.$http.get("/role/parent")
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
      this.getRoles();
    },
    //获取用户列表
    getRoles() {
      // 获取参数 - currentPage pageSize keyword
      // 发起请求
      this.$http.post("/role", this.queryData)
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
      this.$http.delete("/role/" + id)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '删除成功', type: 'success'});
              this.listLoading = false; // 加载框
              this.queryData.currentPage = 1
              this.getRoles()
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
      this.getRoles();
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
      this.getRoles();
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
              this.getRoles();
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

      this.$http.put("/role", this.saveForm)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '保存成功', type: 'success'});
              this.queryData.currentPage = 1
              this.getRoles()
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
      this.$http.patch("/role", this.sels)
          .then(res => {
            res = res.data
            if (res.success) {
              this.$message({message: '删除成功', type: 'success'});
              this.listLoading = false; // 加载框
              this.queryData.currentPage = 1
              this.getRoles()
            } else {
              this.$message.error("网络异常请联系管理员");
            }
          })
          .catch(res => {
          })
    }
  },

  mounted() {
    this.getRoles();
  }

}

</script>

<style scoped>

</style>