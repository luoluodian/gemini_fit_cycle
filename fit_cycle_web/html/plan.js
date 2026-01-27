// 全局变量
let currentTab = 'active';
let currentPlanId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadPlanData();
});

// 初始化页面
function initializePage() {
    // 设置默认日期
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    document.getElementById('startDate').value = today.toISOString().split('T')[0];
    document.getElementById('endDate').value = nextMonth.toISOString().split('T')[0];
    
    // 初始化动画
    anime({
        targets: '.glass-card, .plan-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交
    document.getElementById('newPlanForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createPlan();
    });
    
    // 模态框关闭
    document.getElementById('newPlanModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewPlanModal();
    });
    document.getElementById('importPlanModal').addEventListener('click', function(e) {
        if (e.target === this) closeImportPlanModal();
    });
}

// 切换标签页
function switchTab(tab) {
    currentTab = tab;
    
    // 更新标签按钮样式
    const tabs = ['active', 'completed', 'archived'];
    tabs.forEach(t => {
        const tabElement = document.getElementById(t + 'Tab');
        const contentElement = document.getElementById(t + 'Plans');
        
        if (t === tab) {
            tabElement.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium';
            contentElement.classList.remove('hidden');
        } else {
            tabElement.className = 'px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium';
            contentElement.classList.add('hidden');
        }
    });
    
    // 添加切换动画
    const activeContent = document.getElementById(tab + 'Plans');
    anime({
        targets: activeContent.children,
        translateX: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 400,
        easing: 'easeOutQuart'
    });
}

// 加载计划数据
function loadPlanData() {
    // 这里应该从本地存储加载数据
    // 现在使用示例数据
    updateStats();
}

// 更新统计信息
function updateStats() {
    const activeCount = document.querySelectorAll('#activePlans .plan-card').length;
    const completedCount = document.querySelectorAll('#completedPlans .plan-card').length;
    
    document.getElementById('activePlansCount').textContent = activeCount;
    document.getElementById('completedPlansCount').textContent = completedCount;
}

// 创建新计划
function createNewPlan() {
    document.getElementById('newPlanModal').classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: '#newPlanModal .bg-white',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭新计划模态框
function closeNewPlanModal() {
    const modal = document.getElementById('newPlanModal');
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

// 创建计划
function createPlan() {
    const formData = {
        name: document.getElementById('planName').value,
        type: document.getElementById('planType').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        calories: document.getElementById('dailyCalories').value,
        protein: document.getElementById('proteinTarget').value,
        fat: document.getElementById('fatTarget').value,
        carbs: document.getElementById('carbTarget').value,
        setActive: document.getElementById('setActive').checked
    };
    
    // 验证必填字段
    if (!formData.name || !formData.startDate || !formData.calories) {
        alert('请填写必填字段');
        return;
    }
    
    // 验证数值合理性
    if (formData.calories < 800 || formData.calories > 4000) {
        alert('热量目标应在800-4000 kcal之间');
        return;
    }
    
    // 创建计划对象
    const plan = {
        id: 'plan_' + Date.now(),
        ...formData,
        status: formData.setActive ? 'active' : 'paused',
        createdAt: new Date().toISOString(),
        progress: 0
    };
    
    // 保存到本地存储
    savePlan(plan);
    
    // 关闭模态框
    closeNewPlanModal();
    
    // 重置表单
    document.getElementById('newPlanForm').reset();
    
    // 显示成功消息
    showSuccessMessage('计划创建成功！');
    
    // 刷新页面数据
    loadPlanData();
    
    // 如果是激活状态，跳转到记录页面
    if (formData.setActive) {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// 保存计划到本地存储
function savePlan(plan) {
    let plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
    plans.push(plan);
    localStorage.setItem('dietPlans', JSON.stringify(plans));
}

// 查看计划详情
function viewPlanDetail(planId) {
    // 这里应该跳转到计划详情页面或显示详情模态框
    showSuccessMessage('计划详情功能开发中...');
    
    // 模拟跳转到详情页
    setTimeout(() => {
        alert('计划详情页面将显示：\n- 每日目标详情\n- 餐单配置\n- 进度统计\n- 分享功能');
    }, 1000);
}

// 编辑计划
function editPlan(planId) {
    showSuccessMessage('编辑计划功能开发中...');
    
    setTimeout(() => {
        alert('编辑功能将包括：\n- 修改基本信息\n- 调整每日目标\n- 配置餐单\n- 设置提醒');
    }, 1000);
}

// 激活计划
function activatePlan(planId) {
    // 先取消当前激活的计划
    deactivateCurrentPlan();
    
    // 激活选中的计划
    updatePlanStatus(planId, 'active');
    
    showSuccessMessage('计划已激活！');
    
    // 更新界面
    loadPlanData();
}

// 取消当前激活的计划
function deactivateCurrentPlan() {
    // 这里应该更新本地存储中的计划状态
    showSuccessMessage('当前计划已暂停');
}

// 更新计划状态
function updatePlanStatus(planId, status) {
    // 这里应该更新本地存储中的计划状态
    console.log(`Plan ${planId} status changed to ${status}`);
}

// 显示计划菜单
function showPlanMenu(planId) {
    currentPlanId = planId;
    
    // 创建菜单
    const menu = document.createElement('div');
    menu.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    menu.innerHTML = `
        <div class="flex items-end justify-center min-h-screen">
            <div class="bg-white rounded-t-3xl w-full max-w-md p-6">
                <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h3 class="text-lg font-semibold text-gray-800 mb-4">计划操作</h3>
                <div class="space-y-2">
                    <button onclick="editPlan('${planId}')" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            编辑计划
                        </div>
                    </button>
                    <button onclick="sharePlan('${planId}')" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                            </svg>
                            分享计划
                        </div>
                    </button>
                    <button onclick="duplicatePlan('${planId}')" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            复制计划
                        </div>
                    </button>
                    <button onclick="archivePlan('${planId}')" class="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8l6 6 6-6"></path>
                            </svg>
                            归档计划
                        </div>
                    </button>
                    <button onclick="deletePlan('${planId}')" class="w-full text-left p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            删除计划
                        </div>
                    </button>
                </div>
                <button onclick="closePlanMenu()" class="w-full mt-4 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                    取消
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // 添加显示动画
    anime({
        targets: menu.querySelector('.bg-white'),
        translateY: [100, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 点击背景关闭
    menu.addEventListener('click', function(e) {
        if (e.target === menu) closePlanMenu();
    });
}

// 关闭计划菜单
function closePlanMenu() {
    const menu = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50.z-50');
    if (menu) {
        anime({
            targets: menu.querySelector('.bg-white'),
            translateY: [0, 100],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(menu);
            }
        });
    }
}

// 分享计划
function sharePlan(planId) {
    closePlanMenu();
    
    // 生成分享码
    const shareCode = 'PLAN-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // 显示分享信息
    const shareModal = document.createElement('div');
    shareModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    shareModal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-2xl w-full max-w-sm p-6">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">分享计划</h3>
                    <p class="text-sm text-gray-600">分享码已生成，复制后发送给朋友</p>
                </div>
                <div class="bg-gray-100 rounded-lg p-3 mb-4">
                    <div class="text-center">
                        <div class="text-2xl font-mono font-bold text-emerald-600">${shareCode}</div>
                        <div class="text-xs text-gray-500 mt-1">分享码</div>
                    </div>
                </div>
                <div class="flex space-x-3">
                    <button onclick="copyShareCode('${shareCode}')" class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                        复制分享码
                    </button>
                    <button onclick="closeShareModal()" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareModal);
    
    // 添加显示动画
    anime({
        targets: shareModal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 点击背景关闭
    shareModal.addEventListener('click', function(e) {
        if (e.target === shareModal) closeShareModal();
    });
}

// 复制分享码
function copyShareCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showSuccessMessage('分享码已复制到剪贴板！');
        closeShareModal();
    }).catch(() => {
        alert('复制失败，请手动复制：' + code);
    });
}

// 关闭分享模态框
function closeShareModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50.z-50');
    if (modal && modal.querySelector('.bg-white').querySelector('.text-2xl.font-mono')) {
        anime({
            targets: modal.querySelector('.bg-white'),
            scale: [1, 0.8],
            opacity: [1, 0],
            duration: 200,
            easing: 'easeInQuart',
            complete: () => {
                document.body.removeChild(modal);
            }
        });
    }
}

// 复制计划
function duplicatePlan(planId) {
    closePlanMenu();
    showSuccessMessage('计划复制成功！');
}

// 归档计划
function archivePlan(planId) {
    closePlanMenu();
    showSuccessMessage('计划已归档！');
    loadPlanData();
}

// 删除计划
function deletePlan(planId) {
    closePlanMenu();
    
    if (confirm('确定要删除这个计划吗？此操作不可撤销。')) {
        showSuccessMessage('计划已删除！');
        loadPlanData();
    }
}

// 显示导入计划
function showImportPlan() {
    document.getElementById('importPlanModal').classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: '#importPlanModal .bg-white',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭导入计划模态框
function closeImportPlanModal() {
    const modal = document.getElementById('importPlanModal');
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

// 导入计划
function importPlan() {
    const shareCode = document.getElementById('shareCode').value.trim();
    
    if (!shareCode) {
        alert('请输入分享码');
        return;
    }
    
    if (!shareCode.startsWith('PLAN-')) {
        alert('分享码格式不正确');
        return;
    }
    
    // 模拟导入过程
    closeImportPlanModal();
    showSuccessMessage('计划导入成功！');
    
    // 清空输入框
    document.getElementById('shareCode').value = '';
    
    // 刷新数据
    loadPlanData();
}

// 显示计划类型选择
function showPlanTypes() {
    showSuccessMessage('推荐计划已显示在页面下方');
    
    // 滚动到推荐计划区域
    const recommendedSection = document.querySelector('.glass-card.rounded-2xl.p-4.mb-6.shadow-lg');
    recommendedSection.scrollIntoView({ behavior: 'smooth' });
}

// 创建推荐计划
function createRecommendedPlan(type) {
    const planTemplates = {
        'fat-loss': {
            name: '30天减脂挑战',
            type: 'fat-loss',
            calories: 1600,
            protein: 120,
            fat: 45,
            carbs: 160
        },
        'muscle-gain': {
            name: '增肌训练计划',
            type: 'muscle-gain',
            calories: 2200,
            protein: 150,
            fat: 60,
            carbs: 250
        },
        'balanced': {
            name: '均衡营养计划',
            type: 'maintenance',
            calories: 2000,
            protein: 100,
            fat: 65,
            carbs: 200
        }
    };
    
    const template = planTemplates[type];
    if (!template) return;
    
    // 填充表单
    document.getElementById('planName').value = template.name;
    document.getElementById('planType').value = template.type;
    document.getElementById('dailyCalories').value = template.calories;
    document.getElementById('proteinTarget').value = template.protein;
    document.getElementById('fatTarget').value = template.fat;
    document.getElementById('carbTarget').value = template.carbs;
    
    // 显示创建计划模态框
    createNewPlan();
}

// 重用计划
function reusePlan(planId) {
    showSuccessMessage('计划已复制到草稿');
    
    setTimeout(() => {
        createNewPlan();
    }, 1000);
}

// 恢复计划
function restorePlan(planId) {
    showSuccessMessage('计划已从归档恢复');
    loadPlanData();
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

// 进度环动画
function animateProgressRings() {
    const rings = document.querySelectorAll('.progress-ring-circle[stroke="#10b981"]');
    rings.forEach(ring => {
        const circumference = 2 * Math.PI * 52;
        const progress = 40; // 示例进度
        const offset = circumference - (progress / 100) * circumference;
        
        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;
        
        anime({
            targets: ring,
            strokeDashoffset: offset,
            duration: 1000,
            easing: 'easeOutQuart'
        });
    });
}

// 页面加载完成后执行进度环动画
setTimeout(animateProgressRings, 500);