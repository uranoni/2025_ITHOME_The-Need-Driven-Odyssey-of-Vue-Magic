<script setup>
import { onMounted } from 'vue'
import { useOrderStore } from '../stores/orderStore'
import { useMenuStore } from '../stores/menuStore'
import OrderStats from '../components/OrderStats.vue'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '../stores/i18nStore'

const orderStore = useOrderStore()
const menuStore = useMenuStore()
const { t } = useI18n()
const i18nStore = useI18nStore()

onMounted(() => {
  if (!orderStore.orders.length) {
    orderStore.loadOrders()
  }
  if (!menuStore.drinks.length) {
    menuStore.loadMenu()
  }
})
</script>

<template>
  <section class="stats">
    <h2>{{ t('pages.summary') }}</h2>
    <nav style="margin:8px 0">
      <router-link class="btn" to="/order">{{ t('actions.backToOrder') }}</router-link>
    </nav>
    <OrderStats :orders="orderStore.orders" :summary="orderStore.summaryRows" />
    <p class="i18n-note">{{ t('fields.drink') }} / {{ t('fields.sweetness') }} / {{ t('fields.ice') }} 顯示為原始值。可用字典轉譯顯示（示範保留原值統計）。</p>
  </section>
</template>


