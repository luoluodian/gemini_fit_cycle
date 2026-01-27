# 饮食记录H5应用优化方案

## 一、优化目标

根据用户反馈，本次优化主要涉及以下核心改进：

1. **重构计划模块** - 实现"周期 + 日模板"概念
2. **添加微信小程序登录功能**
3. **添加隐私协议页面**
4. **优化现有交互体验**

## 二、核心概念重构 - 计划模块

### 2.1 新的计划结构模型

```
一个计划（Plan） = 若干个周期（Cycle） × 每周期的若干日模板（Day 模板）
```

- **日模板**包含：
  - 当日目标（总热量、蛋白质/脂肪/碳水）
  - 当日4餐的具体食物&份量（可选）

- **执行逻辑**：
  - 实际第1天用「模板Day1」
  - 实际第2天用「模板Day2」
  - ...
  - 实际第8天又回到「模板Day1」（按7日周期循环）

### 2.2 关键能力

1. **高自由度** - 每天可以完全不同
2. **可复制** - 模板可以复制、拖拽排序
3. **周期循环** - 可以先做3天模板，一键补满周期

## 三、页面优化方案

### 3.1 登录引导页（新增）

**功能**：微信小程序授权登录

**布局**：
1. Logo/App名称区
2. 说明文案区
3. 微信一键登录按钮
4. 错误提示区（条件显示）
5. 隐私政策入口

**交互**：
- 点击"微信一键登录"拉起授权
- 授权成功→跳转到记录页
- 授权失败→显示错误提示

### 3.2 计划列表页升级

**新增内容**：
- 周期信息展示："7天/周期 × 3个周期 · 共21天"
- 每日热量小字提示

**保持原有**：
- 卡片交互逻辑
- 操作菜单功能

### 3.3 新建/编辑计划页（重点重构）

#### 3.3.1 页面结构

采用单页多区块设计：
1. **区块一：计划基础信息**
   - 计划名称（必填）
   - 计划类型选择
   - 激活计划开关

2. **区块二：周期&总天数设置**
   - 每周期天数输入
   - 周期数量输入
   - 总天数自动计算
   - 复制前3天补满周期按钮

3. **区块三：日模板列表管理**
   - 水平/垂直列表展示
   - 拖拽排序功能
   - 复制/删除操作
   - 新增模板按钮

4. **区块四：当前日模板详情编辑**
   - 模板名称编辑
   - 当日目标设置
   - 4餐餐单配置
   - 添加食物功能

5. **区块五：底部操作**
   - 取消按钮
   - 保存计划按钮

#### 3.3.2 核心交互

- **日模板拖拽排序**：长按拖动改变顺序
- **复制模板**：点击"···"菜单选择复制
- **一键补满周期**：复制现有模板至周期满
- **模板详情编辑**：点击模板卡片切换编辑区

### 3.4 计划详情页升级

**新增展示**：
1. 周期信息："7天/周期 × 3个周期 · 共21天"
2. 日模板概览列表：
   - Day1 · 训练日A · 1800 kcal
   - Day2 · 训练日B · 2000 kcal
   - ...

### 3.5 隐私协议页面（新增）

**内容**：
- 信息收集说明（昵称、头像）
- 数据存储方式
- 用户权利说明
- 联系方式

## 四、执行闭环

### 4.1 记录页执行逻辑

用户设定：7天为1个周期，配置7个日模板，设置周期数为3（共21天）

实际执行：
- 计划第1天 → 使用Day1模板
- 计划第2天 → 使用Day2模板
- ...
- 计划第7天 → 使用Day7模板
- 计划第8天 → 再次从Day1开始
- 直到执行21天后结束

### 4.2 推荐流程

1. **新建计划**：
   - 填写基础信息
   - 设置"7天×3周期"
   - 定义3个模板
   - 一键补满至7天
   - 拖拽调整顺序
   - 微调目标和餐单
   - 保存并激活

2. **记录饮食**：
   - 系统计算"今天是第几天"
   - 对应日模板
   - 一键按计划记录

## 五、技术实现

### 5.1 数据结构设计

```javascript
// 计划数据结构
const plan = {
  id: 'plan_123',
  name: '六周减脂计划',
  type: 'fat-loss',
  isActive: true,
  cycleDays: 7, // 每周期天数
  cycleCount: 3, // 周期数量
  totalDays: 21, // 总天数
  dayTemplates: [ // 日模板数组
    {
      id: 'day_1',
      name: '训练日A',
      dayNumber: 1,
      target: {
        calories: 1800,
        protein: 120,
        fat: 50,
        carbs: 180
      },
      meals: {
        breakfast: [...],
        lunch: [...],
        dinner: [...],
        snacks: [...]
      }
    }
    // ... 更多日模板
  ],
  createdAt: '2024-12-11T10:00:00Z'
}
```

### 5.2 核心算法

1. **计算当前日期对应的日模板**：
```javascript
function getCurrentDayTemplate(plan, startDate) {
  const today = new Date();
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const currentDayInCycle = (daysDiff % plan.cycleDays) + 1;
  return plan.dayTemplates.find(template => template.dayNumber === currentDayInCycle);
}
```

2. **一键补满周期**：
```javascript
function fillCycleWithTemplates(plan) {
  const currentTemplateCount = plan.dayTemplates.length;
  const neededTemplates = plan.cycleDays - currentTemplateCount;
  
  if (neededTemplates <= 0) return;
  
  for (let i = 0; i < neededTemplates; i++) {
    const sourceTemplate = plan.dayTemplates[i % currentTemplateCount];
    const newTemplate = {
      ...sourceTemplate,
      id: `day_${Date.now()}_${i}`,
      dayNumber: currentTemplateCount + i + 1,
      name: `${sourceTemplate.name}-副本`
    };
    plan.dayTemplates.push(newTemplate);
  }
}
```

### 5.3 微信小程序登录集成

```javascript
// 微信登录
function wechatLogin() {
  wx.login({
    success: function(res) {
      if (res.code) {
        // 发送code到后台换取openId和sessionKey
        wx.request({
          url: 'https://api.example.com/login',
          data: { code: res.code },
          success: function(response) {
            // 保存登录态
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('userInfo', JSON.stringify(response.data.userInfo));
            // 跳转到主页面
            window.location.href = 'index.html';
          }
        });
      }
    }
  });
}
```

## 六、开发计划

### 阶段一：核心重构（2-3天）
- [ ] 重构计划数据结构
- [ ] 实现日模板管理功能
- [ ] 实现周期设置和计算
- [ ] 实现拖拽排序和复制功能

### 阶段二：登录集成（1-2天）
- [ ] 创建登录引导页
- [ ] 集成微信小程序登录
- [ ] 实现用户信息存储
- [ ] 创建隐私协议页面

### 阶段三：页面优化（2-3天）
- [ ] 优化计划列表页
- [ ] 优化计划详情页
- [ ] 优化记录页执行逻辑
- [ ] 完善交互细节

### 阶段四：测试部署（1天）
- [ ] 功能测试
- [ ] 兼容性测试
- [ ] 部署上线

## 七、预期效果

1. **用户体验提升**：
   - 更灵活的计划制定方式
   - 更便捷的操作流程
   - 更清晰的周期概念

2. **功能完整性**：
   - 微信小程序登录
   - 完整的隐私保护
   - 专业的营养追踪

3. **商业价值**：
   - 支持计划分享传播
   - 提供个性化服务
   - 建立用户信任

## 八、注意事项

1. **数据迁移**：需要考虑现有用户数据的兼容性问题
2. **性能优化**：日模板数量较多时的渲染性能
3. **用户体验**：确保所有交互都有明确的反馈
4. **隐私合规**：确保符合微信小程序的隐私政策要求

这个优化方案将大大提升应用的专业性和用户体验，让饮食记录变得更加科学和便捷。