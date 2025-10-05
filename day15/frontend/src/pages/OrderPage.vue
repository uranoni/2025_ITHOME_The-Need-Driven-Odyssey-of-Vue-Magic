<script setup>
import { onMounted } from 'vue'
import OrderForm from '../components/OrderForm.vue'
import OrderList from '../components/OrderList.vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'

const orderStore = useOrderStore()
const menuStore = useMenuStore()

onMounted(() => {
  orderStore.loadOrders()
  menuStore.loadMenu()
})

function handleSubmit(payload) {
  orderStore.createOrder(payload)
}
function handleEdit({ index, patch }) {
  orderStore.updateOrder(index, patch)
}
function handleRemove(index) {
  orderStore.removeOrder(index)
}
</script>

<template>
  <section>
    <div v-if="orderStore.error" class="error-message">
      ⚠️ {{ orderStore.error }}
      <button @click="orderStore.loadOrders" class="btn btn-sm">重新載入</button>
    </div>

    <div v-if="orderStore.loading" class="loading-message">
      🔄 載入中...
    </div>

    <OrderForm
      :disabled="orderStore.loading"
      :drinks="menuStore.drinks"
      :sweetnessOptions="menuStore.sweetnessOptions"
      :iceOptions="menuStore.iceOptions"
      :menuRules="menuStore.rules"
      @submit="handleSubmit"
    />

    <section class="list">
      <h3>目前已送出的訂單 ({{ orderStore.orders.length }} 筆)</h3>
      <OrderList :orders="orderStore.orders" @edit="handleEdit" @remove="handleRemove" />
    </section>

    <section class="block" style="margin-top:16px">
      <h3>祕書匯入訂單（貼上 JSON 陣列）</h3>
      <textarea
        :value="orderStore.ordersJson"
        @input="orderStore.setOrdersJson($event.target.value)"
        style="width:100%; min-height:160px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"
        placeholder='[ { "name": "王小美", "note": "少冰", "drink": "紅茶", "sweetness": "去糖", "ice": "去冰" } ]'
      ></textarea>
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" @click="orderStore.replaceAllOrders(JSON.parse(orderStore.ordersJson))">套用到後端</button>
        <button class="btn" @click="orderStore.loadOrders">重新載入（後端）</button>
      </div>
    </section>

  </section>
  
</template>


