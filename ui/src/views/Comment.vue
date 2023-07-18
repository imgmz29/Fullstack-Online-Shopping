<template>
<div class="mx-3 my-3" xs="12" sm="2">
  <b-container fluid class="my-4">
  <b-row>
  <b-col  xs="12" sm="4" style="margin:5rem">
    <h4>Select the items you want to comment:</h4>
    <b-form-checkbox-group title="comment items" v-model="commentItems" :options="orderedItems" />
    <br/>
    <!-- <el-rate v-model="value1" allow-half score-template="{value}" show-score/> -->
    <!-- <Rating v-model="rating"/> -->
    <b-form>
            <b-form-group
              label="Comment here:"
              label-for="comment-text-input"
            >
              <b-form-input id="comment-text-input" v-model="commentContent" rows="10" required cols="50" placeholder="Write Your Comments..." />
            </b-form-group>
              <b-form-group
                label="Rate:"
                label-for="rating"
              >            
              <b-form-input id="rating" v-model="rating" type="range" min="1" max="5"></b-form-input>
              <div class="mt-2">Rating: {{ rating }}</div>
            </b-form-group>
    </b-form>
    <div class="mt-2">
      <b-button @click="submit">Submit</b-button>
    </div>
  </b-col>
  </b-row>
  </b-container>
</div>

</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, ItemWithCount, Item, Order } from "../../../server/data"
// import { io } from "socket.io-client"

const user: Ref<any> = inject("user")
const customer: Ref<CustomerWithOrders | null> = ref(null)
const order: Ref<Order> = ref(null)
const allOrders: Ref<Order[]> = ref([])
const orderedItems: Ref<String[]> = ref([])
const possibleItems: Ref<Item[]> = ref([]) 
const commentItems: Ref<String[]> = ref([])
const commentContent = ref("")
const rating = ref(1)
// const show = ref(false)

interface Props {
  orderId?: string
} 

const props = withDefaults(defineProps<Props>(), {
  orderId: "",
})

async function refresh() {
  commentItems.value = []
  commentContent.value = ""
  rating.value = 1
  possibleItems.value = await (await fetch("/api/possible-items")).json()
  allOrders.value = await (await fetch("/api/orders")).json()
  order.value = allOrders.value.filter( x => x._id === props.orderId)[0] || null
  orderedItems.value.splice(0)
  order.value.items.forEach(x => {
    orderedItems.value.push(x.itemName)
  })
  if (user.value) {
    customer.value = await (await fetch("/api/customer")).json()
  }
}
watch(user, refresh, { immediate: true })

// const socket = io()


async function submit() {
  if(commentItems.value.length === 0)
    alert("You have not selected items!")
  else{
    commentItems.value.forEach(async x => {
      const itemId = possibleItems.value.filter(ele => ele.name === x)[0]._id
      console.log("itemId: "+itemId)
      
      await fetch(
        "/api/customer/submit-comment",
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "PUT",
          body: JSON.stringify({ itemId: itemId, operatorId: order.value.operatorId, orderId: order.value._id, content: commentContent.value, rating: rating.value })
        }
      )
    })
    refresh()
  }
  // socket.emit("update-comment")

  // socket.on("update-comment-reply", (updated: boolean) => {
  //   show.value = false
  //   if(updated === true){
  //     alert("Successfully updated!")
  //   }
  //   else{
  //     alert("Please check the inputs!")
  //   }
  // })
}
</script>