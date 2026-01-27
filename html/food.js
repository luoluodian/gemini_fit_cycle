// 全局变量
let currentCategory = 'all';
let currentFoodDetail = null;
let searchQuery = '';

// 食物数据库
const foodDatabase = {
    protein: [
        {
            id: 'chicken-breast',
            name: '鸡胸肉',
            emoji: '🥩',
            calories: 165,
            protein: 31,
            fat: 3.6,
            carbs: 0,
            unit: '100g',
            description: '高蛋白，低脂肪的优质蛋白质来源',
            category: 'protein',
            type: 'system'
        },
        {
            id: 'salmon',
            name: '三文鱼',
            emoji: '🐟',
            calories: 208,
            protein: 25,
            fat: 12,
            carbs: 0,
            unit: '100g',
            description: '富含Omega-3脂肪酸的优质鱼类',
            category: 'protein',
            type: 'system'
        },
        {
            id: 'tuna',
            name: '金枪鱼',
            emoji: '🐟',
            calories: 184,
            protein: 30,
            fat: 6,
            carbs: 0,
            unit: '100g',
            description: '高蛋白，低脂肪的海鱼',
            category: 'protein',
            type: 'system'
        }
    ],
    vegetables: [
        {
            id: 'broccoli',
            name: '西兰花',
            emoji: '🥬',
            calories: 35,
            protein: 2.8,
            fat: 0.4,
            carbs: 7,
            unit: '100g',
            description: '维生素C和纤维素丰富的绿色蔬菜',
            category: 'vegetables',
            type: 'system'
        },
        {
            id: 'carrot',
            name: '胡萝卜',
            emoji: '🥕',
            calories: 41,
            protein: 0.9,
            fat: 0.2,
            carbs: 10,
            unit: '100g',
            description: '富含β-胡萝卜素的健康蔬菜',
            category: 'vegetables',
            type: 'system'
        },
        {
            id: 'spinach',
            name: '菠菜',
            emoji: '🥬',
            calories: 23,
            protein: 2.9,
            fat: 0.4,
            carbs: 3.6,
            unit: '100g',
            description: '铁质丰富的绿叶蔬菜',
            category: 'vegetables',
            type: 'system'
        }
    ],
    fruits: [
        {
            id: 'apple',
            name: '苹果',
            emoji: '🍎',
            calories: 52,
            protein: 0.3,
            fat: 0.2,
            carbs: 14,
            unit: '100g',
            description: '膳食纤维丰富的健康水果',
            category: 'fruits',
            type: 'system'
        },
        {
            id: 'banana',
            name: '香蕉',
            emoji: '🍌',
            calories: 89,
            protein: 1.1,
            fat: 0.3,
            carbs: 23,
            unit: '100g',
            description: '钾元素丰富的能量水果',
            category: 'fruits',
            type: 'system'
        },
        {
            id: 'blueberry',
            name: '蓝莓',
            emoji: '🫐',
            calories: 57,
            protein: 0.7,
            fat: 0.3,
            carbs: 14,
            unit: '100g',
            description: '抗氧化剂丰富的小浆果',
            category: 'fruits',
            type: 'system'
        }
    ],
    grains: [
        {
            id: 'brown-rice',
            name: '糙米饭',
            emoji: '🍚',
            calories: 111,
            protein: 2.6,
            fat: 0.9,
            carbs: 23,
            unit: '100g',
            description: '全谷物，富含膳食纤维',
            category: 'grains',
            type: 'system'
        },
        {
            id: 'oats',
            name: '燕麦',
            emoji: '🌾',
            calories: 389,
            protein: 17,
            fat: 7,
            carbs: 66,
            unit: '100g',
            description: '营养丰富的全谷物',
            category: 'grains',
            type: 'system'
        },
        {
            id: 'quinoa',
            name: '藜麦',
            emoji: '🌾',
            calories: 368,
            protein: 14,
            fat: 6,
            carbs: 64,
            unit: '100g',
            description: '完全蛋白质的超级谷物',
            category: 'grains',
            type: 'system'
        }
    ],
    dairy: [
        {
            id: 'milk',
            name: '牛奶',
            emoji: '🥛',
            calories: 42,
            protein: 3.4,
            fat: 1,
            carbs: 5,
            unit: '100ml',
            description: '钙质丰富的乳制品',
            category: 'dairy',
            type: 'system'
        },
        {
            id: 'yogurt',
            name: '酸奶',
            emoji: '🥛',
            calories: 59,
            protein: 10,
            fat: 0.4,
            carbs: 3.6,
            unit: '100g',
            description: '益生菌丰富的发酵乳制品',
            category: 'dairy',
            type: 'system'
        },
        {
            id: 'cheese',
            name: '奶酪',
            emoji: '🧀',
            calories: 113,
            protein: 7,
            fat: 9,
            carbs: 1,
            unit: '28g',
            description: '浓缩的乳制品蛋白质',
            category: 'dairy',
            type: 'system'
        }
    ],
    nuts: [
        {
            id: 'almonds',
            name: '杏仁',
            emoji: '🥜',
            calories: 579,
            protein: 21,
            fat: 50,
            carbs: 22,
            unit: '100g',
            description: '维生素E丰富的不饱和脂肪',
            category: 'nuts',
            type: 'system'
        },
        {
            id: 'walnuts',
            name: '核桃',
            emoji: '🥜',
            calories: 654,
            protein: 15,
            fat: 65,
            carbs: 14,
            unit: '100g',
            description: 'Omega-3脂肪酸丰富的坚果',
            category: 'nuts',
            type: 'system'
        },
        {
            id: 'cashews',
            name: '腰果',
            emoji: '🥜',
            calories: 553,
            protein: 18,
            fat: 44,
            carbs: 30,
            unit: '100g',
            description: '矿物质丰富的坚果',
            category: 'nuts',
            type: 'system'
        }
    ],
    oils: [
        {
            id: 'olive-oil',
            name: '橄榄油',
            emoji: '🫒',
            calories: 884,
            protein: 0,
            fat: 100,
            carbs: 0,
            unit: '100ml',
            description: '单不饱和脂肪酸的健康油脂',
            category: 'oils',
            type: 'system'
        },
        {
            id: 'coconut-oil',
            name: '椰子油',
            emoji: '🥥',
            calories: 862,
            protein: 0,
            fat: 100,
            carbs: 0,
            unit: '100ml',
            description: '中链脂肪酸的特殊油脂',
            category: 'oils',
            type: 'system'
        }
    ]
};

// 自定义食物存储
let customFoods = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadFoodData();
});

// 初始化页面
function initializePage() {
    // 初始化动画
    anime({
        targets: '.glass-card, .food-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('foodSearch');
    searchInput.addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase();
        filterFoods();
    });
    
    // 自定义食物表单
    document.getElementById('customFoodForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createCustomFoodItem();
    });
    
    // 模态框关闭
    document.getElementById('foodDetailModal').addEventListener('click', function(e) {
        if (e.target === this) closeFoodDetailModal();
    });
    document.getElementById('customFoodModal').addEventListener('click', function(e) {
        if (e.target === this) closeCustomFoodModal();
    });
}

// 加载食物数据
function loadFoodData() {
    // 从本地存储加载自定义食物
    const savedCustomFoods = localStorage.getItem('customFoods');
    if (savedCustomFoods) {
        customFoods = JSON.parse(savedCustomFoods);
    }
    
    updateFoodCount();
}

// 切换搜索栏显示
function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('foodSearch');
    
    if (searchBar.classList.contains('hidden')) {
        searchBar.classList.remove('hidden');
        searchInput.focus();
        
        // 添加显示动画
        anime({
            targets: searchBar,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    } else {
        anime({
            targets: searchBar,
            translateY: [0, -20],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                searchBar.classList.add('hidden');
                searchInput.value = '';
                searchQuery = '';
                filterFoods();
            }
        });
    }
}

// 切换分类
function switchCategory(category) {
    currentCategory = category;
    
    // 更新标签样式
    const tabs = ['all', 'system', 'custom'];
    tabs.forEach(tab => {
        const tabElement = document.getElementById(tab + 'Tab');
        if (tab === category) {
            tabElement.className = 'category-tab active px-4 py-2 rounded-lg text-sm font-medium';
        } else {
            tabElement.className = 'category-tab px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium';
        }
    });
    
    filterFoods();
}

// 按分类筛选
function filterByCategory(category) {
    // 清除所有分类按钮的激活状态
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('bg-gray-100', 'text-gray-600');
        tab.classList.remove('bg-emerald-600', 'text-white');
    });
    
    // 激活选中的分类按钮
    event.target.classList.add('active');
    event.target.classList.remove('bg-gray-100', 'text-gray-600');
    event.target.classList.add('bg-emerald-600', 'text-white');
    
    // 筛选食物
    filterFoodsByCategory(category);
}

// 筛选食物
function filterFoods() {
    const allFoods = getAllFoods();
    let filteredFoods = allFoods;
    
    // 按分类筛选
    if (currentCategory !== 'all') {
        filteredFoods = filteredFoods.filter(food => {
            if (currentCategory === 'system') return food.type === 'system';
            if (currentCategory === 'custom') return food.type === 'custom';
            return true;
        });
    }
    
    // 按搜索关键词筛选
    if (searchQuery) {
        filteredFoods = filteredFoods.filter(food => 
            food.name.toLowerCase().includes(searchQuery) ||
            food.description.toLowerCase().includes(searchQuery)
        );
    }
    
    updateFoodList(filteredFoods);
    updateFoodCount(filteredFoods.length);
}

// 按分类筛选食物
function filterFoodsByCategory(category) {
    const allFoods = getAllFoods();
    let filteredFoods = allFoods.filter(food => food.category === category);
    
    // 同时考虑搜索关键词
    if (searchQuery) {
        filteredFoods = filteredFoods.filter(food => 
            food.name.toLowerCase().includes(searchQuery) ||
            food.description.toLowerCase().includes(searchQuery)
        );
    }
    
    updateFoodList(filteredFoods);
    updateFoodCount(filteredFoods.length);
}

// 获取所有食物
function getAllFoods() {
    const allFoods = [];
    
    // 添加系统食物
    Object.values(foodDatabase).forEach(categoryFoods => {
        allFoods.push(...categoryFoods);
    });
    
    // 添加自定义食物
    allFoods.push(...customFoods);
    
    return allFoods;
}

// 更新食物列表显示
function updateFoodList(foods) {
    const foodListElement = document.getElementById('foodList');
    
    if (foods.length === 0) {
        foodListElement.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <p>没有找到匹配的食材</p>
                <p class="text-sm mt-1">试试创建自定义食材</p>
            </div>
        `;
        return;
    }
    
    foodListElement.innerHTML = foods.map(food => createFoodCard(food)).join('');
    
    // 添加动画
    anime({
        targets: '.food-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(50),
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// 创建食物卡片HTML
function createFoodCard(food) {
    const typeBadge = food.type === 'system' 
        ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">系统</span>'
        : '<span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">我的</span>';
    
    const favoriteButton = food.isFavorite 
        ? '<button onclick="toggleFavorite(\'' + food.id + '\')" class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">❤️</button>'
        : '<button onclick="toggleFavorite(\'' + food.id + '\')" class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">🤍</button>';
    
    const actionButtons = food.type === 'system'
        ? `<button onclick="viewFoodDetail('${food.id}')" class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">详情</button>
           ${favoriteButton}`
        : `<button onclick="editCustomFood('${food.id}')" class="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">编辑</button>
           <button onclick="deleteCustomFood('${food.id}')" class="bg-red-100 text-red-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">删除</button>`;
    
    return `
        <div class="food-card bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span class="text-xl">${food.emoji}</span>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-800">${food.name}</h4>
                        <p class="text-sm text-gray-600">${food.description}</p>
                        <div class="flex items-center text-xs text-gray-500 mt-1">
                            <span>蛋白质: ${food.protein}g</span>
                            <span class="mx-1">·</span>
                            <span>脂肪: ${food.fat}g</span>
                            <span class="mx-1">·</span>
                            <span>碳水: ${food.carbs}g</span>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-semibold text-gray-800">${food.calories} kcal</div>
                    <div class="text-xs text-gray-500">每${food.unit}</div>
                    <div class="flex items-center mt-1">
                        ${typeBadge}
                    </div>
                </div>
            </div>
            <div class="flex space-x-2 mt-3">
                <button onclick="addToMeal('${food.name}')" class="flex-1 bg-emerald-100 text-emerald-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors">
                    添加到餐食
                </button>
                ${actionButtons}
            </div>
        </div>
    `;
}

// 更新食物计数
function updateFoodCount(count = null) {
    const totalCount = count !== null ? count : getAllFoods().length;
    document.getElementById('foodCount').textContent = `显示 ${totalCount} 种食材`;
}

// 添加到餐食
function addToMeal(foodName) {
    showSuccessMessage(`"${foodName}" 已添加到餐食选择`);
    
    // 这里应该跳转到记录页面或打开添加食物模态框
    setTimeout(() => {
        if (confirm('是否跳转到记录页面添加此食物？')) {
            window.location.href = 'index.html';
        }
    }, 1500);
}

// 查看食物详情
function viewFoodDetail(foodId) {
    const food = getAllFoods().find(f => f.id === foodId);
    if (!food) return;
    
    currentFoodDetail = food;
    
    // 填充详情内容
    document.getElementById('detailFoodName').textContent = food.name;
    
    const detailContent = document.getElementById('foodDetailContent');
    detailContent.innerHTML = `
        <div class="text-center mb-4">
            <div class="text-4xl mb-2">${food.emoji}</div>
            <h4 class="text-lg font-semibold text-gray-800">${food.name}</h4>
            <p class="text-sm text-gray-600">${food.description}</p>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 class="font-medium text-gray-800 mb-2">营养成分 (每${food.unit})</h5>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                    <span class="text-gray-600">热量</span>
                    <span class="font-medium">${food.calories} kcal</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">蛋白质</span>
                    <span class="font-medium">${food.protein}g</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">脂肪</span>
                    <span class="font-medium">${food.fat}g</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">碳水化合物</span>
                    <span class="font-medium">${food.carbs}g</span>
                </div>
            </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-800 mb-2">健康建议</h5>
            <p class="text-sm text-gray-600">${getHealthAdvice(food)}</p>
        </div>
    `;
    
    // 显示模态框
    document.getElementById('foodDetailModal').classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: '#foodDetailModal .bg-white',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭食物详情模态框
function closeFoodDetailModal() {
    const modal = document.getElementById('foodDetailModal');
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
            currentFoodDetail = null;
        }
    });
}

// 从详情页添加到餐食
function addToMealFromDetail() {
    if (currentFoodDetail) {
        addToMeal(currentFoodDetail.name);
        closeFoodDetailModal();
    }
}

// 切换收藏状态
function toggleFavorite(foodId) {
    const food = getAllFoods().find(f => f.id === foodId);
    if (!food) return;
    
    food.isFavorite = !food.isFavorite;
    
    // 保存到本地存储
    if (food.type === 'custom') {
        const index = customFoods.findIndex(f => f.id === foodId);
        if (index !== -1) {
            customFoods[index] = food;
            localStorage.setItem('customFoods', JSON.stringify(customFoods));
        }
    }
    
    showSuccessMessage(food.isFavorite ? '已添加到收藏' : '已从收藏中移除');
    filterFoods();
}

// 创建自定义食物
function createCustomFood() {
    document.getElementById('customFoodModal').classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: '#customFoodModal .bg-white',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭自定义食物模态框
function closeCustomFoodModal() {
    const modal = document.getElementById('customFoodModal');
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
            document.getElementById('customFoodForm').reset();
        }
    });
}

// 创建自定义食物项
function createCustomFoodItem() {
    const formData = {
        name: document.getElementById('customFoodName').value,
        unit: document.getElementById('customFoodUnit').value,
        calories: parseFloat(document.getElementById('customFoodCalories').value),
        protein: parseFloat(document.getElementById('customFoodProtein').value) || 0,
        fat: parseFloat(document.getElementById('customFoodFat').value) || 0,
        carbs: parseFloat(document.getElementById('customFoodCarbs').value) || 0,
        description: document.getElementById('customFoodDescription').value || '自定义食材'
    };
    
    // 验证必填字段
    if (!formData.name || !formData.calories) {
        alert('请填写食材名称和热量');
        return;
    }
    
    // 创建自定义食物对象
    const customFood = {
        id: 'custom_' + Date.now(),
        ...formData,
        emoji: '🥗',
        category: 'custom',
        type: 'custom',
        isFavorite: false,
        createdAt: new Date().toISOString()
    };
    
    // 添加到自定义食物列表
    customFoods.push(customFood);
    
    // 保存到本地存储
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
    
    // 关闭模态框
    closeCustomFoodModal();
    
    // 显示成功消息
    showSuccessMessage('自定义食材创建成功！');
    
    // 刷新食物列表
    filterFoods();
}

// 编辑自定义食物
function editCustomFood(foodId) {
    const food = customFoods.find(f => f.id === foodId);
    if (!food) return;
    
    // 填充表单
    document.getElementById('customFoodName').value = food.name;
    document.getElementById('customFoodUnit').value = food.unit;
    document.getElementById('customFoodCalories').value = food.calories;
    document.getElementById('customFoodProtein').value = food.protein;
    document.getElementById('customFoodFat').value = food.fat;
    document.getElementById('customFoodCarbs').value = food.carbs;
    document.getElementById('customFoodDescription').value = food.description;
    
    // 修改表单提交行为
    const form = document.getElementById('customFoodForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        updateCustomFood(foodId);
    };
    
    // 显示模态框
    createCustomFood();
}

// 更新自定义食物
function updateCustomFood(foodId) {
    const index = customFoods.findIndex(f => f.id === foodId);
    if (index === -1) return;
    
    // 更新食物信息
    customFoods[index] = {
        ...customFoods[index],
        name: document.getElementById('customFoodName').value,
        unit: document.getElementById('customFoodUnit').value,
        calories: parseFloat(document.getElementById('customFoodCalories').value),
        protein: parseFloat(document.getElementById('customFoodProtein').value) || 0,
        fat: parseFloat(document.getElementById('customFoodFat').value) || 0,
        carbs: parseFloat(document.getElementById('customFoodCarbs').value) || 0,
        description: document.getElementById('customFoodDescription').value || '自定义食材'
    };
    
    // 保存到本地存储
    localStorage.setItem('customFoods', JSON.stringify(customFoods));
    
    // 关闭模态框
    closeCustomFoodModal();
    
    // 显示成功消息
    showSuccessMessage('自定义食材更新成功！');
    
    // 刷新食物列表
    filterFoods();
}

// 删除自定义食物
function deleteCustomFood(foodId) {
    if (confirm('确定要删除这个自定义食材吗？')) {
        const index = customFoods.findIndex(f => f.id === foodId);
        if (index !== -1) {
            customFoods.splice(index, 1);
            localStorage.setItem('customFoods', JSON.stringify(customFoods));
            showSuccessMessage('自定义食材已删除');
            filterFoods();
        }
    }
}

// 获取健康建议
function getHealthAdvice(food) {
    const adviceMap = {
        'chicken-breast': '鸡胸肉是优质蛋白质来源，适合增肌减脂期间食用。',
        'salmon': '三文鱼富含Omega-3脂肪酸，有益心血管健康。',
        'broccoli': '西兰花维生素C含量丰富，有助于增强免疫力。',
        'apple': '苹果膳食纤维丰富，有助于消化和血糖控制。',
        'banana': '香蕉钾含量高，适合运动后补充电解质。',
        'brown-rice': '糙米是全谷物，提供持续的能量和饱腹感。'
    };
    
    return adviceMap[food.id] || '这种食物营养丰富，建议适量食用，搭配其他食物获得均衡营养。';
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