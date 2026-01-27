// 嵌入式增强版食材选择器
class EmbeddedFoodSelector {
    constructor() {
        this.foodDatabase = this.initializeFoodDatabase();
        this.filteredFoods = [...this.foodDatabase];
        this.selectedFoods = [];
        this.currentQuantity = 100;
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.selectedTags = [];
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
    }
    
    initializeFoodDatabase() {
        return [
            // 主食类
            { id: 1, name: '糙米饭', category: 'grains', unit: 'g', calories: 111, protein: 2.6, fat: 0.9, carbs: 22.9, tags: ['低GI', '高纤维'], description: '富含膳食纤维的粗粮' },
            { id: 2, name: '燕麦片', category: 'grains', unit: 'g', calories: 68, protein: 2.4, fat: 1.4, carbs: 12.0, tags: ['低GI', '高纤维', '高蛋白'], description: '营养丰富的全谷物' },
            { id: 3, name: '全麦面包', category: 'grains', unit: 'g', calories: 247, protein: 13, fat: 4, carbs: 41, tags: ['高纤维', '全谷物'], description: '全麦制作的面包' },
            { id: 4, name: '红薯', category: 'grains', unit: 'g', calories: 99, protein: 1.4, fat: 0.2, carbs: 23.1, tags: ['低GI', '高纤维', '维生素A'], description: '富含β-胡萝卜素' },
            { id: 5, name: '紫薯', category: 'grains', unit: 'g', calories: 85, protein: 1.3, fat: 0.2, carbs: 20.1, tags: ['低GI', '高纤维', '花青素'], description: '含有花青素' },
            
            // 蛋白质类
            { id: 6, name: '鸡胸肉', category: 'protein', unit: 'g', calories: 165, protein: 31, fat: 3.6, carbs: 0, tags: ['高蛋白', '低脂肪'], description: '优质蛋白质来源' },
            { id: 7, name: '三文鱼', category: 'protein', unit: 'g', calories: 208, protein: 20, fat: 13, carbs: 0, tags: ['高蛋白', 'Omega-3'], description: '富含Omega-3脂肪酸' },
            { id: 8, name: '鸡蛋', category: 'protein', unit: '个', calories: 70, protein: 6, fat: 5, carbs: 1, tags: ['高蛋白', '全营养'], description: '营养全面的食物' },
            { id: 9, name: '牛肉', category: 'protein', unit: 'g', calories: 250, protein: 26, fat: 15, carbs: 0, tags: ['高蛋白', '高铁'], description: '富含铁和蛋白质' },
            { id: 10, name: '豆腐', category: 'protein', unit: 'g', calories: 76, protein: 8, fat: 4.8, carbs: 1.9, tags: ['植物蛋白', '低脂肪'], description: '植物蛋白质' },
            
            // 蔬菜类
            { id: 11, name: '西兰花', category: 'vegetables', unit: 'g', calories: 34, protein: 2.8, fat: 0.4, carbs: 7, tags: ['高纤维', '维生素C', '抗癌'], description: '营养丰富的十字花科蔬菜' },
            { id: 12, name: '胡萝卜', category: 'vegetables', unit: 'g', calories: 41, protein: 0.9, fat: 0.2, carbs: 9.6, tags: ['维生素A', 'β-胡萝卜素'], description: '富含胡萝卜素' },
            { id: 13, name: '菠菜', category: 'vegetables', unit: 'g', calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, tags: ['高铁', '叶酸', '维生素K'], description: '绿叶蔬菜' },
            { id: 14, name: '番茄', category: 'vegetables', unit: 'g', calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, tags: ['番茄红素', '维生素C'], description: '富含番茄红素' },
            { id: 15, name: '黄瓜', category: 'vegetables', unit: 'g', calories: 16, protein: 0.7, fat: 0.1, carbs: 2.2, tags: ['低热量', '高水分'], description: '清爽低热量' },
            
            // 水果类
            { id: 16, name: '苹果', category: 'fruits', unit: 'g', calories: 52, protein: 0.3, fat: 0.2, carbs: 13.8, tags: ['膳食纤维', '果胶'], description: '富含膳食纤维' },
            { id: 17, name: '香蕉', category: 'fruits', unit: '根', calories: 90, protein: 1.1, fat: 0.3, carbs: 23, tags: ['钾', '快速能量'], description: '快速补充能量' },
            { id: 18, name: '蓝莓', category: 'fruits', unit: 'g', calories: 57, protein: 0.7, fat: 0.3, carbs: 14.5, tags: ['花青素', '抗氧化'], description: '超级抗氧化水果' },
            { id: 19, name: '橙子', category: 'fruits', unit: 'g', calories: 47, protein: 0.9, fat: 0.1, carbs: 11.8, tags: ['维生素C', '叶酸'], description: '富含维生素C' },
            { id: 20, name: '牛油果', category: 'fruits', unit: 'g', calories: 160, protein: 2, fat: 14.7, carbs: 8.5, tags: ['健康脂肪', '高纤维'], description: '富含单不饱和脂肪酸' },
            
            // 坚果类
            { id: 21, name: '杏仁', category: 'nuts', unit: '颗', calories: 7, protein: 0.3, fat: 0.6, carbs: 0.2, tags: ['健康脂肪', '维生素E'], description: '富含维生素E' },
            { id: 22, name: '核桃', category: 'nuts', unit: '颗', calories: 26, protein: 0.6, fat: 2.6, carbs: 0.5, tags: ['Omega-3', '抗氧化'], description: '富含Omega-3' },
            { id: 23, name: '腰果', category: 'nuts', unit: '颗', calories: 9, protein: 0.3, fat: 0.7, carbs: 0.5, tags: ['健康脂肪', '矿物质'], description: '富含矿物质' },
            
            // 乳制品类
            { id: 24, name: '牛奶', category: 'dairy', unit: 'ml', calories: 60, protein: 3.3, fat: 3.3, carbs: 4.8, tags: ['钙', '蛋白质'], description: '优质钙源' },
            { id: 25, name: '酸奶', category: 'dairy', unit: 'g', calories: 59, protein: 3.5, fat: 3.3, carbs: 4.7, tags: ['益生菌', '钙'], description: '含有益生菌' },
            { id: 26, name: '奶酪', category: 'dairy', unit: 'g', calories: 113, protein: 7, fat: 9, carbs: 1, tags: ['高蛋白', '高钙'], description: '浓缩乳制品' }
        ];
    }
    
    render() {
        const container = document.getElementById('foodSelectorContent');
        container.innerHTML = `
            <div class="space-y-4">
                <!-- 搜索栏 -->
                <div class="relative">
                    <input type="text" id="foodSearch" placeholder="搜索食物名称..." 
                           class="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    <svg class="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>
                
                <!-- 分类筛选 -->
                <div class="flex space-x-2 overflow-x-auto pb-2">
                    <button class="category-btn active px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-emerald-100 text-emerald-700" data-category="all">
                        全部
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="grains">
                        主食
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="protein">
                        蛋白质
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="vegetables">
                        蔬菜
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="fruits">
                        水果
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="nuts">
                        坚果
                    </button>
                    <button class="category-btn px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-gray-100 text-gray-600" data-category="dairy">
                        乳制品
                    </button>
                </div>
                
                <!-- 食物列表 -->
                <div id="foodListContainer" class="space-y-2 max-h-60 overflow-y-auto">
                    <!-- 动态生成的食物列表 -->
                </div>
            </div>
        `;
        
        this.renderFoodList();
    }
    
    setupEventListeners() {
        // 搜索功能
        document.getElementById('foodSearch').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterFoods();
        });
        
        // 分类筛选
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => {
                    b.classList.remove('active', 'bg-emerald-100', 'text-emerald-700');
                    b.classList.add('bg-gray-100', 'text-gray-600');
                });
                
                e.target.classList.add('active', 'bg-emerald-100', 'text-emerald-700');
                e.target.classList.remove('bg-gray-100', 'text-gray-600');
                
                this.selectedCategory = e.target.dataset.category;
                this.filterFoods();
            });
        });
    }
    
    renderFoodList() {
        const container = document.getElementById('foodListContainer');
        container.innerHTML = '';
        
        this.filteredFoods.forEach(food => {
            const foodItem = this.createFoodItem(food);
            container.appendChild(foodItem);
        });
    }
    
    createFoodItem(food) {
        const item = document.createElement('div');
        item.className = 'food-selector-item border border-gray-200 rounded-lg p-3 hover:border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer';
        item.onclick = () => this.selectFood(food);
        
        item.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="font-medium text-gray-800">${food.name}</div>
                    <div class="text-sm text-gray-600">每${food.unit} · ${food.calories}kcal</div>
                    <div class="text-xs text-gray-500 mt-1">
                        蛋白质 ${food.protein}g · 脂肪 ${food.fat}g · 碳水 ${food.carbs}g
                    </div>
                    ${food.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-1 mt-1">
                            ${food.tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="text-emerald-600 font-medium">+</div>
            </div>
        `;
        
        return item;
    }
    
    filterFoods() {
        this.filteredFoods = this.foodDatabase.filter(food => {
            const matchesSearch = food.name.toLowerCase().includes(this.searchQuery) || 
                                food.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));
            const matchesCategory = this.selectedCategory === 'all' || food.category === this.selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderFoodList();
    }
    
    selectFood(food) {
        // 显示数量选择模态框
        this.showQuantityModal(food);
    }
    
    showQuantityModal(food) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.id = 'quantityModal';
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">${food.name}</h3>
                    <p class="text-sm text-gray-500">每${food.unit} · ${food.calories}kcal</p>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">数量 (${food.unit})</label>
                    <input type="number" id="foodQuantity" value="${food.unit === '个' ? 1 : 100}" 
                           min="1" max="1000" step="${food.unit === '个' ? 1 : 10}"
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                </div>
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div class="text-sm text-gray-600 mb-2">营养预览</div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>热量: <span id="previewCalories">${food.calories}</span>kcal</div>
                        <div>蛋白质: <span id="previewProtein">${food.protein}</span>g</div>
                        <div>脂肪: <span id="previewFat">${food.fat}</span>g</div>
                        <div>碳水: <span id="previewCarbs">${food.carbs}</span>g</div>
                    </div>
                </div>
                <div class="flex space-x-3">
                    <button onclick="closeQuantityModal()" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        取消
                    </button>
                    <button onclick="confirmAddFood('${food.name}', '${food.unit}', ${food.calories}, ${food.protein}, ${food.fat}, ${food.carbs})" class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                        添加
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加事件监听
        const quantityInput = document.getElementById('foodQuantity');
        quantityInput.addEventListener('input', (e) => {
            const quantity = parseFloat(e.target.value) || 0;
            const ratio = quantity / 100;
            
            document.getElementById('previewCalories').textContent = Math.round(food.calories * ratio);
            document.getElementById('previewProtein').textContent = (food.protein * ratio).toFixed(1);
            document.getElementById('previewFat').textContent = (food.fat * ratio).toFixed(1);
            document.getElementById('previewCarbs').textContent = (food.carbs * ratio).toFixed(1);
        });
        
        anime({
            targets: modal.querySelector('.bg-white'),
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 300,
            easing: 'easeOutQuart'
        });
    }
}

// 全局函数
function closeQuantityModal() {
    const modal = document.getElementById('quantityModal');
    if (modal) {
        anime({
            targets: modal.querySelector('.bg-white'),
            opacity: [1, 0],
            scale: [1, 0.8],
            duration: 300,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(modal);
            }
        });
    }
}

function confirmAddFood(name, unit, calories, protein, fat, carbs) {
    const quantity = parseFloat(document.getElementById('foodQuantity').value) || 0;
    
    if (quantity <= 0) {
        alert('请输入有效的数量');
        return;
    }
    
    const ratio = unit === '个' ? quantity : quantity / 100;
    
    const food = {
        name,
        unit,
        quantity,
        calories: Math.round(calories * ratio),
        protein: Math.round(protein * ratio * 10) / 10,
        fat: Math.round(fat * ratio * 10) / 10,
        carbs: Math.round(carbs * ratio * 10) / 10
    };
    
    // 向父页面发送消息
    if (window.parent) {
        window.parent.postMessage({
            type: 'addFood',
            food: food
        }, '*');
    }
    
    closeQuantityModal();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.embeddedFoodSelector = new EmbeddedFoodSelector();
});