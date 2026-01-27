// 每日列表页面逻辑
class DailyList {
    constructor() {
        this.planId = this.getPlanId();
        this.plan = null;
        this.filteredDays = [];
        this.currentFilter = 'all';
        this.sortOrder = 'asc';
        this.currentDate = new Date();
        
        this.init();
    }
    
    init() {
        if (!this.planId) {
            this.showToast('未找到计划ID', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        this.loadPlan();
        this.setupEventListeners();
        this.renderDailyList();
        this.updateStatistics();
    }
    
    getPlanId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('planId');
    }
    
    loadPlan() {
        const plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
        this.plan = plans.find(p => p.id === this.planId);
        
        if (!this.plan) {
            this.showToast('未找到计划', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }
        
        // 更新页面标题
        document.getElementById('planName').textContent = this.plan.name;
        document.getElementById('planInfo').textContent = `共 ${this.plan.totalDays} 天 · ${this.plan.cycleCount} 周期`;
    }
    
    setupEventListeners() {
        // 筛选按钮
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.id.replace('filter', '').toLowerCase();
                this.applyFilter(filter);
            });
        });
    }
    
    applyFilter(filter) {
        this.currentFilter = filter;
        
        // 更新按钮样式
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('bg-emerald-100', 'text-emerald-700');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        });
        
        document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
            .classList.add('bg-emerald-100', 'text-emerald-700');
        document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)
            .classList.remove('bg-gray-100', 'text-gray-600');
        
        this.renderDailyList();
    }
    
    renderDailyList() {
        const container = document.getElementById('dailyList');
        container.innerHTML = '';
        
        let days = [...this.plan.dailyPlans];
        
        // 应用筛选
        if (this.currentFilter !== 'all') {
            switch(this.currentFilter) {
                case 'active':
                    days = days.filter(day => this.isActiveDay(day));
                    break;
                case 'configured':
                    days = days.filter(day => day.isConfigured);
                    break;
                case 'completed':
                    days = days.filter(day => day.isCompleted);
                    break;
            }
        }
        
        // 应用排序
        if (this.sortOrder === 'desc') {
            days.reverse();
        }
        
        this.filteredDays = days;
        
        days.forEach((day, index) => {
            const dayCard = this.createDayCard(day, index);
            container.appendChild(dayCard);
        });
        
        // 添加动画
        anime({
            targets: '.day-card',
            opacity: [0, 1],
            translateY: [20, 0],
            delay: anime.stagger(50),
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
    
    createDayCard(day, index) {
        const card = document.createElement('div');
        card.className = `day-card glass-card rounded-xl p-4 shadow-sm ${this.getDayStatusClass(day)}`;
        
        const date = new Date(day.date);
        const isToday = this.isToday(date);
        const isPast = date < this.currentDate;
        
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <div class="flex items-center space-x-2 mb-2">
                        <h3 class="font-semibold text-gray-800">${day.name}</h3>
                        ${isToday ? '<span class="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">今天</span>' : ''}
                        ${day.isCompleted ? '<span class="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">已完成</span>' : ''}
                        ${day.isConfigured && !day.isCompleted ? '<span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">已配置</span>' : ''}
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${this.formatDate(date)}</p>
                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span>热量: ${day.targets.calories}kcal</span>
                        <span>蛋白质: ${day.targets.protein}g</span>
                        <span>碳水: ${day.targets.carbs}g</span>
                        <span>脂肪: ${day.targets.fat}g</span>
                    </div>
                </div>
                <div class="flex flex-col items-end space-y-2">
                    <button onclick="editDay('${day.id}')" class="px-3 py-1 text-xs font-medium rounded-lg ${
                        day.isCompleted ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    } transition-colors">
                        ${day.isCompleted ? '查看' : day.isConfigured ? '编辑' : '配置'}
                    </button>
                    ${day.isConfigured ? `
                        <button onclick="copyDay('${day.id}')" class="px-3 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                            复制
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        return card;
    }
    
    getDayStatusClass(day) {
        if (day.isCompleted) return 'completed';
        if (day.isConfigured) return 'configured';
        if (this.isActiveDay(day)) return 'active';
        return '';
    }
    
    isActiveDay(day) {
        const date = new Date(day.date);
        return this.isToday(date);
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    formatDate(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[date.getDay()];
        return `${month}月${day}日 ${weekday}`;
    }
    
    updateStatistics() {
        const totalDays = this.plan.totalDays;
        const completedDays = this.plan.dailyPlans.filter(day => day.isCompleted).length;
        const configuredDays = this.plan.dailyPlans.filter(day => day.isConfigured).length;
        const remainingDays = totalDays - configuredDays;
        
        document.getElementById('completedCount').textContent = completedDays;
        document.getElementById('configuredCount').textContent = configuredDays;
        document.getElementById('remainingCount').textContent = remainingDays;
        
        document.getElementById('progressText').textContent = `${completedDays}/${totalDays}`;
        
        const progressPercent = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
        document.getElementById('progressBar').style.width = `${progressPercent}%`;
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
    window.location.href = 'plan-creator.html';
}

function editDay(dayId) {
    const planId = window.dailyList.planId;
    window.location.href = `daily-plan.html?planId=${planId}&dayId=${dayId}`;
}

function copyDay(dayId) {
    const day = window.dailyList.plan.dailyPlans.find(d => d.id === dayId);
    if (day) {
        localStorage.setItem('copiedDay', JSON.stringify(day));
        window.dailyList.showToast('日期配置已复制', 'success');
    }
}

function toggleSortOrder() {
    window.dailyList.sortOrder = window.dailyList.sortOrder === 'asc' ? 'desc' : 'asc';
    window.dailyList.renderDailyList();
}

function goToToday() {
    const today = new Date();
    const todayDay = window.dailyList.plan.dailyPlans.find(day => {
        const date = new Date(day.date);
        return date.toDateString() === today.toDateString();
    });
    
    if (todayDay) {
        editDay(todayDay.id);
    } else {
        window.dailyList.showToast('今天没有计划', 'info');
    }
}

function viewNutritionSummary() {
    const planId = window.dailyList.planId;
    alert('营养统计功能开发中...');
}

function batchConfigure() {
    document.getElementById('batchModal').classList.remove('hidden');
    
    anime({
        targets: '#batchModal > div',
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

function closeBatchModal() {
    anime({
        targets: '#batchModal > div',
        opacity: [1, 0],
        scale: [1, 0.8],
        duration: 300,
        easing: 'easeInQuart',
        complete: () => {
            document.getElementById('batchModal').classList.add('hidden');
        }
    });
}

function executeBatchAction() {
    const action = document.getElementById('batchAction').value;
    
    switch(action) {
        case 'copy':
            const copiedDay = localStorage.getItem('copiedDay');
            if (copiedDay) {
                const dayData = JSON.parse(copiedDay);
                // 这里可以实现批量复制逻辑
                window.dailyList.showToast('批量复制功能开发中...', 'info');
            } else {
                window.dailyList.showToast('请先复制一个日期配置', 'error');
            }
            break;
        case 'template':
            window.dailyList.showToast('模板功能开发中...', 'info');
            break;
        case 'reset':
            if (confirm('确定要重置所有配置吗？')) {
                window.dailyList.showToast('重置功能开发中...', 'info');
            }
            break;
    }
    
    closeBatchModal();
}

function copyPlan() {
    window.dailyList.showToast('复制计划功能开发中...', 'info');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.dailyList = new DailyList();
});