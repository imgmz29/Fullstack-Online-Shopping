import Vue from 'vue'
import VueRouter from 'vue-router'
import App from '@/App.vue'
import CustomerScreen from '@/views/CustomerScreen.vue'
import OperatorScreen from '@/views/OperatorScreen.vue'
import StatusScreen from '@/views/StatusScreen.vue'
import ViewOrders from '@/views/ViewOrders.vue'
import Purchase from '@/views/Purchase.vue'
import PromotionCode from '@/views/PromotionCode.vue'
import ShoppingCart from '@/views/ShoppingCart.vue'
import ItemPage from '@/views/ItemPage.vue'
import Profile from '@/views/Profile.vue'
import Comment from '@/views/Comment.vue'
import AllOrders from '@/views/AllOrders.vue'
import AllItems from '@/views/AllItems.vue'
import AllOperators from '@/views/AllOperators.vue'


import { BootstrapVue, BootstrapVueIcons } from "bootstrap-vue"

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(BootstrapVueIcons)
Vue.use(VueRouter)

const router = new VueRouter({
  mode: "history",
  routes: [
    {
      path: "/comment/:orderId",
      component: Comment,
      props: ({ params: { orderId }}) => ({ orderId }),
    },
    {
      path: "/itempage/:itemId",
      component: ItemPage,
      props: ({ params: { itemId }}) => ({ itemId }),
    },
    {
      path: "/shoppingcart",
      component: ShoppingCart,
    },
    {
      path: "/purchase",
      component: Purchase,
    },
    {
      path: "/vieworders",
      component: ViewOrders,
    },
    {
      path: "/promotioncode",
      component: PromotionCode,
    },
    {
      path: "/profile",
      component: Profile,
    },
    {
      path: "/operator",
      component: OperatorScreen,
    },
    {
      path: "/customer",
      component: CustomerScreen,
    },
    {
      path: "/allorders",
      component: AllOrders,
    },
    {
      path: "/allitems",
      component: AllItems,
    },
    {
      path: "/alloperators",
      component: AllOperators,
    },
    {
      path: "/",
      component: StatusScreen,
    },
  ],
})

Vue.config.productionTip = false
Vue.config.devtools = true

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  render: h => h(App),
})
