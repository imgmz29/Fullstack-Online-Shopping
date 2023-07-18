<template>
  <div class="mx-3 my-3">
    <h3> Welcome to Mini Starbucks! </h3>
    <div v-for="item, i in possibleItems" :key="i" style="display:inline-block">
      <div class="card text-center" style="min-width: 18rem; max-width: 20rem; margin: 1rem">
          <div style="width:100%; text-align:center">
            <img  style="max-width: 100%; height: auto; " :src="item.picture" alt="">
          </div>
          <div class="card-body">
            <a style="font-size:150%;"> {{item.name}} </a>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { onMounted, ref, Ref } from 'vue'
import { Item } from '../../../server/data'

const possibleItems: Ref<Item[]> = ref([])

async function refresh() {
  possibleItems.value = await (await fetch("/api/possible-items")).json()
}
onMounted(refresh)
</script>