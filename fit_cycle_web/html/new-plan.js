// 全局变量
let currentPlan = {
    name: '',
    type: 'fat-loss',
    isActive: true,
    cycleDays: 7,
    cycleCount: 3,
    dayTemplates: [],
    currentTemplateIndex: -1
};

let currentMealType = '';
let currentFoodItem = null;
let currentTemplate = null;

// 食物数据库
const foodDatabase = [
    { name: '燕麦粥', calories: 180, protein: 6, fat: 3, carbs: 30, unit: '50g' },
    { name: '牛奶', calories: 120, protein: 6, fat: 6, carbs: 9, unit: '200ml' },
    { name: '香蕉', calories: 80, protein: 1, fat: 0, carbs: 20, unit: '1根' },
    { name: '鸡胸肉', calories: 250, protein: 46, fat: 5, carbs: 0, unit: '150g' },
    { name: '糙米饭', calories: 180, protein: 4, fat: 2, carbs: 36, unit: '100g' },
    { name: '西兰花', calories: 35, protein: 3, fat: 0, carbs: 7, unit: '100g' },
    { name: '胡萝卜', calories: 30, protein: 1, fat: 0, carbs: 7, unit: '80g' },
    { name: '橄榄油', calories: 85, protein: 0, fat: 9, carbs: 0, unit: '1勺' },
    { name: '三文鱼', calories: 280, protein: 25, fat: 18, carbs: 0, unit: '120g' },
    { name: '蒸蛋', calories: 140, protein: 12, fat: 10, carbs: 1, unit: '2个' },
    { name: '菠菜', calories: 25, protein: 3, fat: 0, carbs: 4, unit: '100g' },
    { name: '紫薯', calories: 85, protein: 2, fat: 0, carbs: 20, unit: '100g' },
    { name: '酸奶', calories: 80, protein: 4, fat: 0, carbs: 12, unit: '150g' },
    { name: '杏仁', calories: 20, protein: 1, fat: 2, carbs: 1, unit: '10颗' },
    { name: '苹果', calories: 52, protein: 0, fat: 0, carbs: 14, unit: '1个' },
    { name: '鸡蛋', calories: 155, protein: 13, fat: 11, carbs: 1, unit: '2个' },
    { name: '全麦面包', calories: 120, protein: 4, fat: 2, carbs: 20, unit: '1片' },
    { name: '牛油果', calories: 160, protein: 2, fat: 15, carbs: 9, unit: '半个' },
    { name: '蓝莓', calories: 42, protein: 1, fat: 0, carbs: 11, unit: '100g' },
    { name: '核桃', calories: 185, protein: 4, fat: 18, carbs: 4, unit: '30g' }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    updateTotalDays();
});

// 初始化页面
function initializePage() {
    // 初始化动画
    anime({
        targets: '.glass-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
    
    // 初始化计划类型选择
    document.querySelectorAll('.plan-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.plan-type-btn').forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            this.classList.remove('bg-gray-100', 'text-gray-700');
            this.classList.add('bg-emerald-600', 'text-white');
            currentPlan.type = this.dataset.type;
        });
    });
    
    // 默认选中减脂
    document.querySelector('[data-type="fat-loss"]').classList.add('bg-emerald-600', 'text-white');
    document.querySelector('[data-type="fat-loss"]').classList.remove('bg-gray-100', 'text-gray-700');
}

// 设置事件监听器
function setupEventListeners() {
    // 周期天数和周期数量变化
    document.getElementById('cycleDays').addEventListener('input', updateTotalDays);
    document.getElementById('cycleCount').addEventListener('input', updateTotalDays);
    
    // 表单提交
    document.getElementById('customFoodForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createCustomFoodItem();
    });
    
    // 模态框关闭
    document.getElementById('foodModal').addEventListener('click', function(e) {
        if (e.target === this) closeFoodModal();
    });
    document.getElementById('quantityModal').addEventListener('click', function(e) {
        if (e.target === this) closeQuantityModal();
    });
}

// 更新总天数
function updateTotalDays() {
    const cycleDays = parseInt(document.getElementById('cycleDays').value) || 0;
    const cycleCount = parseInt(document.getElementById('cycleCount').value) || 0;
    const totalDays = cycleDays * cycleCount;
    
    document.getElementById('totalDays').textContent = totalDays + ' 天';
    
    // 更新模板计数显示
    updateTemplateCount();
}

// 更新模板计数显示
function updateTemplateCount() {
    const cycleDays = parseInt(document.getElementById('cycleDays').value) || 0;
    const currentCount = currentPlan.dayTemplates.length;
    document.getElementById('templateCount').textContent = `${currentCount} / ${cycleDays} 个模板`;
}

// 添加新模板
function addNewTemplate() {
    const cycleDays = parseInt(document.getElementById('cycleDays').value) || 7;
    
    if (currentPlan.dayTemplates.length >= cycleDays) {
        showSuccessMessage('已达到本周期最大天数');
        return;
    }
    
    const newTemplate = {
        id: 'template_' + Date.now(),
        dayNumber: currentPlan.dayTemplates.length + 1,
        name: `Day${currentPlan.dayTemplates.length + 1}`,
        target: {
            calories: 1800,
            protein: 120,
            fat: 50,
            carbs: 180
        },
        meals: {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        }
    };
    
    currentPlan.dayTemplates.push(newTemplate);
    renderTemplateList();
    updateTemplateCount();
    
    // 自动选中新创建的模板
    selectTemplate(currentPlan.dayTemplates.length - 1);
    
    showSuccessMessage('日模板已添加');
}

// 渲染模板列表
function renderTemplateList() {
    const container = document.getElementById('templateList');
    container.innerHTML = '';
    
    currentPlan.dayTemplates.forEach((template, index) => {
        const templateCard = document.createElement('div');
        templateCard.className = `template-card bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between ${index === currentPlan.currentTemplateIndex ? 'active' : ''}`;
        templateCard.innerHTML = `
            <div class="flex items-center">
                <div class="drag-handle w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 mr-3">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                    </svg>
                </div>
                <div>
                    <div class="font-medium text-gray-800">${template.name}</div>
                    <div class="text-xs text-gray-500">
                        Day${template.dayNumber} · ${template.target.calories} kcal
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="copyTemplate(${index})" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                </button>
                <button onclick="showTemplateMenu(${index})" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                </button>
            </div>
        `;
        
        templateCard.addEventListener('click', () => selectTemplate(index));
        container.appendChild(templateCard);
    });
    
    // 添加动画
    anime({
        targets: '.template-card',
        translateX: [-20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 选择模板
function selectTemplate(index) {
    currentPlan.currentTemplateIndex = index;
    currentTemplate = currentPlan.dayTemplates[index];
    
    // 更新模板列表样式
    document.querySelectorAll('.template-card').forEach((card, i) => {
        if (i === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // 显示模板详情
    showTemplateDetail();
}

// 显示模板详情
function showTemplateDetail() {
    if (!currentTemplate) return;
    
    const detailSection = document.getElementById('templateDetail');
    const detailTitle = document.getElementById('detailTitle');
    
    detailTitle.textContent = `${currentTemplate.name} 详情`;
    
    // 填充模板信息
    document.getElementById('templateName').value = currentTemplate.name;
    document.getElementById('targetCalories').value = currentTemplate.target.calories;
    document.getElementById('targetProtein').value = currentTemplate.target.protein;
    document.getElementById('targetFat').value = currentTemplate.target.fat;
    document.getElementById('targetCarbs').value = currentTemplate.target.carbs;
    
    // 渲染餐单
    renderMealSections();
    
    // 显示详情区域
    detailSection.style.display = 'block';
    
    // 添加显示动画
    anime({
        targets: detailSection,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// 渲染餐单区域
function renderMealSections() {
    const container = document.getElementById('mealSections');
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const mealNames = ['早餐', '午餐', '晚餐', '加餐'];
    const mealEmojis = ['🌅', '☀️', '🌙', '🍎'];
    
    container.innerHTML = '';
    
    meals.forEach((meal, index) => {
        const mealSection = document.createElement('div');
        mealSection.className = 'bg-gray-50 rounded-lg p-3';
        
        const foods = currentTemplate.meals[meal] || [];
        const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
        
        mealSection.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h5 class="font-medium text-gray-800">${mealEmojis[index]} ${mealNames[index]}</h5>
                <span class="text-sm text-gray-600">${totalCalories} kcal</span>
            </div>
            <div class="space-y-1 mb-2" id="${meal}Items">
                ${foods.map(food => `
                    <div class="flex items-center justify-between p-2 bg-white rounded text-sm">
                        <span>${food.name} · ${food.quantity}${food.unit}</span>
                        <div class="flex items-center space-x-1">
                            <span class="text-gray-600">${food.calories} kcal</span>
                            <button onclick="removeFoodFromMeal('${meal}', '${food.id}')" class="text-red-400 hover:text-red-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button onclick="addFoodToMeal('${meal}')" class="w-full text-left p-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded transition-colors">
                + 添加食物
            </button>
        `;
        
        container.appendChild(mealSection);
    });
}

// 添加食物到餐单
function addFoodToMeal(mealType) {
    currentMealType = mealType;
    showFoodModal();
}

// 显示食物选择模态框
function showFoodModal() {
    const modal = document.getElementById('foodModal');
    const foodList = document.getElementById('foodListModal');
    
    // 清空并填充食物列表
    foodList.innerHTML = '';
    foodDatabase.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50';
        foodItem.innerHTML = `
            <div>
                <div class="font-medium text-gray-800">${food.name}</div>
                <div class="text-xs text-gray-500">${food.unit} · ${food.calories} kcal</div>
            </div>
            <div class="text-sm text-gray-600">${food.calories} kcal</div>
        `;
        foodItem.onclick = () => selectFoodForMeal(food);
        foodList.appendChild(foodItem);
    });
    
    modal.classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: modal.querySelector('.bg-white'),
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭食物选择模态框
function closeFoodModal() {
    const modal = document.getElementById('foodModal');
    modal.classList.add('hidden');
}

// 为餐单选择食物
function selectFoodForMeal(food) {
    currentFoodItem = food;
    closeFoodModal();
    showQuantityModal(food);
}

// 显示数量输入模态框
function showQuantityModal(food) {
    const modal = document.getElementById('quantityModal');
    document.getElementById('foodName').textContent = food.name;
    document.getElementById('foodUnit').textContent = `每${food.unit}`;
    document.getElementById('foodQuantity').value = 100;
    
    modal.classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭数量输入模态框
function closeQuantityModal() {
    const modal = document.getElementById('quantityModal');
    modal.classList.add('hidden');
}

// 确认添加食物到餐单
function confirmAddFoodToMeal() {
    const quantity = parseFloat(document.getElementById('foodQuantity').value);
    const unit = document.getElementById('foodUnitSelect').value;
    
    if (!quantity || quantity <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    if (!currentFoodItem || !currentMealType || !currentTemplate) {
        alert('数据错误，请重试');
        return;
    }
    
    // 计算实际营养值
    const ratio = quantity / 100;
    const foodItem = {
        id: 'food_' + Date.now(),
        name: currentFoodItem.name,
        quantity: quantity,
        unit: unit,
        calories: Math.round(currentFoodItem.calories * ratio),
        protein: Math.round(currentFoodItem.protein * ratio * 10) / 10,
        fat: Math.round(currentFoodItem.fat * ratio * 10) / 10,
        carbs: Math.round(currentFoodItem.carbs * ratio * 10) / 10
    };
    
    // 添加到当前模板的餐单
    currentTemplate.meals[currentMealType].push(foodItem);
    
    // 重新渲染餐单
    renderMealSections();
    
    closeQuantityModal();
    showSuccessMessage('食物已添加到餐单');
}

// 从餐单移除食物
function removeFoodFromMeal(mealType, foodId) {
    if (!currentTemplate) return;
    
    currentTemplate.meals[mealType] = currentTemplate.meals[mealType].filter(food => food.id !== foodId);
    renderMealSections();
    showSuccessMessage('食物已移除');
}

// 复制模板
function copyTemplate(index) {
    const cycleDays = parseInt(document.getElementById('cycleDays').value) || 7;
    
    if (currentPlan.dayTemplates.length >= cycleDays) {
        showSuccessMessage('已达到本周期最大天数');
        return;
    }
    
    const sourceTemplate = currentPlan.dayTemplates[index];
    const newTemplate = {
        ...JSON.parse(JSON.stringify(sourceTemplate)), // 深拷贝
        id: 'template_' + Date.now(),
        dayNumber: currentPlan.dayTemplates.length + 1,
        name: sourceTemplate.name + '-副本'
    };
    
    currentPlan.dayTemplates.push(newTemplate);
    renderTemplateList();
    updateTemplateCount();
    showSuccessMessage('模板已复制');
}

// 显示模板菜单
function showTemplateMenu(index) {
    const template = currentPlan.dayTemplates[index];
    
    if (confirm(`确定要删除"${template.name}"吗？`)) {
        if (currentPlan.dayTemplates.length <= 1) {
            showSuccessMessage('至少保留1个日模板');
            return;
        }
        
        currentPlan.dayTemplates.splice(index, 1);
        
        // 重新编号
        currentPlan.dayTemplates.forEach((template, i) => {
            template.dayNumber = i + 1;
        });
        
        renderTemplateList();
        updateTemplateCount();
        
        // 如果删除的是当前选中的模板，清除选择
        if (index === currentPlan.currentTemplateIndex) {
            currentPlan.currentTemplateIndex = -1;
            currentTemplate = null;
            document.getElementById('templateDetail').style.display = 'none';
        }
        
        showSuccessMessage('模板已删除');
    }
}

// 一键补满周期
function fillCycleWithTemplates() {
    const cycleDays = parseInt(document.getElementById('cycleDays').value) || 7;
    const currentCount = currentPlan.dayTemplates.length;
    
    if (currentCount >= cycleDays) {
        showSuccessMessage('当前已达到或超过周期天数');
        return;
    }
    
    if (currentCount === 0) {
        showSuccessMessage('请至少创建1个模板');
        return;
    }
    
    for (let i = currentCount; i < cycleDays; i++) {
        const sourceIndex = i % currentCount;
        const sourceTemplate = currentPlan.dayTemplates[sourceIndex];
        const newTemplate = {
            ...JSON.parse(JSON.stringify(sourceTemplate)),
            id: 'template_' + Date.now() + '_' + i,
            dayNumber: i + 1,
            name: sourceTemplate.name + (i >= currentCount ? `-${String.fromCharCode(65 + Math.floor(i / currentCount))}` : '')
        };
        currentPlan.dayTemplates.push(newTemplate);
    }
    
    renderTemplateList();
    updateTemplateCount();
    showSuccessMessage(`已自动补满至${cycleDays}天`);
}

// 重置模板排序
function resetTemplateOrder() {
    currentPlan.dayTemplates.forEach((template, index) => {
        template.dayNumber = index + 1;
        template.name = `Day${index + 1}`;
    });
    
    renderTemplateList();
    showSuccessMessage('模板排序已重置');
}

// 删除当前模板
function deleteCurrentTemplate() {
    if (!currentTemplate || currentPlan.currentTemplateIndex === -1) return;
    
    showTemplateMenu(currentPlan.currentTemplateIndex);
}

// 保存模板详情
function saveTemplateDetail() {
    if (!currentTemplate) return;
    
    currentTemplate.name = document.getElementById('templateName').value || currentTemplate.name;
    currentTemplate.target = {
        calories: parseInt(document.getElementById('targetCalories').value) || 1800,
        protein: parseInt(document.getElementById('targetProtein').value) || 120,
        fat: parseInt(document.getElementById('targetFat').value) || 50,
        carbs: parseInt(document.getElementById('targetCarbs').value) || 180
    };
    
    // 重新渲染模板列表
    renderTemplateList();
    
    showSuccessMessage('模板详情已保存');
}

// 保存计划
function savePlan() {
    // 验证必填字段
    const planName = document.getElementById('planName').value.trim();
    if (!planName) {
        alert('请输入计划名称');
        return;
    }
    
    if (currentPlan.dayTemplates.length === 0) {
        alert('请至少创建1个日模板');
        return;
    }
    
    // 保存当前模板详情
    if (currentTemplate) {
        saveTemplateDetail();
    }
    
    // 更新计划基本信息
    currentPlan.name = planName;
    currentPlan.isActive = document.getElementById('setActive').checked;
    currentPlan.cycleDays = parseInt(document.getElementById('cycleDays').value) || 7;
    currentPlan.cycleCount = parseInt(document.getElementById('cycleCount').value) || 3;
    
    // 保存到本地存储
    const plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    currentPlan.id = 'plan_' + Date.now();
    currentPlan.createdAt = new Date().toISOString();
    plans.push(currentPlan);
    localStorage.setItem('dietPlans', JSON.stringify(plans));
    
    // 显示成功消息
    showSuccessMessage('计划保存成功！');
    
    // 跳转到计划列表页
    setTimeout(() => {
        window.location.href = 'plan.html';
    }, 2000);
}

// 取消计划
function cancelPlan() {
    if (confirm('确定要放弃当前编辑吗？未保存的数据将丢失。')) {
        window.history.back();
    }
}

// 返回上一页
function goBack() {
    if (currentPlan.dayTemplates.length > 0 || document.getElementById('planName').value.trim()) {
        if (confirm('有未保存的更改，确定要离开吗？')) {
            window.history.back();
        }
    } else {
        window.history.back();
    }
}

// 显示成功消息
function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 添加显示动画
    anime({
        targets: toast,
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 3秒后自动消失
    setTimeout(() => {
        anime({
            targets: toast,
            translateY: [0, -20],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(toast);
            }
        });
    }, 3000);
}