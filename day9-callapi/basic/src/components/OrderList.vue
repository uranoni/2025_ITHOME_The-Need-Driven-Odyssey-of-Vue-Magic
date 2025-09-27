<template>
  <section>
    <h2>目前訂單</h2>
    <ul>
      <li v-for="o in orders" :key="o.id">
        {{ o.name }} - {{ o.drink }}
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  orders: { type: Array, default: () => [] }
})
</script>
