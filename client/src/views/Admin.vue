<template>
  <div class="admin-page">
    <!-- 标题横幅 -->
    <div class="admin-banner">
      <div class="banner-text">
        <h2>⚙️ 菜品管理</h2>
        <p>添加、编辑或删除菜品</p>
      </div>
      <button class="add-btn" @click="openAdd">+ 添加菜品</button>
    </div>

    <!-- 菜品列表 -->
    <div class="dish-list">
      <div class="dish-table-header">
        <span class="col-name">菜品名称</span>
        <span class="col-price">价格</span>
        <span class="col-cat">分类</span>
        <span class="col-status">状态</span>
        <span class="col-actions">操作</span>
      </div>
      <div v-for="dish in orderStore.dishes" :key="dish.id" class="dish-row">
        <span class="col-name">{{ dish.name }}</span>
        <span class="col-price">¥{{ dish.price }}</span>
        <span class="col-cat"><span class="cat-tag">{{ dish.category }}</span></span>
        <span class="col-status">
          <span class="status-dot" :class="dish.available ? 'on' : 'off'"></span>
          {{ dish.available ? '在售' : '下架' }}
        </span>
        <span class="col-actions">
          <button class="edit-btn" @click="openEdit(dish)">编辑</button>
          <button class="toggle-btn" @click="toggleDish(dish)">
            {{ dish.available ? '下架' : '上架' }}
          </button>
          <button class="delete-btn" @click="deleteDish(dish)">删除</button>
        </span>
      </div>
      <div class="empty" v-if="!orderStore.dishes.length">暂无菜品</div>
    </div>

    <!-- 弹窗：添加/编辑 -->
    <n-modal v-model:show="showModal" preset="card" :title="editingDish ? '编辑菜品' : '添加菜品'" style="max-width: 420px;" :bordered="false">
      <n-form ref="formRef" :model="form" :rules="rules">
        <n-form-item label="菜品名称" path="name">
          <n-input v-model:value="form.name" placeholder="例如：红烧肉" />
        </n-form-item>
        <n-form-item label="价格（元）" path="price">
          <n-input-number v-model:value="form.price" :min="1" :max="9999" placeholder="例如：38" style="width: 100%;" />
        </n-form-item>
        <n-form-item label="分类" path="category">
          <n-select v-model:value="form.category" :options="categoryOptions" placeholder="选择分类" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="saving" @click="handleSave">
            {{ editingDish ? '保存' : '添加' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { useOrderStore } from '../stores/order'
import { NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NButton, NSpace } from 'naive-ui'

const message = useMessage()
const orderStore = useOrderStore()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingDish = ref(null)
const formRef = ref(null)

const form = ref({ name: '', price: null, category: '热菜' })
const rules = {
  name: { required: true, message: '请输入菜品名称', trigger: 'blur' },
  price: { required: true, type: 'number', message: '请输入价格', trigger: 'blur' },
  category: { required: true, message: '请选择分类', trigger: 'change' }
}

const categoryOptions = [
  { label: '热菜', value: '热菜' },
  { label: '素菜', value: '素菜' },
  { label: '凉菜', value: '凉菜' },
  { label: '汤类', value: '汤类' },
  { label: '主食', value: '主食' },
  { label: '饮品', value: '饮品' },
  { label: '默认', value: '默认' },
]

function openAdd() {
  editingDish.value = null
  form.value = { name: '', price: null, category: '热菜' }
  showModal.value = true
}

function openEdit(dish) {
  editingDish.value = dish
  form.value = { name: dish.name, price: dish.price, category: dish.category }
  showModal.value = true
}

async function handleSave() {
  try { await formRef.value?.validate() } catch { return }
  saving.value = true
  try {
    if (editingDish.value) {
      await orderStore.editDish(editingDish.value.id, form.value)
      message.success('菜品更新成功 ✅')
    } else {
      await orderStore.createDish(form.value)
      message.success('菜品添加成功 🎉')
    }
    showModal.value = false
    await orderStore.fetchAllDishes()
  } catch (err) {
    message.error(err.response?.data?.error || '操作失败')
  } finally {
    saving.value = false
  }
}

async function toggleDish(dish) {
  try {
    await orderStore.editDish(dish.id, { available: dish.available ? 0 : 1 })
    message.success(dish.available ? '已下架' : '已上架')
    await orderStore.fetchAllDishes()
  } catch (err) {
    message.error('操作失败')
  }
}

async function deleteDish(dish) {
  if (!confirm(`确定删除「${dish.name}」吗？`)) return
  try {
    await orderStore.removeDish(dish.id)
    message.success('菜品已删除')
    await orderStore.fetchAllDishes()
  } catch (err) {
    message.error('删除失败')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await orderStore.fetchAllDishes()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-page { display: flex; flex-direction: column; gap: 16px; max-width: 900px; margin: 0 auto; }

/* 横幅 */
.admin-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
  animation: fadeInUp 0.5s ease;
}
.banner-text h2 { font-size: 20px; font-weight: 700; }
.banner-text p { font-size: 14px; opacity: 0.9; margin-top: 4px; }
.add-btn {
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.5);
  color: #fff;
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  backdrop-filter: blur(10px);
}
.add-btn:hover { background: rgba(255,255,255,0.35); transform: translateY(-2px); }

/* 菜品表格 */
.dish-list {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  animation: fadeInUp 0.6s ease;
}
.dish-table-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  background: #fafafa;
  font-size: 12px;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #f0f0f0;
}
.dish-row {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f8f8f8;
  transition: background 0.2s;
}
.dish-row:hover { background: #fafafa; }
.col-name { flex: 2; font-weight: 600; color: #333; }
.col-price { flex: 1; font-weight: 700; color: #ff6b35; }
.col-cat { flex: 1; }
.cat-tag {
  background: #f0f0f0;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  color: #666;
}
.col-status { flex: 1; display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; }
.status-dot {
  width: 8px; height: 8px; border-radius: 50%;
}
.status-dot.on { background: #18a058; }
.status-dot.off { background: #ccc; }
.col-actions { flex: 2; display: flex; gap: 8px; justify-content: flex-end; }
.edit-btn, .toggle-btn, .delete-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.edit-btn { background: #e6f4ff; color: #2080f0; }
.edit-btn:hover { background: #2080f0; color: #fff; }
.toggle-btn { background: #fff7e6; color: #f0a020; }
.toggle-btn:hover { background: #f0a020; color: #fff; }
.delete-btn { background: #fff0f0; color: #d03050; }
.delete-btn:hover { background: #d03050; color: #fff; }
.empty { text-align: center; padding: 40px; color: #ccc; font-size: 16px; }

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 手机适配 */
@media (max-width: 600px) {
  .admin-banner { padding: 18px; border-radius: 16px; flex-direction: column; gap: 14px; text-align: center; }
  .banner-text h2 { font-size: 17px; }
  .add-btn { width: 100%; }
  .dish-table-header { display: none; }
  .dish-row {
    flex-wrap: wrap;
    gap: 8px;
    padding: 14px 16px;
  }
  .col-name { flex: unset; width: 100%; font-size: 15px; }
  .col-price { flex: unset; }
  .col-cat { flex: unset; }
  .col-status { flex: unset; }
  .col-actions { flex: unset; width: 100%; justify-content: flex-start; }
}
</style>
