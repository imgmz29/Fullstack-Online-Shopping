<template>
<div>
    <template>
    <div>
        <b-container fluid class="my-4">
        <b-row>
            <b-col xs="12" sm="3">
                <br/><br/>
                <div style="width:100%; text-align:center">
                <a style="font-size:200%; font-weight:500; margin:1rem"> {{item.name}} </a>
                </div>
                <br/>
                <img  style="max-width: 98%; height: auto; margin:1rem" :src="item.picture" alt="">
            </b-col>
            <b-col xs="12" sm="3" style="margin:5rem">
                <a v-if="item.stock > 0" style="color:green; font-size:150%;"> {{"In Stock (" + item.stock + ")"}} </a>
                <a v-else style="color:red; font-size:150%;"> Out Of Stock </a>
                <br/>
                <a style="font-size:100%;"> {{"Price: $" + item.price}} </a>
                <br/>
                <a style="font-size:100%;"> {{"Total Price: " + totalPrice}} </a>
                <br/>
                <div style="display:inline-block">
                    <a style="font-size:100%;"> {{"Quantity: " + newOrder.count}} 
                        <b-button @click="addOneItem()" :disabled="item.stock == 0"> + </b-button>
                        <b-button @click="deleteOneItem()" :disabled="item.stock == 0"> - </b-button> 
                    </a>
                </div>
                <br/> <br/>
                <b-button @click="addToCart()" :disabled="item.stock == 0"> Add to Cart </b-button>
            </b-col>
            <b-col xs="12" sm="2" style="margin:1rem">
                <a style="font-size:200%; font-weight:500; margin:1rem"> Description: </a> 
                <div>{{item.description}} </div>
            </b-col>
        </b-row>
        <b-row style="margin:1rem">
            <a style="font-size:200%; font-weight:500; margin:1rem"> Comments </a>
            <div >
                <div style="overflow-y: scroll; height: 50vh">
                    <div title="itemComments" v-for="itemComment in itemComments" :key="itemComment._id">
                        <CommentTable :comment = "itemComment" ></CommentTable>
                    </div>
                </div>
            </div>
        </b-row>
        </b-container>
    </div>
    </template>
</div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, Item, ItemWithCount, Order, DraftOrder } from "../../../server/data"
import CommentTable  from "../components/CommentTable.vue"

const user: Ref<any> = inject("user")!
const customer: Ref<CustomerWithOrders | null> = ref(null)
const possibleItems: Ref<Item[]> = ref([])
const item: Ref<Item> = ref( {_id: "", name: "", description: "", price: 0, picture: "", stock: 0} )
const draftOrder: Ref<DraftOrder> = ref(null)
const newOrder: Ref<ItemWithCount> = ref({itemName:"", count:0})
const totalPrice = ref(0)
const itemComments: Ref<Comment[]> = ref([])

interface Props {
    itemId?: string
} 

const props = withDefaults(defineProps<Props>(), {
    itemId: "",
})

async function refresh() {
    possibleItems.value = await (await fetch("/api/possible-items")).json()
    item.value = possibleItems.value.filter(x => x._id===props.itemId)[0]
    newOrder.value.itemName = item.value.name
    newOrder.value.count = 0
    totalPrice.value = 0
    itemComments.value = await (await fetch("/api/item/" + encodeURIComponent(props.itemId) + "/comments" )).json()
    console.log(itemComments.value)
    if (user.value) {
        customer.value = await (await fetch("/api/customer")).json()
        draftOrder.value = await (await fetch("/api/customer/draft-order")).json()
    }
}
watch(user, refresh, { immediate: true })

function addOneItem(){
    newOrder.value.count++
    totalPrice.value += item.value.price
}

function deleteOneItem(){
    if(newOrder.value.count === 0)
        alert("Quantity is already 0!")
    else{
        newOrder.value.count--
        totalPrice.value -= item.value.price
    }
}

function updateDraftOrder() {
    let nameToFind = newOrder.value.itemName
    const draftItems = draftOrder.value.items
    if(draftItems.length && draftItems.filter(x => x.itemName == nameToFind).length) {
        draftItems.filter(x => x.itemName == nameToFind)[0].count += newOrder.value.count
    }
    else draftOrder.value.items.push(newOrder.value)
    draftOrder.value.totalPrice += totalPrice.value
}

async function addToCart() {
    possibleItems.value = await (await fetch("/api/possible-items")).json()
    item.value = possibleItems.value.filter(x => x._id===props.itemId)[0]
    if(newOrder.value.count === 0)
        alert("Must add at least one item!")
    else{
        // check the stock
        if(item.value.stock >= newOrder.value.count) {
            updateDraftOrder()
            console.log("check the stock")
            console.log(draftOrder.value.items)
            await fetch(
            "/api/customer/draft-order",
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "PUT",
                    body: JSON.stringify({ items: draftOrder.value.items, totalPrice: draftOrder.value.totalPrice })
                }
            ) 
            // update the stock
            console.log("update the stock")
            console.log("itemsId: "+ item.value._id)
            console.log("itemNum: "+ newOrder.value.count)
            console.log("Stock: "+ item.value.stock)

            await fetch(
            "/api/item/stock",
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    method: "PUT",
                    body: JSON.stringify({ itemsId: item.value._id, itemNum: newOrder.value.count, stock: item.value.stock })
                }
            )
        }
        else {
            alert("The stock of "+ item.value.name +" is not enough!")
        }
        
    }

    await refresh()
}
</script>