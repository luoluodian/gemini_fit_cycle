// 全局变量
let weeklyChart = null;
let userData = {
    name: '健康达人',
    totalDays: 128,
    completedPlans: 5,
    currentPlan: {
        name: '6周减脂计划',
        week: 3,
        remainingDays: 18
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    loadUserData();
    initWeeklyChart();
});

// 初始化页面
function initializePage() {
    // 初始化动画
    anime({
        targets: '.glass-card, .stat-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 600,
        easing: 'easeOutQuart'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // BMR计算器表单
    document.getElementById('bmrForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBMR();
    });
    
    // 模态框关闭
    document.getElementById('bmrModal').addEventListener('click', function(e) {
        if (e.target === this) closeBMRModal();
    });
}

// 加载用户数据
function loadUserData() {
    // 从本地存储加载用户数据
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
        userData = { ...userData, ...JSON.parse(savedUserData) };
    }
    
    // 更新页面显示
    updateUserDisplay();
}

// 更新用户数据显示
function updateUserDisplay() {
    document.getElementById('totalDays').textContent = userData.totalDays;
    document.getElementById('completedPlans').textContent = userData.completedPlans;
}

// 初始化周统计图表
function initWeeklyChart() {
    const chartDom = document.getElementById('weeklyChart');
    weeklyChart = echarts.init(chartDom);
    
    const option = {
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            textStyle: {
                color: '#374151'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
                lineStyle: {
                    color: '#e5e7eb'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#6b7280',
                fontSize: 12
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#6b7280',
                fontSize: 12,
                formatter: '{value} kcal'
            },
            splitLine: {
                lineStyle: {
                    color: '#f3f4f6'
                }
            }
        },
        series: [
            {
                name: '目标热量',
                type: 'line',
                data: [1800, 1800, 1800, 1800, 1800, 1800, 1800],
                lineStyle: {
                    color: '#10b981',
                    type: 'dashed',
                    width: 2
                },
                itemStyle: {
                    color: '#10b981'
                },
                symbol: 'none'
            },
            {
                name: '实际摄入',
                type: 'line',
                data: [1650, 1820, 1580, 1750, 1680, 1920, 1650],
                lineStyle: {
                    color: '#f97316',
                    width: 3
                },
                itemStyle: {
                    color: '#f97316'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            {
                                offset: 0,
                                color: 'rgba(249, 115, 22, 0.3)'
                            },
                            {
                                offset: 1,
                                color: 'rgba(249, 115, 22, 0.05)'
                            }
                        ]
                    }
                }
            }
        ]
    };
    
    weeklyChart.setOption(option);
    
    // 响应式处理
    window.addEventListener('resize', function() {
        weeklyChart.resize();
    });
}

// 查看当前计划
function viewCurrentPlan() {
    showSuccessMessage('正在跳转到计划详情...');
    
    setTimeout(() => {
        window.location.href = 'plan.html';
    }, 1500);
}

// 编辑当前计划
function editCurrentPlan() {
    showSuccessMessage('编辑计划功能开发中...');
    
    setTimeout(() => {
        alert('编辑功能将包括：\n- 修改计划目标\n- 调整餐单配置\n- 设置提醒时间\n- 分享计划');
    }, 1000);
}

// 查看完整统计
function viewFullStats() {
    showSuccessMessage('完整统计功能开发中...');
    
    setTimeout(() => {
        alert('完整统计将包括：\n- 月度/年度趋势\n- 营养素分析\n- 体重变化曲线\n- 计划完成率');
    }, 1000);
}

// 打开BMR计算器
function openBMRCalculator() {
    document.getElementById('bmrModal').classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: '#bmrModal .bg-white',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭BMR计算器
function closeBMRModal() {
    const modal = document.getElementById('bmrModal');
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
            document.getElementById('bmrForm').reset();
            document.getElementById('bmrResult').classList.add('hidden');
        }
    });
}

// 计算BMR和TDEE
function calculateBMR() {
    const gender = document.getElementById('gender').value;
    const age = parseFloat(document.getElementById('age').value);
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activityLevel = parseFloat(document.getElementById('activityLevel').value);
    
    // 验证输入
    if (!age || !height || !weight) {
        alert('请填写完整信息');
        return;
    }
    
    if (age < 10 || age > 100 || height < 100 || height > 250 || weight < 30 || weight > 200) {
        alert('请输入合理的数值范围');
        return;
    }
    
    // 计算BMR (Mifflin-St Jeor公式)
    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    // 计算TDEE
    const tdee = bmr * activityLevel;
    
    // 显示结果
    document.getElementById('bmrValue').textContent = Math.round(bmr) + ' kcal';
    document.getElementById('tdeeValue').textContent = Math.round(tdee) + ' kcal';
    
    // 计算目标建议
    document.getElementById('fatLossTarget').textContent = Math.round(tdee * 0.8) + ' kcal';
    document.getElementById('maintenanceTarget').textContent = Math.round(tdee) + ' kcal';
    document.getElementById('muscleGainTarget').textContent = Math.round(tdee * 1.2) + ' kcal';
    
    // 显示结果区域
    const resultDiv = document.getElementById('bmrResult');
    resultDiv.classList.remove('hidden');
    
    // 添加显示动画
    anime({
        targets: resultDiv,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutQuart'
    });
    
    // 保存用户数据
    const userData = {
        gender,
        age,
        height,
        weight,
        activityLevel,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee)
    };
    
    localStorage.setItem('userHealthData', JSON.stringify(userData));
}

// 打开体重记录
function openWeightTracker() {
    showSuccessMessage('体重记录功能开发中...');
    
    setTimeout(() => {
        alert('体重记录功能将包括：\n- 每日体重记录\n- 体重变化趋势图\n- 目标体重设置\n- 体重分析建议');
    }, 1000);
}

// 打开营养指南
function openNutritionGuide() {
    showSuccessMessage('营养指南功能开发中...');
    
    setTimeout(() => {
        alert('营养指南将包括：\n- 营养素知识库\n- 健康食谱推荐\n- 饮食误区解析\n- 专家建议');
    }, 1000);
}

// 打开设置
function openSettings() {
    showSuccessMessage('设置功能开发中...');
    
    setTimeout(() => {
        alert('设置功能将包括：\n- 通知设置\n- 隐私设置\n- 数据同步\n- 主题设置');
    }, 1000);
}

// 打开帮助
function openHelp() {
    showSuccessMessage('帮助功能开发中...');
    
    setTimeout(() => {
        alert('帮助功能将包括：\n- 使用教程\n- 常见问题\n- 意见反馈\n- 联系客服');
    }, 1000);
}

// 显示关于信息
function showAbout() {
    const aboutModal = document.createElement('div');
    aboutModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    aboutModal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-2xl w-full max-w-sm p-6">
                <div class="text-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">关于应用</h3>
                    <div class="text-4xl mb-2">🍎</div>
                    <h4 class="font-medium text-gray-800">健康饮食记录</h4>
                    <p class="text-sm text-gray-600">版本 1.0.0</p>
                </div>
                
                <div class="space-y-3 text-sm text-gray-600">
                    <div class="flex justify-between">
                        <span>开发者</span>
                        <span>健康饮食团队</span>
                    </div>
                    <div class="flex justify-between">
                        <span>发布日期</span>
                        <span>2024年12月</span>
                    </div>
                    <div class="flex justify-between">
                        <span>适用平台</span>
                        <span>移动端 Web</span>
                    </div>
                </div>
                
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 class="font-medium text-gray-800 mb-2">功能特色</h5>
                    <ul class="text-xs text-gray-600 space-y-1">
                        <li>• 智能饮食记录</li>
                        <li>• 个性化饮食计划</li>
                        <li>• 营养成分分析</li>
                        <li>• 健康数据追踪</li>
                    </ul>
                </div>
                
                <button onclick="closeAboutModal()" class="w-full mt-4 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                    关闭
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(aboutModal);
    
    // 添加显示动画
    anime({
        targets: aboutModal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 点击背景关闭
    aboutModal.addEventListener('click', function(e) {
        if (e.target === aboutModal) closeAboutModal();
    });
}

// 关闭关于模态框
function closeAboutModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50.z-50');
    if (modal) {
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

// 显示导入计划
function showImportPlan() {
    const importModal = document.createElement('div');
    importModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
    importModal.innerHTML = `
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-2xl w-full max-w-sm p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">导入计划</h3>
                    <button onclick="closeImportPlanModal()" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">分享码</label>
                    <input type="text" id="shareCodeInput" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" placeholder="输入分享码，如：PLAN-XXXX">
                </div>
                
                <div class="flex space-x-3">
                    <button onclick="closeImportPlanModal()" class="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        取消
                    </button>
                    <button onclick="importPlanFromProfile()" class="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                        导入
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(importModal);
    
    // 添加显示动画
    anime({
        targets: importModal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
    
    // 点击背景关闭
    importModal.addEventListener('click', function(e) {
        if (e.target === importModal) closeImportPlanModal();
    });
}

// 关闭导入计划模态框
function closeImportPlanModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50.z-50');
    if (modal && modal.querySelector('#shareCodeInput')) {
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

// 从个人中心导入计划
function importPlanFromProfile() {
    const shareCode = document.getElementById('shareCodeInput').value.trim();
    
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
    
    setTimeout(() => {
        window.location.href = 'plan.html';
    }, 2000);
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

// 菜单项点击动画
document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            anime({
                targets: this,
                scale: [0.98, 1],
                duration: 150,
                easing: 'easeOutQuart'
            });
        });
    });
});