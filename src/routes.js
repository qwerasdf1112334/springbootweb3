import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
// 导入自己的组件
import Department from "./views/org/Department";
import OrgEmployee from "./views/org/OrgEmployee";
import Permission from "./views/auth/Permission";
import Role from "./views/auth/Role";
import NotPermission from "./views/403"
import Excel from "./views/org/ExcelEmployee"


let routes = [
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        leaf: true,
        children: [
            { path: '/echarts', component: echarts, name: '首页' },
            { path: '/403', component: NotPermission, name: '无权限访问' ,hidden:true }
        ]
    },
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '组织机构管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/dept', component: Department, name: '部门管理' },
            { path: '/orgEmployee', component: OrgEmployee, name: '员工管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '权限管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/permission', component: Permission, name: '权限管理' },
            { path: '/role', component: Role, name: '角色管理' },
            { path: '/excel', component: Excel, name: 'excel导入导出' },

        ]
    },
    {
        path: '/',
        component: Home,
        name: '导航二',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/page4', component: Page4, name: '页面4' },
            { path: '/page5', component: Page5, name: '页面5' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'fa fa-address-card',
        leaf: true,//只有一个节点 leaf叶子
        children: [
            { path: '/page6', component: Page6, name: '导航三' }
        ]
    },

    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;