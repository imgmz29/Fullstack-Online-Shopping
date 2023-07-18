<template>
  <div class="mx-3 my-3">
    <h2>Orders</h2>
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="orders" :fields="fields">
      <template #cell(operatorId)="cellScope">
        <span v-if="cellScope.value">
          {{ cellScope.value }}
          <b-button @click="updateOrder(cellScope.item._id, 'done')" v-if="cellScope.value === user?.preferred_username && cellScope.item.state !== 'done'">
            Done
          </b-button>
        </span>
        <b-button v-else @click="updateOrder(cellScope.item._id, 'preparing')">Start Preparing</b-button>
      </template>
    </b-table>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, Ref, inject, computed } from 'vue'
import { Operator, Order, ItemWithCount } from "../../../server/data"

const operator: Ref<Operator | null> = ref(null)
const orders: Ref<Order[]> = ref([])
const user: Ref<any> = inject("user")!

async function refresh() {
  if (user.value) {
    operator.value = await (await fetch("/api/operator/")).json()
  }
  orders.value = await (await fetch("/api/orders/")).json()
}
watch(user, refresh, { immediate: true })

const fields = [{key: "_id", label: 'Order ID'}, {key: "customerId", label: 'Customer ID'}, {key: "state", label: 'Status'}, 
  {
    key: 'items',
    label: 'Items',
    formatter: (items: ItemWithCount[]) => 
      items.map(item => item.count + " x " + item.itemName).join(', ')
  }, 
  {
    key: 'operatorId', 
    label: 'Staff ID'
  }
]

async function updateOrder(orderId: string, state: string) {
  await fetch(
    "/api/order/" + encodeURIComponent(orderId),
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({
        operatorId: user.value.preferred_username,
        state,
      })
    }
  )
  await refresh()
}
</script>