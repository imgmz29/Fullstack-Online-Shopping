<template>
  <div class="mx-3 my-3">
    <b-jumbotron header="All Staff" />
    <b-button @click="refresh" class="mb-2">Refresh</b-button>
    <b-table :items="operators" :fields="fields">
        <template #cell(_id)="data0">
            {{ data0.value }}
            <b-button @click="updateOperator(data0.value)" :disabled="!data0.item.name || !data0.item.email || !data0.item.email.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)"> Update </b-button> 
            {{ " " }}
            <b-button @click="deleteOperator(data0.value)"> Delete </b-button>
        </template>
        <template #cell(name)="data1">
            <b-form-input id="update-name" type="text" v-model="operators[getIndex(data1.item._id)].name" :placeholder="data1.value" required/>
        </template>
        <template #cell(email)="data2">
            <b-form-input id="update-email" type="text" v-model="operators[getIndex(data2.item._id)].email" :placeholder="data2.value" required/>
        </template>
    </b-table>

    <div>
        <h5> Add New Operator </h5>
    <b-form>
        <b-form-group
            label="Operator ID"
            label-for="new-operator-id"
        >
            <b-form-input id="new-operator-id" type="text" v-model="addId" required/>
        </b-form-group>
        <b-form-group
            label="Operator Name"
            label-for="new-operator-name"
        >
            <b-form-input id="new-operator-name" type="text" v-model="addName" required/>
        </b-form-group>
        <b-form-group
            label="Operator Email"
            label-for="new-operator-email"
        >
            <b-form-input id="new-operator-email" type="email" v-model="addEmail" required/>
        </b-form-group>
    </b-form>
        <b-button @click="addOperator()" :disabled="!addId || addId == 'Id' ||  !addName || addName == 'Name' || !addEmail || addEmail == 'Email' ||
            !addEmail.match(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/)"> Add 
        </b-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, Ref, watch, inject } from 'vue'
import { Operator } from '../../../server/data';

const user: Ref<any> = inject("user")!
const operators: Ref<Operator[]> = ref([])

const addId = ref("Id")
const addName = ref("Name")
const addEmail = ref("Email")

const fields =  [
  {
    key: '_id',
    label: 'Operator ID'
  },
  {
    key: 'name',
    label: 'Operator Name'
  },
  {
    key: 'email',
    label: 'Email'
  },
]

async function refresh() {
    addId.value = "Id"
    addName.value = "Name"
    addEmail.value = "Email"

    if (user.value) {
        operators.value = await (await fetch("/api/all-operators")).json()
    }
}
watch(user, refresh, { immediate: true })
// onMounted(refresh)

function getIndex(id: string) {
    return operators.value.findIndex(x => x._id == id)
}

async function updateOperator(id: string) {
    let newName = operators.value[getIndex(id)].name
    let newEmail = operators.value[getIndex(id)].email

    await fetch(
        `/api/admin/update-operator/${id}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newName: newName, newEmail: newEmail})
        }
    )
    refresh()
}

async function deleteOperator(id: string) {
    await fetch(
        `/api/admin/delete-operator/${id}`,
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
        }
    )
    refresh()
}

async function addOperator() {
    await fetch(
        "/api/admin/add-operator",
        {
            headers: {
                "Content-Type": "application/json",
            },
            method: "PUT",
            body: JSON.stringify({ newId: addId.value, newName: addName.value, newEmail: addEmail.value})
        },
    )
    refresh()
}
</script>