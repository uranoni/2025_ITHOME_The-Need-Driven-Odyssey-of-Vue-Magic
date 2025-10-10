<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useI18nStore } from '../stores/i18nStore'
import { useModalStore } from '../stores/modalStore'
import { useToastStore } from '../stores/toastStore'

const props = defineProps({ orders: { type: Array, required: true } })
const emit  = defineEmits(['edit', 'remove'])

const editIndex = ref(-1)
const editForm  = reactive({ name: '', note: '', drink: '', sweetness: '', ice: '' })
const { t } = useI18n()
const i18nStore = useI18nStore()
const modal = useModalStore()
const toast = useToastStore()

function toggleEdit(i){
  if (editIndex.value === i) { editIndex.value = -1; return }
  editIndex.value = i
  Object.assign(editForm, props.orders[i])
}
function applyEdit(){
  if (editIndex.value < 0) return
  emit('edit', { index: editIndex.value, patch: { ...editForm } })
  editIndex.value = -1
  toast.success('訂單已更新')
}
function cancelEdit(){ editIndex.value = -1 }

function removeOrder(i){
  const order = props.orders[i]
  modal.confirm({
    title: '確認刪除',
    message: `確定要刪除「${order.name}」的訂單嗎？此動作無法復原。`,
    okText: '是的，刪除',
    cancelText: '取消',
    onOk: async () => {
      emit('remove', i)
      if (editIndex.value === i) editIndex.value = -1
      toast.success('訂單已刪除')
    }
  })
}
</script>

<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="(o, i) in props.orders" :key="o.id || i" class="order">
      <!-- 摘要列 -->
      <div class="row">
        <div class="col">
          <span class="idx">{{ i + 1 }}.</span>
          <span class="name">{{ o.name }}</span>
          <span class="pill">{{ i18nStore.translate('drinks', o.drink, $i18n.locale) }}</span>
          <span class="pill" :class="o.ice === '去冰' ? 'is-noice' : 'is-ice'">{{ i18nStore.translate('ice', o.ice, $i18n.locale) }}</span>
          <span class="pill" :class="o.sweetness === '去糖' ? 'is-nosugar' : 'is-sugar'">{{ i18nStore.translate('sweetness', o.sweetness, $i18n.locale) }}</span>
          <span v-if="o.note" class="note">{{ t('fields.note') }}：{{ o.note }}</span>
        </div>
        <div class="actions">
          <router-link v-if="o.id" class="btn btn-sm" :to="`/order/${o.id}`">{{ t('actions.detail') }}</router-link>
          <button class="btn btn-sm" @click="toggleEdit(i)">{{ editIndex === i ? t('actions.collapse') : t('actions.edit') }}</button>
          <button class="btn btn-sm del" @click="removeOrder(i)">{{ t('actions.delete') }}</button>
        </div>
      </div>

      <!-- 就地編輯 -->
      <transition name="fade">
        <div v-if="editIndex === i" class="edit-card">
          <div class="edit-row">
            <label>{{ t('fields.name') }}：<input type="text" v-model.trim="editForm.name" /></label>
            <label>{{ t('fields.note') }}（{{ t('common.optional') }}）：<input type="text" v-model.trim="editForm.note" /></label>
          </div>

          <div class="edit-grid">
            <fieldset class="block">
              <legend>{{ t('fields.drink') }}</legend>
              <label><input type="radio" value="紅茶" v-model="editForm.drink" /> 紅茶</label>
              <label><input type="radio" value="綠茶" v-model="editForm.drink" /> 綠茶</label>
            </fieldset>

            <fieldset class="block">
              <legend>{{ t('fields.sweetness') }}</legend>
              <label><input type="radio" value="正常甜" v-model="editForm.sweetness" /> 正常甜</label>
              <label><input type="radio" value="去糖"   v-model="editForm.sweetness" /> 去糖</label>
            </fieldset>

            <fieldset class="block">
              <legend>{{ t('fields.ice') }}</legend>
              <label><input type="radio" value="正常冰" v-model="editForm.ice" /> 正常冰</label>
              <label><input type="radio" value="去冰"   v-model="editForm.ice" /> 去冰</label>
            </fieldset>
          </div>

          <div class="edit-actions">
            <button class="btn btn-sm primary" @click="applyEdit">{{ t('actions.save') }}</button>
            <button class="btn btn-sm" @click="cancelEdit">{{ t('actions.cancel') }}</button>
          </div>
        </div>
      </transition>
    </li>
  </TransitionGroup>
</template>

<style scoped>
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(6px); }
.list-enter-active, .list-leave-active { transition: all .14s ease; }
.list-move { transition: transform .14s ease; }
@media (prefers-reduced-motion: reduce) {
  .list-enter-active, .list-leave-active, .list-move { transition-duration: 0s; }
}
</style>
