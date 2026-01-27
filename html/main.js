// 全局变量
let currentDate = new Date();
let currentMealType = '';
let currentFoodItem = null;
let mealData = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
};

// 当前激活的计划
let activePlan = null;

// 示例食物数据库
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
    loadMealData();
    checkLoginStatus();
    loadActivePlan();
});

// 初始化页面
function initializePage() {
    updateDateDisplay();
    
    // 初始化动画
    anime({
        targets: '.glass-card, .meal-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// 检查登录状态
function checkLoginStatus() {
    const userToken = localStorage.getItem('userToken');
    const demoMode = localStorage.getItem('demoMode');
    
    if (!userToken && !demoMode) {
        // 未登录，跳转到登录页
        window.location.href = 'login.html';
        return;
    }
    
    // 显示用户信息
    if (userToken) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        console.log('用户已登录:', userInfo.nickName);
    } else if (demoMode) {
        console.log('体验模式');
    }
}

// 加载激活计划
function loadActivePlan() {
    const plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    activePlan = plans.find(plan => plan.isActive);
    
    if (activePlan) {
        console.log('当前激活计划:', activePlan.name);
        updatePlanDisplay();
    }
}

// 更新计划显示
function updatePlanDisplay() {
    if (activePlan) {
        document.getElementById('currentPlan').textContent = `当前计划：${activePlan.name}`;
        
        // 更新目标热量
        if (activePlan.dayTemplates && activePlan.dayTemplates.length > 0) {
            const avgCalories = activePlan.dayTemplates.reduce((sum, template) => sum + template.target.calories, 0) / activePlan.dayTemplates.length;
            document.getElementById('calorieGoal').textContent = Math.round(avgCalories);
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 日期导航
    document.getElementById('prevDate').addEventListener('click', () => changeDate(-1));
    document.getElementById('nextDate').addEventListener('click', () => changeDate(1));
    document.getElementById('calendarBtn').addEventListener('click', showCalendar);
    
    // 模态框关闭
    document.getElementById('foodModal').addEventListener('click', function(e) {
        if (e.target === this) closeFoodModal();
    });
    document.getElementById('quantityModal').addEventListener('click', function(e) {
        if (e.target === this) closeQuantityModal();
    });
}

// 更新日期显示
function updateDateDisplay() {
    const options = { month: 'long', day: 'numeric' };
    const dateStr = currentDate.toLocaleDateString('zh-CN', options);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    document.getElementById('currentDate').textContent = isToday ? `今天 · ${dateStr}` : dateStr;
}

// 切换日期
function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateDateDisplay();
    loadMealData();
    updateNutritionStats();
    updateRecommendedMeals();
    
    // 添加切换动画
    anime({
        targets: '.meal-card',
        translateX: [days > 0 ? 50 : -50, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// 显示日历选择器
function showCalendar() {
    alert('日历选择器功能开发中...');
}

// 加载餐食数据
function loadMealData() {
    // 这里应该从本地存储加载数据
    // 现在使用示例数据
    updateMealDisplay();
    updateRecommendedMeals();
}

// 更新推荐餐食（基于激活计划）
function updateRecommendedMeals() {
    if (!activePlan || !activePlan.dayTemplates || activePlan.dayTemplates.length === 0) {
        // 没有激活计划，隐藏推荐按钮
        document.querySelectorAll('[onclick*="addPlannedMeal"]').forEach(btn => {
            btn.style.display = 'none';
        });
        return;
    }
    
    // 计算当前日期对应的日模板
    const dayInCycle = getCurrentDayInCycle();
    const currentTemplate = activePlan.dayTemplates[dayInCycle - 1] || activePlan.dayTemplates[0];
    
    // 更新推荐按钮文案
    document.querySelectorAll('[onclick*="addPlannedMeal"]').forEach((btn, index) => {
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        const mealType = mealTypes[index];
        const mealFoods = currentTemplate.meals[mealType] || [];
        
        if (mealFoods.length > 0) {
            btn.style.display = 'block';
            btn.textContent = `按计划记录${getMealName(mealType)}`;
            
            // 显示计划提示
            const planHint = btn.parentNode.querySelector('.text-xs');
            if (planHint) {
                const foodNames = mealFoods.slice(0, 2).map(f => f.name).join('、');
                planHint.textContent = `计划：${foodNames}${mealFoods.length > 2 ? '等' : ''}`;
            }
        } else {
            btn.style.display = 'none';
        }
    });
}

// 获取当前在周期中的天数
function getCurrentDayInCycle() {
    if (!activePlan || !activePlan.createdAt) return 1;
    
    const startDate = new Date(activePlan.createdAt);
    const today = new Date();
    const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    return ((daysDiff % activePlan.cycleDays) + 1);
}

// 获取餐次名称
function getMealName(mealType) {
    const mealNames = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐',
        snacks: '加餐'
    };
    return mealNames[mealType] || '';
}

// 更新餐食显示
function updateMealDisplay() {
    const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
    const mealNames = ['早餐', '午餐', '晚餐', '加餐'];
    
    meals.forEach((meal, index) => {
        const container = document.getElementById(meal + 'Items');
        const caloriesElement = document.getElementById(meal + 'Calories');
        let totalCalories = 0;
        
        // 计算总热量
        container.querySelectorAll('.food-item').forEach(item => {
            const caloriesText = item.querySelector('.text-sm.text-gray-600').textContent;
            const calories = parseInt(caloriesText.split(' ')[0]);
            totalCalories += calories;
        });
        
        caloriesElement.textContent = `${totalCalories} kcal`;
    });
}

// 更新营养统计
function updateNutritionStats() {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    // 计算所有餐食的总营养
    document.querySelectorAll('.food-item').forEach(item => {
        const caloriesText = item.querySelector('.text-sm.text-gray-600').textContent;
        const calories = parseInt(caloriesText.split(' ')[0]);
        totalCalories += calories;
        
        // 这里应该从食物数据库获取详细营养信息
        // 现在使用估算值
        totalProtein += calories * 0.15; // 估算蛋白质
        totalFat += calories * 0.25; // 估算脂肪
        totalCarbs += calories * 0.45; // 估算碳水
    });
    
    // 更新显示
    document.getElementById('calorieConsumed').textContent = totalCalories;
    document.getElementById('proteinText').textContent = `${Math.round(totalProtein)} / 120g`;
    document.getElementById('fatText').textContent = `${Math.round(totalFat)} / 50g`;
    document.getElementById('carbText').textContent = `${Math.round(totalCarbs)} / 180g`;
    
    // 更新进度条
    const proteinPercent = Math.min((totalProtein / 120) * 100, 100);
    const fatPercent = Math.min((totalFat / 50) * 100, 100);
    const carbPercent = Math.min((totalCarbs / 180) * 100, 100);
    
    document.getElementById('proteinBar').style.width = `${proteinPercent}%`;
    document.getElementById('fatBar').style.width = `${fatPercent}%`;
    document.getElementById('carbBar').style.width = `${carbPercent}%`;
    
    // 更新建议
    updateNutritionAdvice(totalCalories, totalProtein, totalFat, totalCarbs);
}

// 更新营养建议
function updateNutritionAdvice(calories, protein, fat, carbs) {
    const adviceElement = document.getElementById('nutritionAdvice');
    let advice = '';
    
    if (calories < 1500) {
        advice = '热量摄入略低，建议适当增加健康食物的摄入。';
    } else if (calories > 1800) {
        advice = '热量摄入略高，建议控制食物分量。';
    } else {
        advice = '热量摄入适中，';
    }
    
    if (protein < 100) {
        advice += '蛋白质摄入不足，建议增加优质蛋白食物。';
    } else if (protein > 140) {
        advice += '蛋白质摄入充足，继续保持。';
    }
    
    if (calories >= 1500 && calories <= 1800 && protein >= 100) {
        advice = '今日饮食结构良好，营养均衡，继续保持健康饮食习惯！';
    }
    
    adviceElement.textContent = advice;
}

// 添加食物
function addFoodItem(mealType) {
    currentMealType = mealType;
    showFoodModal();
}

// 显示食物选择模态框
function showFoodModal() {
    const modal = document.getElementById('foodModal');
    const foodList = document.getElementById('foodList');
    
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
        foodItem.onclick = () => selectFood(food);
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

// 选择食物
function selectFood(food) {
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

// 确认添加食物
function confirmAddFood() {
    const quantity = parseFloat(document.getElementById('foodQuantity').value);
    const unit = document.getElementById('foodUnitSelect').value;
    
    if (!quantity || quantity <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    if (!currentFoodItem || !currentMealType) {
        alert('数据错误，请重试');
        return;
    }
    
    // 计算实际营养值
    const ratio = quantity / 100;
    const actualCalories = Math.round(currentFoodItem.calories * ratio);
    
    // 创建新的食物项
    const foodElement = document.createElement('div');
    foodElement.className = 'food-item flex items-center justify-between p-2 bg-gray-50 rounded-lg';
    foodElement.innerHTML = `
        <div>
            <div class="font-medium text-gray-800">${currentFoodItem.name}</div>
            <div class="text-xs text-gray-500">${quantity}${unit}</div>
        </div>
        <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">${actualCalories} kcal</span>
            <button class="text-gray-400 hover:text-gray-600" onclick="editFoodItem(this)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
            </button>
        </div>
    `;
    
    // 添加到对应的餐食区域
    const container = document.getElementById(currentMealType + 'Items');
    container.appendChild(foodElement);
    
    // 添加动画
    anime({
        targets: foodElement,
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
    
    // 更新统计
    updateMealDisplay();
    updateNutritionStats();
    
    closeQuantityModal();
    
    // 显示成功提示
    showSuccessMessage('食物添加成功！');
}

// 编辑食物项
function editFoodItem(button) {
    const foodItem = button.closest('.food-item');
    const foodName = foodItem.querySelector('.font-medium').textContent;
    
    if (confirm(`确定要删除"${foodName}"吗？`)) {
        // 添加删除动画
        anime({
            targets: foodItem,
            translateX: -100,
            opacity: 0,
            duration: 300,
            easing: 'easeInQuart',
            complete: function() {
                foodItem.remove();
                updateMealDisplay();
                updateNutritionStats();
                showSuccessMessage('食物已删除');
            }
        });
    }
}

// 按计划记录餐食（新增功能）
function addPlannedMeal(mealType) {
    if (!activePlan || !activePlan.dayTemplates || activePlan.dayTemplates.length === 0) {
        showSuccessMessage('请先创建并激活一个饮食计划');
        return;
    }
    
    currentMealType = mealType;
    
    // 计算当前日期对应的日模板
    const dayInCycle = getCurrentDayInCycle();
    const currentTemplate = activePlan.dayTemplates[dayInCycle - 1] || activePlan.dayTemplates[0];
    const mealFoods = currentTemplate.meals[mealType] || [];
    
    if (mealFoods.length === 0) {
        showSuccessMessage('该餐次没有预设食物，请先编辑计划');
        return;
    }
    
    // 清空现有餐食
    const container = document.getElementById(mealType + 'Items');
    const existingItems = container.querySelectorAll('.food-item');
    
    // 添加删除动画
    existingItems.forEach((item, index) => {
        anime({
            targets: item,
            translateX: -100,
            opacity: 0,
            delay: index * 50,
            duration: 300,
            easing: 'easeInQuart',
            complete: function() {
                item.remove();
            }
        });
    });
    
    // 添加计划餐食
    setTimeout(() => {
        mealFoods.forEach((food, index) => {
            const foodElement = document.createElement('div');
            foodElement.className = 'food-item flex items-center justify-between p-2 bg-gray-50 rounded-lg';
            foodElement.innerHTML = `
                <div>
                    <div class="font-medium text-gray-800">${food.name}</div>
                    <div class="text-xs text-gray-500">${food.quantity}${food.unit}</div>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-600">${food.calories} kcal</span>
                    <button class="text-gray-400 hover:text-gray-600" onclick="editFoodItem(this)">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                </div>
            `;
            
            container.appendChild(foodElement);
            
            // 添加动画
            anime({
                targets: foodElement,
                translateY: [20, 0],
                opacity: [0, 1],
                delay: index * 100,
                duration: 400,
                easing: 'easeOutQuart'
            });
        });
        
        updateMealDisplay();
        updateNutritionStats();
        showSuccessMessage(`已按计划添加${getMealName(mealType)}`);
    }, existingItems.length * 50 + 100);
}

// 快速添加食物
function quickAddFood() {
    // 显示快速添加菜单
    const quickFoods = ['苹果', '鸡蛋', '全麦面包', '酸奶', '香蕉'];
    const randomFood = quickFoods[Math.floor(Math.random() * quickFoods.length)];
    
    showSuccessMessage(`快速添加：${randomFood}`);
    
    // 这里可以跳转到添加食物界面
    setTimeout(() => {
        addFoodItem('snacks');
    }, 1000);
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

// 导航栏切换动画
document.addEventListener('DOMContentLoaded', function() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            if (!this.classList.contains('active')) {
                e.preventDefault();
                
                // 移除所有活动状态
                navTabs.forEach(t => t.classList.remove('active'));
                
                // 添加活动状态
                this.classList.add('active');
                
                // 添加切换动画
                anime({
                    targets: this,
                    scale: [0.95, 1],
                    duration: 200,
                    easing: 'easeOutQuart'
                });
                
                // 延迟跳转
                const href = this.getAttribute('href');
                setTimeout(() => {
                    window.location.href = href;
                }, 200);
            }
        });
    });
});

// 页面滚动效果
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-title');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// 响应式处理
function handleResize() {
    const width = window.innerWidth;
    if (width < 768) {
        // 移动端优化
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

window.addEventListener('resize', handleResize);
handleResize(); // 初始调用