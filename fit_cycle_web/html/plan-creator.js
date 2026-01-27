// 计划创建页面逻辑
class PlanCreator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.planData = {
            name: '',
            type: '',
            startDate: '',
            setActive: true,
            cycleDays: 7,
            cycleCount: 3,
            targetMode: 'individual',
            defaultCalories: 1800,
            defaultProtein: 120,
            defaultFat: 50,
            defaultCarbs: 180
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setDefaultDate();
        this.updateTotalDays();
    }
    
    setupEventListeners() {
        // 计划类型选择
        document.querySelectorAll('.plan-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.plan-type-btn').forEach(b => {
                    b.classList.remove('bg-emerald-100', 'border-emerald-500', 'text-emerald-700');
                    b.classList.add('border-gray-300');
                });
                
                e.target.classList.add('bg-emerald-100', 'border-emerald-500', 'text-emerald-700');
                e.target.classList.remove('border-gray-300');
                
                this.planData.type = e.target.dataset.type;
            });
        });
        
        // 周期天数和数量变化
        document.getElementById('cycleDays').addEventListener('input', () => {
            this.updateTotalDays();
        });
        
        document.getElementById('cycleCount').addEventListener('input', () => {
            this.updateTotalDays();
        });
        
        // 目标模式选择
        document.querySelectorAll('input[name="targetMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.planData.targetMode = e.target.value;
            });
        });
        
        // 默认目标值变化
        ['defaultCalories', 'defaultProtein', 'defaultFat', 'defaultCarbs'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                this.planData[id] = parseInt(e.target.value) || 0;
            });
        });
        
        // 表单字段变化
        ['planName', 'startDate'].forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                const key = id === 'planName' ? 'name' : 'startDate';
                this.planData[key] = e.target.value;
            });
        });
        
        document.getElementById('setActive').addEventListener('change', (e) => {
            this.planData.setActive = e.target.checked;
        });
    }
    
    setDefaultDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateString = tomorrow.toISOString().split('T')[0];
        document.getElementById('startDate').value = dateString;
        this.planData.startDate = dateString;
    }
    
    updateTotalDays() {
        const cycleDays = parseInt(document.getElementById('cycleDays').value) || 0;
        const cycleCount = parseInt(document.getElementById('cycleCount').value) || 0;
        const total = cycleDays * cycleCount;
        
        document.getElementById('totalDays').textContent = `${total} 天`;
        
        this.planData.cycleDays = cycleDays;
        this.planData.cycleCount = cycleCount;
    }
    
    validateStep(step) {
        switch(step) {
            case 1:
                const name = document.getElementById('planName').value.trim();
                if (!name) {
                    this.showToast('请输入计划名称', 'error');
                    return false;
                }
                if (!this.planData.type) {
                    this.showToast('请选择计划类型', 'error');
                    return false;
                }
                return true;
            case 2:
                if (this.planData.cycleDays < 1 || this.planData.cycleDays > 14) {
                    this.showToast('周期天数应在 1-14 天之间', 'error');
                    return false;
                }
                if (this.planData.cycleCount < 1 || this.planData.cycleCount > 10) {
                    this.showToast('周期数量应在 1-10 个之间', 'error');
                    return false;
                }
                return true;
            case 3:
                if (!document.getElementById('confirmCreate').checked) {
                    this.showToast('请确认创建计划', 'error');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }
    
    updateStepDisplay() {
        // 隐藏所有步骤
        for (let i = 1; i <= this.totalSteps; i++) {
            document.getElementById(`step${i}`).classList.add('hidden');
        }
        
        // 显示当前步骤
        document.getElementById(`step${this.currentStep}`).classList.remove('hidden');
        
        // 更新步骤指示器
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < this.currentStep) {
                indicator.classList.add('completed');
            } else if (index + 1 === this.currentStep) {
                indicator.classList.add('active');
            } else {
                indicator.classList.add('bg-gray-200', 'text-gray-600');
            }
        });
        
        // 更新按钮状态
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (this.currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = '创建计划';
            nextBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            nextBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
        } else {
            nextBtn.textContent = '下一步';
            nextBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
            nextBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
        }
        
        // 更新确认页面
        if (this.currentStep === 3) {
            this.updateSummary();
        }
    }
    
    updateSummary() {
        const typeNames = {
            'fat-loss': '减脂',
            'muscle-gain': '增肌',
            'maintenance': '维持',
            'custom': '自定义'
        };
        
        document.getElementById('summaryName').textContent = this.planData.name;
        document.getElementById('summaryType').textContent = typeNames[this.planData.type] || '-';
        document.getElementById('summaryDays').textContent = `${this.planData.cycleDays * this.planData.cycleCount} 天`;
        document.getElementById('summaryCycle').textContent = `${this.planData.cycleDays}天 × ${this.planData.cycleCount}周期`;
        document.getElementById('summaryCalories').textContent = `${this.planData.defaultCalories} kcal`;
    }
    
    nextStep() {
        if (!this.validateStep(this.currentStep)) {
            return;
        }
        
        if (this.currentStep === this.totalSteps) {
            this.createPlan();
            return;
        }
        
        this.currentStep++;
        this.updateStepDisplay();
        
        // 添加动画效果
        anime({
            targets: `#step${this.currentStep}`,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 500,
            easing: 'easeOutQuart'
        });
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            
            // 添加动画效果
            anime({
                targets: `#step${this.currentStep}`,
                opacity: [0, 1],
                translateY: [-20, 0],
                duration: 500,
                easing: 'easeOutQuart'
            });
        }
    }
    
    createPlan() {
        // 生成计划ID
        const planId = 'plan_' + Date.now();
        
        // 创建计划对象
        const plan = {
            id: planId,
            name: this.planData.name,
            type: this.planData.type,
            startDate: this.planData.startDate,
            cycleDays: this.planData.cycleDays,
            cycleCount: this.planData.cycleCount,
            totalDays: this.planData.cycleDays * this.planData.cycleCount,
            targetMode: this.planData.targetMode,
            defaultTargets: {
                calories: this.planData.defaultCalories,
                protein: this.planData.defaultProtein,
                fat: this.planData.defaultFat,
                carbs: this.planData.defaultCarbs
            },
            dailyPlans: this.generateDailyPlans(),
            createdAt: new Date().toISOString(),
            isActive: this.planData.setActive
        };
        
        // 保存到本地存储
        this.savePlan(plan);
        
        // 显示成功消息
        this.showToast('计划创建成功！', 'success');
        
        // 跳转到每日列表页面
        setTimeout(() => {
            window.location.href = `daily-list.html?planId=${planId}`;
        }, 1500);
    }
    
    generateDailyPlans() {
        const dailyPlans = [];
        const totalDays = this.planData.cycleDays * this.planData.cycleCount;
        
        for (let i = 0; i < totalDays; i++) {
            const date = new Date(this.planData.startDate);
            date.setDate(date.getDate() + i);
            
            const dayNumber = (i % this.planData.cycleDays) + 1;
            const cycleNumber = Math.floor(i / this.planData.cycleDays) + 1;
            
            dailyPlans.push({
                id: `day_${i + 1}`,
                date: date.toISOString().split('T')[0],
                dayNumber: dayNumber,
                cycleNumber: cycleNumber,
                name: `第${cycleNumber}周期 - 第${dayNumber}天`,
                targets: {
                    calories: this.planData.defaultCalories,
                    protein: this.planData.defaultProtein,
                    fat: this.planData.defaultFat,
                    carbs: this.planData.defaultCarbs
                },
                meals: {
                    breakfast: [],
                    lunch: [],
                    dinner: [],
                    snacks: []
                },
                isCompleted: false,
                isConfigured: false
            });
        }
        
        return dailyPlans;
    }
    
    savePlan(plan) {
        let plans = JSON.parse(localStorage.getItem('dietPlans') || '[]');
        plans.push(plan);
        localStorage.setItem('dietPlans', JSON.stringify(plans));
        
        // 如果设置为激活状态，更新激活计划
        if (plan.isActive) {
            localStorage.setItem('activePlanId', plan.id);
        }
    }
    
    showToast(message, type = 'info') {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 ${
            type === 'success' ? 'bg-emerald-500' : 
            type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // 动画显示
        anime({
            targets: toast,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        // 3秒后移除
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
function nextStep() {
    window.planCreator.nextStep();
}

function prevStep() {
    window.planCreator.prevStep();
}

function goBack() {
    window.location.href = 'index.html';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.planCreator = new PlanCreator();
});