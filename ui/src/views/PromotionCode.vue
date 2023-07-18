<template>
<div class="mx-3 my-3">

<!-- <b-button @click="refresh" class="mb-2">Refresh</b-button> -->
    <b-jumbotron header="My Coupons" />
    <a style="font-size:150%;"> Current Coupons: {{currentPromoCode}}</a>
    <!-- <div>applied rewared #: {{appliedRewardNumber}}</div> -->
    <div v-if="moreTimes > 0"> <h5> Order for {{moreTimes}} more times, get another 50% DISCOUNT!! </h5> </div>
    <div v-else>
        <h5> You have {{currentOrderCount}} unused orders, you can get {{Math.round( currentOrderCount / 5)}} promotion codes! </h5>
        <br/>
    </div>
    <div 
        v-for="i in Math.round( currentOrderCount / 5)"
        :key="i"
        class="mr-2 mb-2" 
        @click="getCode()"
    >
   	    <img src="./coupon.jpg" alt="club suit" style="width: 120px; height: 60px">
       
    </div>
</div>
<!-- </div> -->
</template>


<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, ItemWithCount, Item } from "../../../server/data"
const user: Ref<any> = inject("user")!
const customer: Ref<CustomerWithOrders | null> = ref(null)

const currentPromoCode = ref(0)
const moreTimes = ref(0)//customer.value.orders.length % 5
const currentOrderCount = ref(0)//customer.value.orders.length / 5 - usedRewardNumber

async function refresh() {
  if (user.value) {
    customer.value = await (await fetch("/api/customer")).json()
  }

  currentPromoCode.value = customer.value.promoCode
  currentOrderCount.value = customer.value.orderCount
  
  if(currentOrderCount.value < 5){
    moreTimes.value = 5 - currentOrderCount.value
    console.log(customer.value.name + ", " + customer.value.orderCount)
  }
}
watch(user, refresh, { immediate: true })

async function getCode(){
    if(currentOrderCount.value >= 5){
        await fetch(
            "/api/customer/update-order-count",
            {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify({ newCount: currentOrderCount.value - 5 })
            }
        ) 
        await fetch(
            "/api/customer/update-promo-code",
            {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify({ newPromo: currentPromoCode.value + 1 })
            }
        )
        await refresh()
    }
}
</script>