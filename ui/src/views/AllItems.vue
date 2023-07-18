<template>
  <div class="mx-3 my-3">
    <b-jumbotron header="All Items" />
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="items" :fields="fields">
        <template #cell(_id)="data0">
            {{ data0.value }}
            <b-button @click="updateItem(data0.value)" :disabled="!data0.item.name || !data0.item.description || !data0.item.price
                || !data0.item.type || !data0.item.picture || !data0.item.stock"> Update </b-button> 
            {{ " " }}
            <b-button @click="deleteItem(data0.value)"> Delete </b-button>
        </template>
        <template #cell(name)="data1">
            <b-form-input id="update-name" type="text" v-model="items[getIndex(data1.item._id)].name" :placeholder="data1.value" required/>
        </template>
        <template #cell(description)="data2">
            <b-form-input id="update-description" type="text" v-model="items[getIndex(data2.item._id)].description" :placeholder="data2.value" required/>
        </template>
        <template #cell(price)="data3">
            <b-form-input id="update-price" type="number" v-model="items[getIndex(data3.item._id)].price" :placeholder="`data3.value`" required/>
        </template>
        <template #cell(type)="data4">
            <b-form-checkbox-group v-model="items[getIndex(data4.item._id)].type" :options="types" required/>
            <!-- <select :v-model="items[getIndex(data4.item._id)].type" :value="items[getIndex(data4.item._id)].type">
                <option> Coffee </option>
                <option> Sandwich </option>
                <option> Bakery </option>
            </select> -->
        </template>
        <template #cell(picture)="data5">
            <b-form-input id="update-picture" type="text" v-model="items[getIndex(data5.item._id)].picture" :placeholder="data5.value" required/>
        </template>
        <template #cell(stock)="data6">
            <b-form-input id="update-stock" type="number" v-model="items[getIndex(data6.item._id)].stock" :placeholder="`data6.value`" required/>
        </template>
    </b-table>
    <div>
        <h5> Add New Item </h5>
    <b-form>
        <b-form-group
            label="ID"
            label-for="new-item-id"
        >
            <b-form-input id="new-item-id" type="text" v-model="addId" :placeholder="addId" required/>
        </b-form-group>
        <b-form-group
            label="Name"
            label-for="new-item-name"
        >
            <b-form-input id="new-item-name" type="text" v-model="addName" :placeholder="addName" required/>
        </b-form-group>
        <b-form-group
            label="Description"
            label-for="new-item-description"
        >
            <b-form-input id="new-item-description" type="text" v-model="addDescription" :placeholder="addDescription" required/>
        </b-form-group>
        <b-form-group
            label="Price"
            label-for="new-item-price"
        >
            <b-form-input id="new-item-price" type="number" v-model="addPrice" required/>
        </b-form-group>
        <b-form-group
            label="Category"
            label-for="new-item-type"
        >
            <b-form-checkbox-group id="new-item-type" v-model="addType" :options="types" required/>
            <!-- <b-form-input id="new-item-type" type="text" v-model="addDescription" required/> -->
        </b-form-group>
        <b-form-group
            label="Picture"
            label-for="new-item-picture"
        >
            <b-form-input id="new-item-picture" type="text" v-model="addPicture" required/>
        </b-form-group>
        <b-form-group
            label="Stock"
            label-for="new-item-stock"
        >
            <b-form-input id="new-item-stock" type="number" v-model="addStock" required/>
        </b-form-group>
    </b-form>
        <b-button @click="addItem()" :disabled="!addId || addId == 'Id' ||  !addName || addName == 'Name' || !addDescription || addDescription == 'Description'
            || !addPrice || !addType || !addPicture || addPicture == 'Picture Link' || !addStock"> Add 
        </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, inject } from 'vue'
import { Item } from '../../../server/data';

const user: Ref<any> = inject("user")!
const items: Ref<Item[]> = ref([])
const types: Ref<string[]> = ref(["Coffee", "Sandwich", "Bakery"])

const addId = ref("Id")
const addName = ref("Name")
const addDescription = ref("Description")
const addPrice = ref(0)
const addType = ref("Category")
const addPicture = ref("Picture Link") // for test: https://images.pexels.com/photos/347926/pexels-photo-347926.jpeg?auto=compress&cs=tinysrgb&w=1600
const addStock = ref(0)

const fields =  [
    {
        key: '_id',
        label: 'Id'
    },
    {
        key: 'name',
        label: 'Name'
    },
    {
        key: 'description',
        label: 'Description'
    },
    {
        key: 'price',
        label: 'Price'
    },
    {
        key: 'type',
        label: 'Type'
    },
    {
        key: 'picture',
        label: 'Picture Link'
    },
    {
        key: 'stock',
        label: 'Stock'
    },
]

async function refresh() {
    addId.value = "Id"
    addName.value = "Name"
    addDescription.value = "Description"
    addPrice.value = 0
    addType.value = "Type"
    addPicture.value = "Picture Link"
    addStock.value = 0

    if (user.value) {
        items.value = await (await fetch("/api/possible-items")).json()
    }
}
watch(user, refresh, { immediate: true })
// onMounted(refresh)

function getIndex(id: string) {
    return items.value.findIndex(x => x._id == id)
}

async function updateItem(id: string) {
    let newName = items.value[getIndex(id)].name
    let newDescription = items.value[getIndex(id)].description
    let newPrice = items.value[getIndex(id)].price
    let newType = items.value[getIndex(id)].type
    let newPicture = items.value[getIndex(id)].picture
    let newStock = items.value[getIndex(id)].stock

    await fetch(
        `/api/admin/update-item/${id}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newName: newName, newDescription: newDescription, newPrice: newPrice, newType: newType, newPicture: newPicture, newStock: newStock})
        }
    )
    refresh()
}

async function deleteItem(id: string) {
    await fetch(
        `/api/admin/delete-item/${id}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
        }
    )
    refresh()
}

async function addItem() {
    await fetch(
        "/api/admin/add-item",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newId: addId.value, newName: addName.value, newDescription: addDescription.value, newPrice: addPrice.value, 
                                    newType: addType.value, newPicture: addPicture.value, newStock: addStock.value})
        },
    )
    refresh()
}
</script>