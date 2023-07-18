<template>
  <div class="mx-3 my-3">
    <div v-if="customer && customer.orders.length === 0">
        <a style="font-size:150%;"> You have no previous orders. Please</a>
        <a style="font-size:150%;" href="/purchase"> Order </a>
        <a style="font-size:150%;"> First!</a>
    </div>
    <div v-else>
        <h2>My Orders</h2>
        <b-button @click="refresh" class="mb-2">Refresh</b-button>
        <b-table v-if="customer" :items="customer.orders" :fields="fields">
              <template #cell(_id)="data">
                <a v-if="checkDoneStatus(data.value) === true" :href="'/comment/' + data.value">{{data.value}}</a>
                <a v-else> {{data.value}} </a>
              </template>
        </b-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, ItemWithCount, Item } from "../../../server/data"

const customer: Ref<CustomerWithOrders | null> = ref(null)
const user: Ref<any> = inject("user")!
const possibleItems: Ref<Item[]> = ref([])

const fields =  [
  {
    key: '_id',
    label: 'Order ID (Click to make reviews, finished orders only)'
  },
  {
    key: 'customerId',
    label: 'Customer ID'
  },
  {
    key: 'state',
    label: 'State'
  },
  {
    key: 'items',
    label: 'Items',
    formatter: (items: ItemWithCount[]) => 
      items.map(item => item.count + " x " + item.itemName).join(', ')
  },
  {
    key: 'totalPrice',
    Label: 'Price'
  },
  {
    key: 'operatorId',
    label: 'Staff ID'
  }
]

async function refresh() {
  possibleItems.value = await (await fetch("/api/possible-items")).json()

  if (user.value) {
    customer.value = await (await fetch("/api/customer")).json()
  }
}
watch(user, refresh, { immediate: true })

function checkDoneStatus(orderId: string): boolean{
  let flag = false
  customer.value.orders.map( x => {
    if(x._id === orderId){
      if(x.state === "done"){
        flag = true
        console.log("true")
      } 
    }
  })

  return flag
}
</script>