<template>
  <div>
    <b-container fluid class="my-4">
      <b-row>
        <b-col xs="12" sm="4">
          <b-card no-body class="mb-3">
            <template #header>
              <div class="d-flex justify-content-between align-items-center">
                Catagoty
                <b-button class="ml-3" size="sm" @click="refresh"><b-icon-arrow-clockwise /></b-button>
              </div>
            </template>
            <b-list-group flush>
              <b-list-group-item
                v-for="type, i in types"
                :key="i"
              >
                <b-input-group>
                  <a style="font-size:100%;" href="#" @click="selectType(type)"> {{type}} </a>
                </b-input-group>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
        <b-col xs="12" sm="8">
          <b-card no-body>
            <template #header>
              <div v-if="selectedType.length !== 0" class="d-flex justify-content-between align-items-center">
                {{ selectedType[0].type }}
              </div>
              <div v-else>
                No Category Selected
              </div>
            </template>
            <!-- <div> -->
            <div v-for="item, i in selectedType" :key="i" >
              <!-- style="display:inline-block" -->
                <div class="card text-center" style="min-width: 18rem; max-width: 20rem; margin: 1rem">
                    <div style="width:100%; text-align:center">
                        <img  style="max-width: 100%; height: auto; " :src="item.picture" alt="">
                    </div>
                    <div class="card-body">
                        <a v-if="customer" style="font-size:150%;" :href="'/itempage/' + item._id">{{item.name}}</a>
                    </div>
                </div>
            </div>
            <!-- </div> -->
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref } from 'vue'
import { CustomerWithOrders, Item } from "../../../server/data"

const user: Ref<any> = inject("user")!
const possibleItems: Ref<Item[]> = ref([])
const customer: Ref<CustomerWithOrders | null> = ref(null)
const types: Ref<string[]> = ref([])
const selectedType: Ref<Item[]> = ref([])

async function refresh() {
  possibleItems.value = await (await fetch("/api/possible-items")).json()
  await possibleItems.value.map( (item) => {
    if(types.value.indexOf(item.type) === -1){
        types.value.push(item.type)
    }
  })

  if (user.value) {
    customer.value = await (await fetch("/api/customer")).json()
    selectedType.value = []
  }
}

function selectType(type: string) {
  selectedType.value = []
  possibleItems.value.map( (item) => {
    if (item.type === type)
        selectedType.value.push(item)
  })
}

watch(user, refresh, { immediate: true })
</script>