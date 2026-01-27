// 每日计划页面逻辑
class DailyPlan {
    constructor() {
        this.planId = this.getPlanId();
        this.dayId = this.getDayId();
        this.plan = null;
        this.day = null;
        this.currentMeal = 'breakfast';
        this.currentNutrition = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0
        };
        
        this.init();
    }
    
    init() {
        if (!this.planId || !this.dayId) {
            this.showToast('参数错误', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        this.loadData();
        this.setupEventListeners();
        this.renderPage();
        this.updateNutritionDisplay();
        this.loadQuickSuggestions();
    }
    
    getPlanId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('planId');
    }
    
    getDayId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('dayId');
    }
    
    loadData() {
        const plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
        this.plan = plans.find(p => p.id === this.planId);
        
        if (!this.plan) {
            this.showToast('未找到计划', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        this.day = this.plan.dailyPlans.find(d => d.id === this.dayId);
        
        if (!this.day) {
            this.showToast('未找到日期', 'error');
            setTimeout(() => {
                window.location.href = `daily-list.html?planId=${this.planId}`;
            }, 2000);
            return;
        }
    }
    
    setupEventListeners() {
        // 餐次标签切换
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const meal = e.target.dataset.meal;
                this.switchMeal(meal);
            });
        });
        
        // 编辑目标输入框
        ['editCalories', 'editProtein', 'editFat', 'editCarbs'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                this.validateTargetInput(e.target);
            });
        });
        
        // 监听来自iframe的消息
        window.addEventListener('message', (e) => {
            if (e.data.type === 'addFood') {
                this.addFoodFromSelector(e.data.food);
            }
        });
    }
    
    renderPage() {
        // 更新页面标题
        document.getElementById('dayName').textContent = this.day.name;
        document.getElementById('dayDate').textContent = this.formatDate(new Date(this.day.date));
        
        // 渲染当前餐次
        this.renderCurrentMeal();
    }
    
    switchMeal(meal) {
        this.currentMeal = meal;
        
        // 更新标签样式
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        });
        
        const activeBtn = document.querySelector(`[data-meal="${meal}"]`);
        activeBtn.classList.add('active');
        activeBtn.classList.remove('bg-gray-100', 'text-gray-600');
        
        // 渲染当前餐次
        this.renderCurrentMeal();
        
        // 添加动画
        anime({
            targets: '#currentMealCard',
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
    
    renderCurrentMeal() {
        const mealNames = {
            breakfast: '早餐',
            lunch: '午餐',
            dinner: '晚餐',
            snacks: '加餐'
        };
        
        document.getElementById('currentMealName').textContent = mealNames[this.currentMeal];
        
        const mealData = this.day.meals[this.currentMeal] || [];
        const mealCalories = this.calculateMealNutrition(mealData).calories;
        
        document.getElementById('currentMealCalories').textContent = `${mealCalories} kcal`;
        
        // 渲染食物列表
        this.renderFoodList(mealData);
        
        // 更新整体营养显示
        this.updateNutritionDisplay();
    }
    
    renderFoodList(foods) {
        const container = document.getElementById('foodList');
        container.innerHTML = '';
        
        if (foods.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <svg class="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    <p>还没有添加食物</p>
                    <p class="text-sm">点击下方按钮添加食物</p>
                </div>
            `;
            return;
        }
        
        foods.forEach((food, index) => {
            const foodItem = this.createFoodItem(food, index);
            container.appendChild(foodItem);
        });
    }
    
    createFoodItem(food, index) {
        const item = document.createElement('div');
        item.className = 'food-item flex items-center justify-between p-3 rounded-lg border border-gray-200';
        
        const nutrition = this.calculateFoodNutrition(food);
        
        item.innerHTML = `
            <div class="flex-1">
                <div class="font-medium text-gray-800">${food.name}</div>
                <div class="text-sm text-gray-600">
                    ${food.quantity}${food.unit} · ${nutrition.calories}kcal
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    蛋白质 ${nutrition.protein}g · 脂肪 ${nutrition.fat}g · 碳水 ${nutrition.carbs}g
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="editFood(${index})" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                </button>
                <button onclick="removeFood(${index})" class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            </div>
        `;
        
        return item;
    }
    
    calculateFoodNutrition(food) {
        const ratio = food.quantity / 100;
        return {
            calories: Math.round(food.calories * ratio),
            protein: Math.round(food.protein * ratio * 10) / 10,
            fat: Math.round(food.fat * ratio * 10) / 10,
            carbs: Math.round(food.carbs * ratio * 10) / 10
        };
    }
    
    calculateMealNutrition(foods) {
        return foods.reduce((total, food) => {
            const nutrition = this.calculateFoodNutrition(food);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                fat: total.fat + nutrition.fat,
                carbs: total.carbs + nutrition.carbs
            };
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    }
    
    updateNutritionDisplay() {
        const allMeals = Object.values(this.day.meals).flat();
        this.currentNutrition = allMeals.reduce((total, food) => {
            const nutrition = this.calculateFoodNutrition(food);
            return {
                calories: total.calories + nutrition.calories,
                protein: total.protein + nutrition.protein,
                fat: total.fat + nutrition.fat,
                carbs: total.carbs + nutrition.carbs
            };
        }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
        
        const targets = this.day.targets;
        
        // 更新热量显示
        document.getElementById('currentCalories').textContent = `${Math.round(this.currentNutrition.calories)}/${targets.calories}`;
        document.getElementById('caloriesText').textContent = `${Math.round(this.currentNutrition.calories)}/${targets.calories} kcal`;
        const caloriesPercent = targets.calories > 0 ? (this.currentNutrition.calories / targets.calories) * 100 : 0;
        document.getElementById('caloriesBar').style.width = `${Math.min(caloriesPercent, 100)}%`;
        
        // 更新其他营养素显示
        const nutrients = ['protein', 'fat', 'carbs'];
        const nutrientNames = { protein: '蛋白质', fat: '脂肪', carbs: '碳水' };
        
        nutrients.forEach(nutrient => {
            const current = Math.round(this.currentNutrition[nutrient] * 10) / 10;
            const target = targets[nutrient];
            const percent = target > 0 ? (this.currentNutrition[nutrient] / target) * 100 : 0;
            
            document.getElementById(`${nutrient}Text`).textContent = `${current}/${target} g`;
            document.getElementById(`${nutrient}Bar`).style.width = `${Math.min(percent, 100)}%`;
        });
    }
    
    loadQuickSuggestions() {
        const suggestions = [
            { name: '煮鸡蛋', quantity: 1, unit: '个', calories: 70, protein: 6, fat: 5, carbs: 1 },
            { name: '燕麦片', quantity: 50, unit: 'g', calories: 180, protein: 6, fat: 3, carbs: 30 },
            { name: '牛奶', quantity: 250, unit: 'ml', calories: 150, protein: 8, fat: 8, carbs: 12 },
            { name: '香蕉', quantity: 1, unit: '根', calories: 90, protein: 1, fat: 0, carbs: 23 }
        ];
        
        const container = document.getElementById('quickSuggestions');
        container.innerHTML = '';
        
        suggestions.forEach((food, index) => {
            const button = document.createElement('button');
            button.className = 'flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left';
            button.onclick = () => this.addQuickFood(food);
            
            const nutrition = this.calculateFoodNutrition(food);
            
            button.innerHTML = `
                <div>
                    <div class="font-medium text-gray-800 text-sm">${food.name}</div>
                    <div class="text-xs text-gray-600">${nutrition.calories}kcal</div>
                </div>
                <div class="text-xs text-gray-500">+</div>
            `;
            
            container.appendChild(button);
        });
    }
    
    addQuickFood(food) {
        if (!this.day.meals[this.currentMeal]) {
            this.day.meals[this.currentMeal] = [];
        }
        
        this.day.meals[this.currentMeal].push(food);
        this.day.isConfigured = true;
        
        this.savePlan();
        this.renderCurrentMeal();
        this.updateNutritionDisplay();
        
        this.showToast(`已添加 ${food.name}`, 'success');
    }
    
    addFoodFromSelector(food) {
        if (!this.day.meals[this.currentMeal]) {
            this.day.meals[this.currentMeal] = [];
        }
        
        this.day.meals[this.currentMeal].push(food);
        this.day.isConfigured = true;
        
        this.savePlan();
        this.renderCurrentMeal();
        this.updateNutritionDisplay();
        
        this.showToast(`已添加 ${food.name}`, 'success');
        
        // 关闭食物选择模态框
        closeFoodModal();
    }
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[date.getDay()];
        return `${year}年${month}月${day}日 ${weekday}`;
    }
    
    validateTargetInput(input) {
        const value = parseInt(input.value);
        const min = 0;
        const max = input.id === 'editCalories' ? 5000 : 500;
        
        if (value < min || value > max) {
            input.classList.add('border-red-500');
        } else {
            input.classList.remove('border-red-500');
        }
    }
    
    savePlan() {
        const plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
        const planIndex = plans.findIndex(p => p.id === this.planId);
        
        if (planIndex !== -1) {
            const dayIndex = plans[planIndex].dailyPlans.findIndex(d => d.id === this.dayId);
            if (dayIndex !== -1) {
                plans[planIndex].dailyPlans[dayIndex] = this.day;
                localStorage.setItem('dietPlans', JSON.stringify(plans));
            }
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 ${
            type === 'success' ? 'bg-emerald-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        anime({
            targets: toast,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        setTimeout(() => {
            anime({
                targets: toast,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeInQuart',
                complete: () => {
                    document.body.removeChild(toast);
                }
            });
        }, 3000);
    }
}

// 全局函数
function goBack() {
    window.location.href = `daily-list.html?planId=${window.dailyPlan.planId}`;
}

function addFood() {
    document.getElementById('foodModal').classList.remove('hidden');
    
    anime({
        targets: '#foodModal .bg-white',
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

function closeFoodModal() {
    anime({
        targets: '#foodModal .bg-white',
        translateY: [0, 100],
        opacity: [1, 0],
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            document.getElementById('foodModal').classList.add('hidden');
        }
    });
}

// 设置全局函数供iframe调用
window.parentAddFood = function(food) {
    if (window.dailyPlan) {
        window.dailyPlan.addFoodFromSelector(food);
    }
};

function editFood(index) {
    alert('编辑食物功能开发中...');
}

function removeFood(index) {
    if (confirm('确定要删除这个食物吗？')) {
        const meal = window.dailyPlan.currentMeal;
        window.dailyPlan.day.meals[meal].splice(index, 1);
        window.dailyPlan.savePlan();
        window.dailyPlan.renderCurrentMeal();
        window.dailyPlan.updateNutritionDisplay();
        window.dailyPlan.showToast('已删除食物', 'success');
    }
}

function editTargets() {
    const targets = window.dailyPlan.day.targets;
    
    document.getElementById('editCalories').value = targets.calories;
    document.getElementById('editProtein').value = targets.protein;
    document.getElementById('editFat').value = targets.fat;
    document.getElementById('editCarbs').value = targets.carbs;
    
    document.getElementById('targetsModal').classList.remove('hidden');
    
    anime({
        targets: '#targetsModal .bg-white',
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

function closeTargetsModal() {
    anime({
        targets: '#targetsModal .bg-white',
        opacity: [1, 0],
        scale: [1, 0.8],
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            document.getElementById('targetsModal').classList.add('hidden');
        }
    });
}

function saveTargets() {
    const calories = parseInt(document.getElementById('editCalories').value);
    const protein = parseInt(document.getElementById('editProtein').value);
    const fat = parseInt(document.getElementById('editFat').value);
    const carbs = parseInt(document.getElementById('editCarbs').value);
    
    if (calories <= 0 || protein <= 0 || fat <= 0 || carbs <= 0) {
        window.dailyPlan.showToast('请输入有效的营养目标', 'error');
        return;
    }
    
    window.dailyPlan.day.targets = { calories, protein, fat, carbs };
    window.dailyPlan.savePlan();
    window.dailyPlan.updateNutritionDisplay();
    
    closeTargetsModal();
    window.dailyPlan.showToast('营养目标已更新', 'success');
}

function copyMeal() {
    const mealData = window.dailyPlan.day.meals[window.dailyPlan.currentMeal];
    if (mealData && mealData.length > 0) {
        localStorage.setItem('copiedMeal', JSON.stringify(mealData));
        window.dailyPlan.showToast('餐次已复制', 'success');
    } else {
        window.dailyPlan.showToast('当前餐次没有食物', 'error');
    }
}

function markComplete() {
    if (confirm('确定要将这一天标记为已完成吗？')) {
        window.dailyPlan.day.isCompleted = true;
        window.dailyPlan.savePlan();
        window.dailyPlan.showToast('已标记为完成', 'success');
    }
}

function saveAndExit() {
    window.dailyPlan.savePlan();
    window.dailyPlan.showToast('已保存', 'success');
    setTimeout(() => {
        goBack();
    }, 1000);
}

function saveAndNext() {
    window.dailyPlan.savePlan();
    
    // 找到下一天
    const currentIndex = window.dailyPlan.plan.dailyPlans.findIndex(d => d.id === window.dailyPlan.dayId);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < window.dailyPlan.plan.dailyPlans.length) {
        const nextDay = window.dailyPlan.plan.dailyPlans[nextIndex];
        window.dailyPlan.showToast('已保存，跳转到下一天', 'success');
        setTimeout(() => {
            window.location.href = `daily-plan.html?planId=${window.dailyPlan.planId}&dayId=${nextDay.id}`;
        }, 1000);
    } else {
        window.dailyPlan.showToast('已是最后一天', 'info');
        setTimeout(() => {
            goBack();
        }, 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.dailyPlan = new DailyPlan();
});