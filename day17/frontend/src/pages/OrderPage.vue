<script setup>
import { onMounted } from 'vue'
import OrderForm from '../components/OrderForm.vue'
import OrderList from '../components/OrderList.vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '../stores/i18nStore'

const orderStore = useOrderStore()
const menuStore = useMenuStore()
const { t } = useI18n()
const i18nStore = useI18nStore()

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
      <button @click="orderStore.loadOrders" class="btn btn-sm">{{ t('actions.reload') }}</button>
    </div>

    <div v-if="orderStore.loading" class="loading-message">
      🔄 {{ t('common.loading') }}
    </div>

    <OrderForm
      :disabled="orderStore.loading"
      :drinks="menuStore.drinks.map(d => ({ value: d, label: i18nStore.translate('drinks', d, $i18n.locale) }))"
      :sweetnessOptions="menuStore.sweetnessOptions.map(s => ({ value: s, label: i18nStore.translate('sweetness', s, $i18n.locale) }))"
      :iceOptions="menuStore.iceOptions.map(i => ({ value: i, label: i18nStore.translate('ice', i, $i18n.locale) }))"
      :menuRules="menuStore.rules"
      @submit="handleSubmit"
    />

    <section class="list">
      <h3>{{ t('pages.currentOrders') }} ({{ orderStore.orders.length }})</h3>
      <OrderList :orders="orderStore.orders" @edit="handleEdit" @remove="handleRemove" />
    </section>

    <section class="block" style="margin-top:16px">
      <h3>{{ t('pages.bulkImport') }}</h3>
      <textarea
        :value="orderStore.ordersJson"
        @input="orderStore.setOrdersJson($event.target.value)"
        style="width:100%; min-height:160px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;"
        placeholder='[ { "name": "王小美", "note": "少冰", "drink": "紅茶", "sweetness": "去糖", "ice": "去冰" } ]'
      ></textarea>
      <div class="actions" style="margin-top:8px">
        <button class="btn primary" @click="orderStore.replaceAllOrders(JSON.parse(orderStore.ordersJson))">{{ t('actions.applyToBackend') }}</button>
        <button class="btn" @click="orderStore.loadOrders">{{ t('actions.reloadFromBackend') }}</button>
      </div>
    </section>

  </section>
  
</template>


