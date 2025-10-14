<script setup>
import { onMounted, ref } from 'vue'
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

const selectedShop = ref('')

onMounted(async () => {
  await orderStore.loadOrders()
  await menuStore.loadShops()
})

async function onPickShop() {
  if (!selectedShop.value) return
  await menuStore.loadShopMenu(selectedShop.value)
}

function handleSubmit(payload) {
  const withShop = {
    ...payload,
    shop: menuStore.currentShop || '',
    item: payload.drink,
    category: '',
    size: '',
    price: undefined
  }
  orderStore.createOrder(withShop)
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

    <div class="shop-picker">
      <label>選擇店家</label>
      <select v-model="selectedShop" @change="onPickShop">
        <option value="" disabled>請選擇</option>
        <option v-for="s in menuStore.shops" :key="s" :value="s">{{ s }}</option>
      </select>
      <span v-if="menuStore.currentShop">目前菜單：{{ menuStore.currentShop }}</span>
    </div>

    <OrderForm
      :disabled="orderStore.loading"
      :drinks="menuStore.drinks.map(d => ({ value: d, label: d }))"
      :sweetnessOptions="menuStore.sweetnessOptions.map(s => ({ value: s, label: i18nStore.translate('sweetness', s, $i18n.locale) }))"
      :iceOptions="menuStore.iceOptions.map(i => ({ value: i, label: i18nStore.translate('ice', i, $i18n.locale) }))"
      :menuRules="menuStore.rules"
      @submit="handleSubmit"
    />

    <section class="list">
      <h3>{{ t('pages.currentOrders') }} ({{ orderStore.orders.length }})</h3>
      <OrderList :orders="orderStore.orders" @edit="handleEdit" @remove="handleRemove" />
    </section>

    <section class="import-section">
      <h3 class="import-title">{{ t('pages.bulkImport') }}</h3>
      <textarea
        class="import-textarea"
        :value="orderStore.ordersJson"
        @input="orderStore.setOrdersJson($event.target.value)"
        placeholder='[ { "name": "王小美", "note": "少冰", "drink": "紅茶", "sweetness": "去糖", "ice": "去冰" } ]'
      ></textarea>
      <div class="import-actions">
        <button class="btn primary" @click="orderStore.replaceAllOrders(JSON.parse(orderStore.ordersJson))">{{ t('actions.applyToBackend') }}</button>
        <button class="btn" @click="orderStore.loadOrders">{{ t('actions.reloadFromBackend') }}</button>
      </div>
    </section>

  </section>
</template>

<style scoped>
.list {
  margin-top: 24px;
}

.list h3 {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.import-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
}

.import-title {
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.import-textarea {
  width: 100%;
  min-height: 160px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-page);
  color: var(--text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: var(--transition-fast);
}

.import-textarea:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.import-textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.import-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.error-message {
  background: #ffeef0;
  border: 1px solid #e57373;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.loading-message {
  background: #e3f2fd;
  border: 1px solid #90caf9;
  color: #1565c0;
  padding: 12px;
  border-radius: 8px;
  margin: 10px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .import-actions {
    flex-direction: column;
  }
  
  .import-actions .btn {
    width: 100%;
  }
}
</style>
