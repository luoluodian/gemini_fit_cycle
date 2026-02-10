// 注入到微信小程序环境的业务逻辑工具
window.__PLAN_TEST__ = {
    triggerCreate: function() {
        var p = getCurrentPages().pop();
        if (p && p.createNewPlan) p.createNewPlan();
    },
    clickModal: function() {
        var views = document.querySelectorAll('view');
        for (var i = 0; i < views.length; i++) {
            if (views[i].innerText && views[i].innerText.indexOf('创建新计划') !== -1) {
                views[i].click();
                return true;
            }
        }
        return false;
    },
    setupDraft: function(name) {
        var p = getCurrentPages().pop();
        var s = (p && p.planStore) || (getApp() && getApp().planStore);
        if (s) {
            s.draft.name = name;
            s.draft.type = 'custom';
            if (p.handleNext) p.handleNext();
            return true;
        }
        return false;
    },
    confirmPlan: function() {
        var p = getCurrentPages().pop();
        if (p && p.submitPlan) p.submitPlan();
        else if (p && p.planStore && p.planStore.confirmPlan) p.planStore.confirmPlan();
    },
    getCalories: function() {
        var s = getApp().planStore;
        return (s && s.currentDayTarget) ? Number(s.currentDayTarget.currentCalories) : 0;
    },
    addFood: function() {
        var s = getApp().planStore;
        if (s && s.addFoodToMeal) {
            s.addFoodToMeal('breakfast', {name: 'AutoOats', calories: 370});
            return true;
        }
        return false;
    }
};
