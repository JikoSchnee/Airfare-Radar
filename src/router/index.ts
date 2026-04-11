import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import MapView from '@/views/MapView.vue';
import BlindBoxView from '@/views/BlindBoxView.vue';
import DetailView from '@/views/DetailView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
    },
    {
      path: '/blindbox',
      name: 'blindbox',
      component: BlindBoxView,
    },
    {
      path: '/blind-box',
      redirect: '/blindbox',
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailView,
    },
  ],
});

export default router;
