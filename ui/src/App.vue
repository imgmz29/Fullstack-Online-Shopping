<template>
  <div>
    <b-navbar toggleable="lg" type="dark" :variant="user?.roles?.includes('operator') ? 'info' : 'primary'">
      <b-navbar-brand href="#">
        <span v-if="customer?.name">Welcome, {{ customer.name }}</span>
        <span v-else-if="user.name"> Welcome, {{ user.name }} </span>
        <span v-else> Mini Starbucks </span>
      </b-navbar-brand>
      <b-navbar-nav>
        <!-- <b-nav-item href="/">All Orders</b-nav-item> -->
        <b-nav-item v-if="user?.roles?.includes('customer')" href="/customer">Home</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('customer')" href="/shoppingcart">Shopping Cart</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('customer')" href="/profile">Profile</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('operator')" href="/operator">My Work Screen</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('admin')" href="/allorders">All Orders</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('admin')" href="/alloperators">All Operators</b-nav-item>
        <b-nav-item v-if="user?.roles?.includes('admin')" href="/allitems">All Items</b-nav-item>
        <b-nav-item v-if="user?.name == null" href="/api/login">Login</b-nav-item>
        <b-nav-item v-if="user?.name" @click="logout">Logout</b-nav-item>
        <form method="POST" action="/api/logout" id="logoutForm" />
      </b-navbar-nav>
    </b-navbar>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, provide, Ref } from 'vue'
import { CustomerWithOrders} from "../../server/data"

const customer: Ref<CustomerWithOrders | null> = ref(null)
const user = ref({} as any)
provide("user", user)

onMounted(async () => {
  user.value = await (await fetch("/api/user")).json()
  if (user.value && user.value.roles.includes('customer')) {
    customer.value = await (await fetch("/api/customer")).json()
  }
})

function logout() {
  ;(window.document.getElementById('logoutForm') as HTMLFormElement).submit()  
}
</script>