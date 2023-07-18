<template>
<div class="mx-3 my-3">
  <!-- <pre v-if= "card.LocationType === last-card-played" style="color: red">{{ formatCard(card, true) }}</pre>
   -->
   <!-- <h2>{{isLegal(card)}}</h2> -->
<b-list-group flush>
    <b-list-group-item>
      <div style="border: solid 2px #000; border-right-width: 2; width: 100%; position: relative;">
        <a title="comment content" class="mx-3 my-3" style="font-size:200%;">{{comment.content}}</a>
        <div class="mx-3 my-3">From: {{getCustomerName(comment.customerId)}}, Operator: {{getOperatorName(comment.operatorId)}}, Rating : {{comment.rate}}</div>
      </div>
    </b-list-group-item>
</b-list-group>

  <!-- <pre v-if= isLastCardPlayed(card) style="color: red">{{ formatCard(card, true) }}</pre>
  <pre v-else-if= isUnused(card) style="color: grey">{{ formatCard(card, true) }}</pre>
  <pre v-else-if= textColor style="color: green">{{ formatCard(card, true) }} </pre> -->
  
  <!-- <pre v-else-if= isLegal(card) style="color: blue">{{ formatCard(card, true) }}</pre> -->
  <!-- <pre v-else>{{ formatCard(card, true) }}</pre> -->

</div>

<!-- <div style="border: solid 4px #000; border-right-width: 0; width: 100px; height: 200px; position: relative"> -->

  <!-- <b-button class="mr-2 mb-2" >{{ formatCard(card, true) }}</b-button> -->
  <!-- btn mr-2 mb-2 btn-secondary -->
  <!-- <img src="./club.ico" alt="club suit"> -->
<!-- </div> -->
<!-- <b-list-group flush>
    <b-list-group-item>
      <div style="border: solid 1px #000; border-right-width: 0; width: 100px; height: 150px; position: relative;color: 'yellow'">
        {{card.rank}}{{card.suit}}
      </div>
    </b-list-group-item>
  </b-list-group> -->
</template>


  


<script setup lang="ts">
import { watch, ref, inject, Ref, onMounted } from 'vue'
import { Comment, CustomerWithOrders, Operator } from "../../../server/data"

// props
interface Props {
  comment?: Comment
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  comment: undefined
})

const customers: Ref<CustomerWithOrders[] | null> = ref(null)
const operators: Ref<Operator[] | null> = ref(null)
// async function refresh() {
//   customer.value = await (await fetch("/api/all-customers")).json()
// }
onMounted(async () => {
  customers.value = await (await fetch("/api/all-customers")).json()
  operators.value = await (await fetch("/api/all-operators")).json()
})


function getCustomerName(id: string): string {
  return customers.value?.filter( x => (x._id === id))[0]?.name
}

function getOperatorName(id: string) {
  return operators.value?.filter( x => (x._id === id))[0]?.name
}

</script>

<style lang="">
  /* .demo{
      overflow-y: scroll; 
      max-height: 50vh
  } */
      
</style>