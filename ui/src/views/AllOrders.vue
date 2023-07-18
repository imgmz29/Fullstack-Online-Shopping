<template>
  <div class="mx-3 my-3">
    <b-jumbotron header="All Orders" />
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="orders" :fields="fields" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref } from 'vue'
import { Order, ItemWithCount } from '../../../server/data';

const orders: Ref<Order[]> = ref([])

const fields =  [
  {
    key: '_id',
    label: 'Order ID'
  },
  {
    key: 'customerId',
    label: 'Customer ID'
  },
  {
    key: 'state',
    label: 'Status'
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
  orders.value = await (await fetch("/api/orders")).json()
}
onMounted(refresh)
</script>