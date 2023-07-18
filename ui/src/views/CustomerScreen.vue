<template>
<div class="mx-3 my-3">
  <div class="card-deck">
    <div v-if="!customer">
      <a style="font-size:150%;"> Please </a>
      <a style="font-size:150%;" href="/api/login"> Login </a>
      <a style="font-size:150%;"> to order! </a>
    </div>
      <div class="card text-center" style="min-width: 18rem; max-width: 20rem; margin: 1rem">
        <div style="width:100%; text-align:center">
          <img  style="max-width: 100%; height: auto; " src="https://images.pexels.com/photos/4551521/pexels-photo-4551521.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="">
        </div>
        <div class="card-body">
          <a v-if="customer" style="font-size:150%;" href="/purchase">New Order</a>
          <a v-else style="font-size:150%;"> New Order </a>
        </div>
      </div>
         <div class="card text-center" style="min-width: 18rem; max-width: 20rem; margin: 1rem">
        <div style="width:100%; text-align:center">
          <img  style="max-width: 100%; height: auto; " src="https://images.pexels.com/photos/7262475/pexels-photo-7262475.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="">
        </div>
        <div class="card-body">
            <a v-if="customer" style="font-size:150%;" href="/vieworders">View Orders</a>
            <a v-else style="font-size:150%;"> New Order </a>
        </div>
      </div>
        <div class="card text-center" style="min-width: 18rem; max-width: 20rem; margin: 1rem">
        <div style="width:100%; text-align:center">
          <img  style="max-width: 100%; height: auto; " src="https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="">
        </div>
        <div class="card-body">
            <a v-if="customer" style="font-size:150%;" href="/promotioncode">Get Coupon</a>
            <a v-else style="font-size:150%;"> New Order </a>
        </div>
      </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, ItemWithCount, Item } from "../../../server/data"

const customer: Ref<CustomerWithOrders | null> = ref(null)
const user: Ref<any> = inject("user")!
const possibleItems: Ref<Item[]> = ref([])


async function refresh() {
  possibleItems.value = await (await fetch("/api/possible-items")).json()

  if (user.value) {
    customer.value = await (await fetch("/api/customer")).json()
  }
}
watch(user, refresh, { immediate: true })
</script>