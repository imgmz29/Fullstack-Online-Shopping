<template>
<div class="mx-3 my-3">
    <h3> Profile </h3>
    <!-- <a :href="getLink()"> update link </a> -->
    <b-form>
        <b-form-group
            label="Update User Name"
            label-for="update-user-name"
        >
            <b-form-input id="update-user-name" type="text" v-model="userName" :placeholder="userName" required/>
        </b-form-group>
        <b-form-group
            label="Update Email"
            label-for="update-email"
        >
            <b-form-input id="update-email" type="email" v-model="email" :placeholder="email" required/>
        </b-form-group>
        <b-form-group
            label="Update Phone Number"
            label-for="update-phone-number"
        >
            <b-form-input id="update-phone-number" type="text" v-model="phone" :placeholder="phone"/>
        </b-form-group>
    </b-form>
    <b-button @click="updateProfile()" :disabled="!userName || !email || !email.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)"> Update </b-button>
</div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, Item, ItemWithCount, Order, DraftOrder } from "../../../server/data"

const user: Ref<any> = inject("user")!
const customer: Ref<CustomerWithOrders | null> = ref(null)
const userName = ref("")
const email = ref("")
const phone = ref("")

async function refresh() {                   
    if (user.value) {
        customer.value = await (await fetch("/api/customer")).json()
        userName.value = customer.value.name
        email.value = customer.value.email
        if(customer.value.phone)
            phone.value = customer.value.phone
    }
}
watch(user, refresh, { immediate: true })


function getLink() {
    return "http://localhost:8081/auth/realms/Mini-Starbucks/account"
}

async function updateProfile() {
    await fetch(
        "/api/customer/update-profile",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newName: userName.value, newEmail: email.value, newPhone: phone.value })
        }
    )
    refresh()
}
</script>
