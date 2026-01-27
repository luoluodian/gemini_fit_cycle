// 增强版食材选择器
// 支持营养信息展示、多维度筛选和实时盈余计算

class FoodSelector {
    constructor() {
        this.currentMealType = '';
        this.currentFoodItem = null;
        this.dailyTarget = null;
        this.currentNutrition = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0
        };
        this.searchQuery = '';
        this.currentTab = 'recommended';
        this.currentFilter = 'all';
        
        // 增强版食物数据库
        this.enhancedFoodDatabase = this.initializeFoodDatabase();
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.renderFoodSelector();
    }
    
    // 初始化增强版食物数据库
    initializeFoodDatabase() {
        return [
            // 高蛋白类
            {
                id: 'chicken-breast',
                name: '鸡胸肉',
                emoji: '🥩',
                category: 'protein',
                nutrition: {
                    calories: 165,
                    protein: 31,
                    fat: 3.6,
                    carbs: 0,
                    fiber: 0
                },
                unit: '100g',
                tags: ['高蛋白', '低脂', '低碳水'],
                description: '优质蛋白质来源，脂肪含量低'
            },
            {
                id: 'salmon',
                name: '三文鱼',
                emoji: '🐟',
                category: 'protein',
                nutrition: {
                    calories: 208,
                    protein: 25,
                    fat: 12,
                    carbs: 0,
                    fiber: 0
                },
                unit: '100g',
                tags: ['高蛋白', '健康脂肪'],
                description: '富含Omega-3脂肪酸'
            },
            {
                id: 'egg-white',
                name: '鸡蛋清',
                emoji: '🥚',
                category: 'protein',
                nutrition: {
                    calories: 52,
                    protein: 11,
                    fat: 0.2,
                    carbs: 0.7,
                    fiber: 0
                },
                unit: '100g',
                tags: ['高蛋白', '极低脂'],
                description: '纯蛋白质，几乎不含脂肪'
            },
            
            // 优质碳水类
            {
                id: 'oats',
                name: '燕麦',
                emoji: '🌾',
                category: 'grains',
                nutrition: {
                    calories: 389,
                    protein: 17,
                    fat: 7,
                    carbs: 66,
                    fiber: 11
                },
                unit: '100g',
                tags: ['高碳水', '高蛋白', '高纤维'],
                description: '全谷物，富含膳食纤维'
            },
            {
                id: 'brown-rice',
                name: '糙米',
                emoji: '🍚',
                category: 'grains',
                nutrition: {
                    calories: 111,
                    protein: 2.6,
                    fat: 0.9,
                    carbs: 23,
                    fiber: 1.8
                },
                unit: '100g',
                tags: ['高碳水', '中等纤维'],
                description: '全谷物，提供持续能量'
            },
            {
                id: 'quinoa',
                name: '藜麦',
                emoji: '🌾',
                category: 'grains',
                nutrition: {
                    calories: 368,
                    protein: 14,
                    fat: 6,
                    carbs: 64,
                    fiber: 7
                },
                unit: '100g',
                tags: ['完全蛋白', '高碳水', '高纤维'],
                description: '完全蛋白质，营养全面'
            },
            
            // 低热量蔬菜
            {
                id: 'broccoli',
                name: '西兰花',
                emoji: '🥬',
                category: 'vegetables',
                nutrition: {
                    calories: 35,
                    protein: 2.8,
                    fat: 0.4,
                    carbs: 7,
                    fiber: 2.6
                },
                unit: '100g',
                tags: ['低热量', '高纤维', '高蛋白蔬菜'],
                description: '维生素C丰富，膳食纤维高'
            },
            {
                id: 'spinach',
                name: '菠菜',
                emoji: '🥬',
                category: 'vegetables',
                nutrition: {
                    calories: 23,
                    protein: 2.9,
                    fat: 0.4,
                    carbs: 3.6,
                    fiber: 2.2
                },
                unit: '100g',
                tags: ['低热量', '高铁', '高纤维'],
                description: '铁质丰富，叶酸含量高'
            },
            {
                id: 'cucumber',
                name: '黄瓜',
                emoji: '🥒',
                category: 'vegetables',
                nutrition: {
                    calories: 16,
                    protein: 0.7,
                    fat: 0.1,
                    carbs: 4,
                    fiber: 0.5
                },
                unit: '100g',
                tags: ['极低热量', '高水分'],
                description: '水分含量高，热量极低'
            },
            
            // 健康脂肪
            {
                id: 'avocado',
                name: '牛油果',
                emoji: '🥑',
                category: 'fruits',
                nutrition: {
                    calories: 160,
                    protein: 2,
                    fat: 15,
                    carbs: 9,
                    fiber: 7
                },
                unit: '100g',
                tags: ['健康脂肪', '高纤维', '低糖'],
                description: '单不饱和脂肪酸，富含钾'
            },
            {
                id: 'almonds',
                name: '杏仁',
                emoji: '🥜',
                category: 'nuts',
                nutrition: {
                    calories: 579,
                    protein: 21,
                    fat: 50,
                    carbs: 22,
                    fiber: 12
                },
                unit: '100g',
                tags: ['健康脂肪', '高蛋白', '高纤维'],
                description: '维生素E丰富，矿物质全面'
            },
            {
                id: 'olive-oil',
                name: '橄榄油',
                emoji: '🫒',
                category: 'oils',
                nutrition: {
                    calories: 884,
                    protein: 0,
                    fat: 100,
                    carbs: 0,
                    fiber: 0
                },
                unit: '100ml',
                tags: ['健康脂肪', '零碳水'],
                description: '单不饱和脂肪酸，地中海饮食核心'
            },
            
            // 低糖水果
            {
                id: 'berries-mix',
                name: '混合莓果',
                emoji: '🫐',
                category: 'fruits',
                nutrition: {
                    calories: 57,
                    protein: 0.7,
                    fat: 0.3,
                    carbs: 14,
                    fiber: 2.4
                },
                unit: '100g',
                tags: ['低糖', '高纤维', '抗氧化剂'],
                description: '抗氧化剂丰富，糖分较低'
            },
            {
                id: 'apple',
                name: '苹果',
                emoji: '🍎',
                category: 'fruits',
                nutrition: {
                    calories: 52,
                    protein: 0.3,
                    fat: 0.2,
                    carbs: 14,
                    fiber: 2.4
                },
                unit: '100g',
                tags: ['中等糖分', '高纤维'],
                description: '膳食纤维丰富，果胶含量高'
            }
        ];
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 搜索功能
        const searchInput = document.getElementById('foodSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterFoods();
            });
        }
        
        // Tab切换
        document.querySelectorAll('.food-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // 分类筛选
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
            });
        });
        
        // 营养筛选
        document.querySelectorAll('.nutrition-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.filterByNutrition(e.target.dataset.nutrition);
            });
        });
    }
    
    // 渲染食材选择器
    renderFoodSelector() {
        const modal = document.getElementById('foodModal');
        if (!modal) {
            this.createFoodModal();
        }
        this.renderFoodTabs();
        this.renderFoodList();
    }
    
    // 创建食材选择模态框
    createFoodModal() {
        const modalHTML = `
            <div id="foodModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-end justify-center min-h-screen">
                    <div class="bg-white rounded-t-3xl w-full max-w-md p-6 transform transition-transform">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-800">选择食材</h3>
                            <button onclick="foodSelector.closeFoodModal()" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- 搜索栏 -->
                        <div class="mb-4">
                            <input type="text" id="foodSearch" placeholder="搜索食物名称，如'鸡胸肉、燕麦'" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        </div>
                        
                        <!-- Tab切换 -->
                        <div class="flex space-x-2 mb-4 overflow-x-auto">
                            <button class="food-tab px-3 py-2 text-sm font-medium rounded-lg bg-emerald-100 text-emerald-700" data-tab="recommended">推荐</button>
                            <button class="food-tab px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700" data-tab="category">按分类</button>
                            <button class="food-tab px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700" data-tab="nutrition">按营养</button>
                            <button class="food-tab px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700" data-tab="favorites">我的常用</button>
                        </div>
                        
                        <!-- 分类筛选 -->
                        <div id="categoryFilters" class="mb-4 hidden">
                            <div class="flex flex-wrap gap-2">
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="all">全部</button>
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="protein">肉蛋奶</button>
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="grains">主食</button>
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="vegetables">蔬菜</button>
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="fruits">水果</button>
                                <button class="category-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-category="nuts">坚果</button>
                            </div>
                        </div>
                        
                        <!-- 营养筛选 -->
                        <div id="nutritionFilters" class="mb-4 hidden">
                            <div class="flex flex-wrap gap-2">
                                <button class="nutrition-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-nutrition="all">全部</button>
                                <button class="nutrition-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-nutrition="high-protein">高蛋白</button>
                                <button class="nutrition-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-nutrition="low-fat">低脂</button>
                                <button class="nutrition-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-nutrition="high-fiber">高纤维</button>
                                <button class="nutrition-filter px-3 py-1 text-xs bg-gray-100 rounded-full" data-nutrition="low-carb">低碳水</button>
                            </div>
                        </div>
                        
                        <!-- 当前盈余显示 -->
                        <div id="nutritionSummary" class="mb-4 p-3 bg-emerald-50 rounded-lg">
                            <div class="text-sm text-emerald-700">
                                <div class="font-medium mb-1">今日营养目标</div>
                                <div class="grid grid-cols-2 gap-2 text-xs">
                                    <div>热量: <span id="targetCalories">1800</span> kcal</div>
                                    <div>蛋白质: <span id="targetProtein">120</span> g</div>
                                    <div>脂肪: <span id="targetFat">50</span> g</div>
                                    <div>碳水: <span id="targetCarbs">180</span> g</div>
                                </div>
                                <div class="mt-2 pt-2 border-t border-emerald-200">
                                    <div class="font-medium mb-1">当前配置</div>
                                    <div class="grid grid-cols-2 gap-2 text-xs">
                                        <div>热量: <span id="currentCalories">0</span> kcal</div>
                                        <div>蛋白质: <span id="currentProtein">0</span> g</div>
                                        <div>脂肪: <span id="currentFat">0</span> g</div>
                                        <div>碳水: <span id="currentCarbs">0</span> g</div>
                                    </div>
                                </div>
                                <div class="mt-2 pt-2 border-t border-emerald-200">
                                    <div class="font-medium mb-1">剩余可配</div>
                                    <div class="grid grid-cols-2 gap-2 text-xs">
                                        <div>热量: <span id="remainingCalories" class="font-bold">1800</span> kcal</div>
                                        <div>蛋白质: <span id="remainingProtein">120</span> g</div>
                                        <div>脂肪: <span id="remainingFat">50</span> g</div>
                                        <div>碳水: <span id="remainingCarbs">180</span> g</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 食物列表 -->
                        <div class="space-y-2 max-h-60 overflow-y-auto" id="foodList">
                            <!-- 食物列表将在这里动态生成 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    // 渲染Tab
    renderFoodTabs() {
        const tabs = document.querySelectorAll('.food-tab');
        tabs.forEach(tab => {
            if (tab.dataset.tab === this.currentTab) {
                tab.classList.add('bg-emerald-100', 'text-emerald-700');
                tab.classList.remove('bg-gray-100', 'text-gray-700');
            } else {
                tab.classList.remove('bg-emerald-100', 'text-emerald-700');
                tab.classList.add('bg-gray-100', 'text-gray-700');
            }
        });
        
        // 显示/隐藏筛选器
        const categoryFilters = document.getElementById('categoryFilters');
        const nutritionFilters = document.getElementById('nutritionFilters');
        
        categoryFilters.classList.toggle('hidden', this.currentTab !== 'category');
        nutritionFilters.classList.toggle('hidden', this.currentTab !== 'nutrition');
    }
    
    // 切换Tab
    switchTab(tab) {
        this.currentTab = tab;
        this.renderFoodTabs();
        this.filterFoods();
    }
    
    // 按分类筛选
    filterByCategory(category) {
        this.currentFilter = category;
        this.filterFoods();
        
        // 更新筛选按钮样式
        document.querySelectorAll('.category-filter').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('bg-emerald-100', 'text-emerald-700');
                btn.classList.remove('bg-gray-100', 'text-gray-700');
            } else {
                btn.classList.remove('bg-emerald-100', 'text-emerald-700');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });
    }
    
    // 按营养筛选
    filterByNutrition(nutrition) {
        this.currentFilter = nutrition;
        this.filterFoods();
        
        // 更新筛选按钮样式
        document.querySelectorAll('.nutrition-filter').forEach(btn => {
            if (btn.dataset.nutrition === nutrition) {
                btn.classList.add('bg-emerald-100', 'text-emerald-700');
                btn.classList.remove('bg-gray-100', 'text-gray-700');
            } else {
                btn.classList.remove('bg-emerald-100', 'text-emerald-700');
                btn.classList.add('bg-gray-100', 'text-gray-700');
            }
        });
    }
    
    // 筛选食物
    filterFoods() {
        let filteredFoods = this.enhancedFoodDatabase;
        
        // 按Tab筛选
        switch (this.currentTab) {
            case 'recommended':
                // 推荐食物 - 按营养密度排序
                filteredFoods = this.getRecommendedFoods();
                break;
            case 'category':
                // 按分类筛选
                if (this.currentFilter !== 'all') {
                    filteredFoods = filteredFoods.filter(food => food.category === this.currentFilter);
                }
                break;
            case 'nutrition':
                // 按营养标签筛选
                if (this.currentFilter !== 'all') {
                    filteredFoods = filteredFoods.filter(food => food.tags.includes(this.currentFilter));
                }
                break;
            case 'favorites':
                // 常用食物 - 从本地存储获取
                filteredFoods = this.getFavoriteFoods();
                break;
        }
        
        // 按搜索关键词筛选
        if (this.searchQuery) {
            filteredFoods = filteredFoods.filter(food => 
                food.name.toLowerCase().includes(this.searchQuery) ||
                food.description.toLowerCase().includes(this.searchQuery) ||
                food.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        this.renderFoodList(filteredFoods);
    }
    
    // 获取推荐食物
    getRecommendedFoods() {
        // 根据当前营养盈余推荐食物
        const remaining = this.getRemainingNutrition();
        
        return this.enhancedFoodDatabase.filter(food => {
            // 如果蛋白质不足，推荐高蛋白食物
            if (remaining.protein < 20 && food.tags.includes('高蛋白')) {
                return true;
            }
            // 如果碳水不足，推荐高碳水食物
            if (remaining.carbs < 30 && food.tags.includes('高碳水')) {
                return true;
            }
            // 如果热量不足，推荐高热量食物
            if (remaining.calories < 300 && food.nutrition.calories > 200) {
                return true;
            }
            // 默认推荐营养均衡的食物
            return food.tags.includes('高蛋白') || food.tags.includes('高纤维');
        }).slice(0, 10);
    }
    
    // 获取常用食物
    getFavoriteFoods() {
        // 从本地存储获取常用食物
        const favorites = JSON.parse(localStorage.getItem('favoriteFoods') || '[]');
        return this.enhancedFoodDatabase.filter(food => favorites.includes(food.id));
    }
    
    // 渲染食物列表
    renderFoodList(foods) {
        const container = document.getElementById('foodList');
        
        if (foods.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <p>没有找到匹配的食材</p>
                    <p class="text-sm mt-1">试试调整筛选条件</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = foods.map(food => this.createFoodItemHTML(food)).join('');
        
        // 添加动画
        anime({
            targets: '#foodList > div',
            translateY: [20, 0],
            opacity: [0, 1],
            delay: anime.stagger(50),
            duration: 400,
            easing: 'easeOutQuart'
        });
    }
    
    // 创建食物项HTML
    createFoodItemHTML(food) {
        const nutrition = food.nutrition;
        const tagsHTML = food.tags.slice(0, 2).map(tag => 
            `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">${tag}</span>`
        ).join('');
        
        return `
            <div class="food-item p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onclick="foodSelector.selectFood('${food.id}')">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="text-2xl mr-3">${food.emoji}</span>
                            <div>
                                <h4 class="font-semibold text-gray-800">${food.name}</h4>
                                <p class="text-sm text-gray-600">${food.unit} · ${nutrition.calories} kcal</p>
                            </div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="text-xs text-gray-600 grid grid-cols-3 gap-2">
                                <div>蛋白: ${nutrition.protein}g</div>
                                <div>脂肪: ${nutrition.fat}g</div>
                                <div>碳水: ${nutrition.carbs}g</div>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap gap-1 mb-2">
                            ${tagsHTML}
                        </div>
                        
                        <p class="text-xs text-gray-500">${food.description}</p>
                    </div>
                    
                    <div class="text-right">
                        <div class="text-lg font-semibold text-gray-800">${nutrition.calories}</div>
                        <div class="text-xs text-gray-500">kcal</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 选择食物
    selectFood(foodId) {
        const food = this.enhancedFoodDatabase.find(f => f.id === foodId);
        if (!food) return;
        
        this.currentFoodItem = food;
        this.showQuantityModal(food);
    }
    
    // 显示数量输入模态框
    showQuantityModal(food) {
        const modal = document.getElementById('quantityModal');
        if (!modal) {
            this.createQuantityModal();
        }
        
        document.getElementById('foodName').textContent = food.name;
        document.getElementById('foodUnit').textContent = `每${food.unit}`;
        document.getElementById('foodQuantity').value = 100;
        
        // 更新营养预览
        this.updateNutritionPreview(food, 100);
        
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
    
    // 创建数量输入模态框
    createQuantityModal() {
        const modalHTML = `
            <div id="quantityModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
                <div class="flex items-center justify-center min-h-screen p-4">
                    <div class="bg-white rounded-2xl w-full max-w-sm p-6">
                        <div class="text-center mb-4">
                            <h3 class="text-lg font-semibold text-gray-800" id="foodName">食物名称</h3>
                            <p class="text-sm text-gray-500" id="foodUnit">每100g</p>
                        </div>
                        
                        <!-- 营养信息 -->
                        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                            <div class="text-sm text-gray-700">
                                <div class="font-medium mb-2">每100g营养</div>
                                <div class="grid grid-cols-3 gap-2 text-xs">
                                    <div>蛋白: <span id="previewProtein">0</span>g</div>
                                    <div>脂肪: <span id="previewFat">0</span>g</div>
                                    <div>碳水: <span id="previewCarbs">0</span>g</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 数量输入 -->
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">数量</label>
                            <div class="flex items-center space-x-2">
                                <input type="number" id="foodQuantity" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="请输入数量" value="100" min="1" max="1000">
                                <select id="foodUnitSelect" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                                    <option value="g">克 (g)</option>
                                    <option value="ml">毫升 (ml)</option>
                                    <option value="piece">个/片</option>
                                    <option value="cup">杯</option>
                                    <option value="tbsp">勺</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 实时营养预览 -->
                        <div class="mb-6 p-3 bg-emerald-50 rounded-lg">
                            <div class="text-sm text-emerald-700">
                                <div class="font-medium mb-2">本次摄入</div>
                                <div class="grid grid-cols-2 gap-2 text-xs">
                                    <div>热量: <span id="totalCalories" class="font-bold">0</span> kcal</div>
                                    <div>蛋白质: <span id="totalProtein">0</span> g</div>
                                    <div>脂肪: <span id="totalFat">0</span> g</div>
                                    <div>碳水化合物: <span id="totalCarbs">0</span> g</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 快捷数量按钮 -->
                        <div class="mb-4">
                            <div class="text-sm text-gray-600 mb-2">常用份量</div>
                            <div class="flex space-x-2">
                                <button onclick="foodSelector.setQuickQuantity(50)" class="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">半份</button>
                                <button onclick="foodSelector.setQuickQuantity(100)" class="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">1份</button>
                                <button onclick="foodSelector.setQuickQuantity(150)" class="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">1.5份</button>
                                <button onclick="foodSelector.setQuickQuantity(200)" class="px-3 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">2份</button>
                            </div>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button onclick="foodSelector.closeQuantityModal()" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                取消
                            </button>
                            <button onclick="foodSelector.confirmAddFood()" class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                                确认添加
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 绑定数量变化事件
        document.getElementById('foodQuantity').addEventListener('input', (e) => {
            this.updateNutritionPreview(this.currentFoodItem, e.target.value);
        });
    }
    
    // 设置快捷数量
    setQuickQuantity(quantity) {
        document.getElementById('foodQuantity').value = quantity;
        this.updateNutritionPreview(this.currentFoodItem, quantity);
    }
    
    // 更新营养预览
    updateNutritionPreview(food, quantity) {
        const ratio = quantity / 100;
        const nutrition = food.nutrition;
        
        // 更新每100g营养预览
        document.getElementById('previewProtein').textContent = nutrition.protein;
        document.getElementById('previewFat').textContent = nutrition.fat;
        document.getElementById('previewCarbs').textContent = nutrition.carbs;
        
        // 更新本次摄入总量
        document.getElementById('totalCalories').textContent = Math.round(nutrition.calories * ratio);
        document.getElementById('totalProtein').textContent = Math.round(nutrition.protein * ratio * 10) / 10;
        document.getElementById('totalFat').textContent = Math.round(nutrition.fat * ratio * 10) / 10;
        document.getElementById('totalCarbs').textContent = Math.round(nutrition.carbs * ratio * 10) / 10;
    }
    
    // 确认添加食物
    confirmAddFood() {
        const quantity = parseFloat(document.getElementById('foodQuantity').value);
        const unit = document.getElementById('foodUnitSelect').value;
        
        if (!quantity || quantity <= 0) {
            this.showMessage('请输入有效的数量', 'error');
            return;
        }
        
        if (!this.currentFoodItem || !this.currentMealType) {
            this.showMessage('数据错误，请重试', 'error');
            return;
        }
        
        // 计算实际营养值
        const ratio = quantity / 100;
        const nutrition = this.currentFoodItem.nutrition;
        
        const foodItem = {
            id: 'food_' + Date.now(),
            name: this.currentFoodItem.name,
            quantity: quantity,
            unit: unit,
            calories: Math.round(nutrition.calories * ratio),
            protein: Math.round(nutrition.protein * ratio * 10) / 10,
            fat: Math.round(nutrition.fat * ratio * 10) / 10,
            carbs: Math.round(nutrition.carbs * ratio * 10) / 10
        };
        
        // 添加到当前餐次
        this.addFoodToMeal(foodItem);
        
        // 更新当前营养统计
        this.updateCurrentNutrition(foodItem);
        
        // 关闭模态框
        this.closeQuantityModal();
        this.closeFoodModal();
        
        this.showMessage('食物添加成功！', 'success');
    }
    
    // 添加食物到餐次
    addFoodToMeal(foodItem) {
        // 这里应该调用外部回调函数来处理实际的添加逻辑
        if (window.onFoodSelected) {
            window.onFoodSelected(foodItem, this.currentMealType);
        }
    }
    
    // 更新当前营养统计
    updateCurrentNutrition(foodItem) {
        this.currentNutrition.calories += foodItem.calories;
        this.currentNutrition.protein += foodItem.protein;
        this.currentNutrition.fat += foodItem.fat;
        this.currentNutrition.carbs += foodItem.carbs;
        
        this.updateNutritionSummary();
    }
    
    // 更新营养摘要
    updateNutritionSummary() {
        document.getElementById('currentCalories').textContent = this.currentNutrition.calories;
        document.getElementById('currentProtein').textContent = Math.round(this.currentNutrition.protein * 10) / 10;
        document.getElementById('currentFat').textContent = Math.round(this.currentNutrition.fat * 10) / 10;
        document.getElementById('currentCarbs').textContent = Math.round(this.currentNutrition.carbs * 10) / 10;
        
        const remaining = this.getRemainingNutrition();
        document.getElementById('remainingCalories').textContent = remaining.calories;
        document.getElementById('remainingProtein').textContent = Math.round(remaining.protein * 10) / 10;
        document.getElementById('remainingFat').textContent = Math.round(remaining.fat * 10) / 10;
        document.getElementById('remainingCarbs').textContent = Math.round(remaining.carbs * 10) / 10;
        
        // 更新颜色提示
        this.updateRemainingColors(remaining);
    }
    
    // 获取剩余营养
    getRemainingNutrition() {
        if (!this.dailyTarget) {
            return {
                calories: 1800 - this.currentNutrition.calories,
                protein: 120 - this.currentNutrition.protein,
                fat: 50 - this.currentNutrition.fat,
                carbs: 180 - this.currentNutrition.carbs
            };
        }
        
        return {
            calories: this.dailyTarget.calories - this.currentNutrition.calories,
            protein: this.dailyTarget.protein - this.currentNutrition.protein,
            fat: this.dailyTarget.fat - this.currentNutrition.fat,
            carbs: this.dailyTarget.carbs - this.currentNutrition.carbs
        };
    }
    
    // 更新剩余营养颜色提示
    updateRemainingColors(remaining) {
        const elements = ['remainingCalories', 'remainingProtein', 'remainingFat', 'remainingCarbs'];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            const value = parseFloat(element.textContent);
            
            if (value < 0) {
                element.className = 'font-bold text-red-600';
            } else if (value < 50) {
                element.className = 'font-bold text-orange-600';
            } else {
                element.className = 'font-bold text-emerald-600';
            }
        });
    }
    
    // 设置每日目标
    setDailyTarget(target) {
        this.dailyTarget = target;
        
        document.getElementById('targetCalories').textContent = target.calories;
        document.getElementById('targetProtein').textContent = target.protein;
        document.getElementById('targetFat').textContent = target.fat;
        document.getElementById('targetCarbs').textContent = target.carbs;
        
        this.updateNutritionSummary();
    }
    
    // 关闭食物模态框
    closeFoodModal() {
        const modal = document.getElementById('foodModal');
        if (modal) {
            anime({
                targets: modal.querySelector('.bg-white'),
                translateY: [0, 100],
                opacity: [1, 0],
                duration: 200,
                easing: 'easeInQuart',
                complete: () => {
                    modal.classList.add('hidden');
                }
            });
        }
    }
    
    // 关闭数量模态框
    closeQuantityModal() {
        const modal = document.getElementById('quantityModal');
        if (modal) {
            anime({
                targets: modal.querySelector('.bg-white'),
                scale: [1, 0.8],
                opacity: [1, 0],
                duration: 200,
                easing: 'easeInQuart',
                complete: () => {
                    modal.classList.add('hidden');
                }
            });
        }
    }
    
    // 显示消息
    showMessage(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`;
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
}

// 全局实例
const foodSelector = new FoodSelector();