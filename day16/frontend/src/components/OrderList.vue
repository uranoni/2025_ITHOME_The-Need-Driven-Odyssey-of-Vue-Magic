<script setup>
import { reactive, ref } from 'vue'

const props = defineProps({ orders: { type: Array, required: true } })
const emit  = defineEmits(['edit', 'remove'])

const editIndex = ref(-1)
const editForm  = reactive({ name: '', note: '', drink: '', sweetness: '', ice: '' })

function toggleEdit(i){
  if (editIndex.value === i) { editIndex.value = -1; return }
  editIndex.value = i
  Object.assign(editForm, props.orders[i])
}
function applyEdit(){
  if (editIndex.value < 0) return
  emit('edit', { index: editIndex.value, patch: { ...editForm } })
  editIndex.value = -1
}
function cancelEdit(){ editIndex.value = -1 }
function removeOrder(i){
  emit('remove', i)
  if (editIndex.value === i) editIndex.value = -1
}
</script>

<template>
  <ul>
    <li v-for="(o, i) in props.orders" :key="i" class="order">
      <!-- 摘要列 -->
      <div class="row">
        <div class="col">
          <span class="idx">{{ i + 1 }}.</span>
          <span class="name">{{ o.name }}</span>
          <span class="pill">{{ o.drink }}</span>
          <span class="pill" :class="o.ice === '去冰' ? 'is-noice' : 'is-ice'">{{ o.ice }}</span>
          <span class="pill" :class="o.sweetness === '去糖' ? 'is-nosugar' : 'is-sugar'">{{ o.sweetness }}</span>
          <span v-if="o.note" class="note">備註：{{ o.note }}</span>
        </div>
        <div class="actions">
          <router-link v-if="o.id" class="btn btn-sm" :to="`/order/${o.id}`">詳情</router-link>
          <button class="btn btn-sm" @click="toggleEdit(i)">{{ editIndex === i ? '收合' : '編輯' }}</button>
          <button class="btn btn-sm del" @click="removeOrder(i)">刪除</button>
        </div>
      </div>

      <!-- 就地編輯 -->
      <transition name="fade">
        <div v-if="editIndex === i" class="edit-card">
          <div class="edit-row">
            <label>姓名：<input type="text" v-model.trim="editForm.name" /></label>
            <label>備註（選填）：<input type="text" v-model.trim="editForm.note" /></label>
          </div>

          <div class="edit-grid">
            <fieldset class="block">
              <legend>飲料</legend>
              <label><input type="radio" value="紅茶" v-model="editForm.drink" /> 紅茶</label>
              <label><input type="radio" value="綠茶" v-model="editForm.drink" /> 綠茶</label>
            </fieldset>

            <fieldset class="block">
              <legend>甜度</legend>
              <label><input type="radio" value="正常甜" v-model="editForm.sweetness" /> 正常甜</label>
              <label><input type="radio" value="去糖"   v-model="editForm.sweetness" /> 去糖</label>
            </fieldset>

            <fieldset class="block">
              <legend>冰量</legend>
              <label><input type="radio" value="正常冰" v-model="editForm.ice" /> 正常冰</label>
              <label><input type="radio" value="去冰"   v-model="editForm.ice" /> 去冰</label>
            </fieldset>
          </div>

          <div class="edit-actions">
            <button class="btn btn-sm primary" @click="applyEdit">儲存</button>
            <button class="btn btn-sm" @click="cancelEdit">取消</button>
          </div>
        </div>
      </transition>
    </li>
  </ul>
</template>
