<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMenuStore } from '../stores/menuStore'
import { useOrderStore } from '../stores/orderStore'
import { useToastStore } from '../stores/toastStore'

const menuStore = useMenuStore()
const orderStore = useOrderStore()
const toast = useToastStore()

const step = ref(1)
const selectedShop = ref('')
const selectedCategory = ref('')
const selectedItem = ref(null)
const selectedSize = ref('')

const categories = computed(() => (menuStore.menu?.categories || []).map(c => c.name))
const items = computed(() => {
  const cat = (menuStore.menu?.categories || []).find(c => c.name === selectedCategory.value)
  return cat ? cat.items : []
})

function resetAfter(stepNum) {
  if (stepNum <= 2) { selectedCategory.value = ''; }
  if (stepNum <= 3) { selectedItem.value = null; }
  if (stepNum <= 4) { selectedSize.value = ''; }
}

async function startPick() {
  if (!selectedShop.value) return
  await menuStore.loadShopMenu(selectedShop.value)
  step.value = 2
  resetAfter(2)
}

function pickCategory(name) {
  selectedCategory.value = name
  step.value = 3
  resetAfter(3)
}

function pickItem(item) {
  selectedItem.value = item
  step.value = 4
  resetAfter(4)
}

function pickSize(sz) {
  selectedSize.value = sz.name
}

async function addToOrder() {
  if (!selectedItem.value || !selectedSize.value) return
  const sizeObj = selectedItem.value.sizes.find(s => s.name === selectedSize.value)
  const payload = {
    name: 'guest',
    note: '',
    shop: selectedShop.value,
    category: selectedCategory.value,
    item: selectedItem.value.name,
    size: selectedSize.value,
    price: sizeObj?.price,
    drink: selectedItem.value.name,
    sweetness: '',
    ice: ''
  }
  await orderStore.createOrder(payload)
  toast.success('已加入訂單')
}

onMounted(async () => {
  await menuStore.loadShops()
})
</script>

<template>
  <section class="menu-wizard">
    <h2>菜單召喚樹</h2>

    <!-- Step 1: 選店名 -->
    <div class="card">
      <h3>選擇店家</h3>
      <div class="row">
        <select v-model="selectedShop">
          <option value="" disabled>請選擇店家</option>
          <option v-for="s in menuStore.shops" :key="s" :value="s">{{ s }}</option>
        </select>
        <button class="btn" @click="startPick" :disabled="!selectedShop">載入菜單</button>
      </div>
    </div>

    <!-- Step 2: 分類 -->
    <div class="card" v-if="step >= 2">
      <h3>選擇分類</h3>
      <div class="chips">
        <button v-for="c in categories" :key="c" class="chip" :class="{ active: selectedCategory===c }" @click="pickCategory(c)">{{ c }}</button>
      </div>
    </div>

    <!-- Step 3: 品項 -->
    <div class="card" v-if="step >= 3">
      <h3>選擇品項</h3>
      <div class="grid">
        <div class="item" v-for="it in items" :key="it.id" @click="pickItem(it)" :class="{ active: selectedItem?.id===it.id }">
          <div class="name">{{ it.name }}</div>
          <div class="sizes">
            <span v-for="s in it.sizes" :key="s.name" class="sz">{{ s.name }}: {{ s.price }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 4: 尺寸 -->
    <div class="card" v-if="step >= 4 && selectedItem">
      <h3>選擇尺寸</h3>
      <div class="chips">
        <button class="chip" v-for="s in selectedItem.sizes" :key="s.name" :class="{ active: selectedSize===s.name }" @click="pickSize(s)">{{ s.name }}（{{ s.price }}）</button>
      </div>
      <div class="actions">
        <button class="btn primary" :disabled="!selectedSize" @click="addToOrder">加入訂單</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.menu-wizard { padding: 16px; max-width: 960px; margin: 0 auto; }
.card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 12px 0; }
.row { display: flex; gap: 8px; align-items: center; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip { padding: 8px 12px; border-radius: 20px; border: 1px solid #cbd5e1; background:#fff; cursor: pointer; }
.chip.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.item { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; cursor: pointer; }
.item.active { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.2); }
.name { font-weight: 600; margin-bottom: 8px; }
.sizes { display: flex; gap: 8px; flex-wrap: wrap; color: #6b7280; }
.actions { margin-top: 12px; }
.btn { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background:#fff; cursor: pointer; }
.btn.primary { background:#2563eb; color: #fff; border-color:#2563eb; }
select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; }
</style>


