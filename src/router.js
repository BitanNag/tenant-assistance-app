import { createRouter, createWebHistory } from "vue-router";
import Home from './components/Home.vue';
import Form from './components/Form.vue'


const routes = [
    {
        name:'Home',
        component:Home,
        path:'/'
    },
    {
        name:'Form',
        component:Form,
        path:'/form'
    }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router;