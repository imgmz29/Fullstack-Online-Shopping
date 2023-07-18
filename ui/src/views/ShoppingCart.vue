<template>
    <div>
        <b-container fluid class="my-4">
        <b-row>
            <b-col v-if="draftOrder.items.length !== 0" xs="12" sm="5" style="margin:5rem">
                <b-table v-if="customer" :items="draftOrder.items" :fields="fields">
                    <template #cell(itemName)="name">
                        <a style="font-size:150%;" :href="'/itempage/' + getItemId(name.value)">{{name.value}}</a>
                    </template>
                    <template #cell(count)="count">
                        {{count.value + " "}}
                        <b-button @click="addOneItem(count.item.itemName)"> + </b-button>
                        {{ " " }}
                        <b-button @click="deleteOneItem(count.item.itemName)"> - </b-button>
                    </template>
                </b-table>
            </b-col>
            <b-col v-else xs="12" sm="3" style="margin:8rem">
                Your shopping cart is empty, please order
                <a href="/purchase"> here </a>
                !
            </b-col>           
            <b-col xs="12" sm="3" style="margin:5rem">
                <div v-if="draftOrder.items.length !== 0">
                    <h5 title="total price output"> {{"Total Price: " + totalPrice}} </h5>
                    <br/>
                    <b-button @click="submit()"> Submit Order</b-button> 
                    <br/>
                    <h5> You have {{promoNumber}} coupons! </h5>
                    <div style="display:inline-block">
                            <div 
                                v-for="i in promoNumber"
                                :key="i"
                                class="mr-2 mb-2" 
                                @click="useCode()"
                            >
                                <img src="./coupon.jpg" alt="coupon" style="width: 60px; height: 30px">
                            </div>
                    </div>
                </div>
            </b-col>
        </b-row>
        </b-container>
    </div>
</template>


<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, Item, ItemWithCount, Order, DraftOrder } from "../../../server/data"

const user: Ref<any> = inject("user")!
const customer: Ref<CustomerWithOrders | null> = ref(null)
const possibleItems: Ref<Item[]> = ref([])
const draftOrder: Ref<DraftOrder> = ref({ customerId:"" , items: [], totalPrice: 0 })
const totalPrice  = ref(0)
const promoNumber = ref(0)

const fields = [
    {
        key: 'itemName',
        label: 'Item Name'
    },
    {
        key: 'count',
        label: 'Quantity'
    },
]

async function refresh() {
    possibleItems.value = await (await fetch("/api/possible-items")).json()
    if (user.value) {
        customer.value = await (await fetch("/api/customer")).json()
        draftOrder.value = await (await fetch("/api/customer/draft-order")).json()
        console.log("fetch from db")
        console.log(draftOrder.value.items)
        // fixDraftOrder(draftOrder.value)

        totalPrice.value = draftOrder.value.totalPrice
        promoNumber.value = customer.value.promoCode
    }
}
watch(user, refresh, { immediate: true })

async function fixDraftOrder(draftOrder: DraftOrder) {
    draftOrder.items.reduce(
        (fixedDraftOrder, currentItem) => {
            if(fixedDraftOrder.length  && fixedDraftOrder.filter(x => x.itemName == currentItem.itemName)) {
                fixedDraftOrder.filter(x => x.itemName == currentItem.itemName)[0].count += currentItem.count
                let index = draftOrder.items.indexOf(currentItem)
                draftOrder.items.splice(index, 1)
                console.log("fixedDraftOrder:" + fixedDraftOrder)
            }
            else {
               fixedDraftOrder.push(currentItem) 
               console.log("push new item")
               console.log(fixedDraftOrder)
            }
            return fixedDraftOrder
        }, []
    )
}

async function submit() {
    draftOrder.value.totalPrice = totalPrice.value
    await updateDraftOrder()
    
    await fetch(
        "/api/customer/submit-draft-order",
        { method: "POST" }
    )
    await fetch(
        "/api/customer/update-order-count",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newCount: customer.value.orderCount + 1 })
        }
    ) 
    await fetch(
        "/api/customer/update-promo-code",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newPromo: promoNumber.value})
        }
    )
    await refresh()
}

async function useCode() {
    if(customer.value.promoCode === 0)
        alert("You do not have any code!")
    else{
        totalPrice.value *= 0.5
        promoNumber.value--
    }
}

function getItemId(name: string): string {
    let id: string = ""
    possibleItems.value.map( x => {
        if(x.name === name){
            id = x._id
            return
        }
    })

    return id
}

async function updateDraftOrder() {
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
}

async function addOneItem(item: string) {
    let price: number = 0
    let stock: number
    let itemId: string
    possibleItems.value.map(x => {
        if(x.name === item){
            price = x.price
            stock = x.stock
            itemId = x._id
            return
        }
    })
    if(stock <= 0) {
        alert("The stock of "+ item +" is not enough!")
        return 
    }
    draftOrder.value.items.map( x => {
        if(x.itemName === item){
            x.count++
            return
        }
    })

    draftOrder.value.totalPrice += price
    totalPrice.value = draftOrder.value.totalPrice
    await fetch(
        "/api/item/stock",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ itemsId: itemId, itemNum: 1, stock: stock })
        }
    )
    await updateDraftOrder()
    await refresh()
}

function deleteItem(item: string){
    let position = 0
    draftOrder.value.items.map( x => {
        if(x.itemName === item){
            draftOrder.value.items.splice(position, 1)
        }
        position++
    })
}

async function deleteOneItem(item: string) {
    draftOrder.value.items.map( x => {
        if(x.itemName === item){
            x.count--
            if(x.count === 0)
                deleteItem(x.itemName)
            return
        }
    })
    
    let price: number = 0
    let itemId: string
    let stock: number = 0
    possibleItems.value.map(x => {
        if(x.name === item){
            price = x.price
            itemId = x._id
            stock = x.stock
            return
        }
    })
    draftOrder.value.totalPrice -= price
    totalPrice.value = draftOrder.value.totalPrice

    await fetch(
        "/api/item/stock",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ itemsId: itemId, itemNum: -1, stock: stock })
        }
    )
    await updateDraftOrder()
    await refresh()
}

</script>