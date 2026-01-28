Component({
  data: {
    selected: 0,
    color: "#9ca3af",
    selectedColor: "#10b981",
    list: [
      {
        pagePath: "/pages/index/index",
        text: "记录",
        icon: "📋"
      },
      {
        pagePath: "/pages/plan/index",
        text: "计划",
        icon: "📅"
      },
      {
        pagePath: "/pages/food/index",
        text: "食材",
        icon: "🍎"
      },
      {
        pagePath: "/pages/profile/index",
        text: "我的",
        icon: "👤"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index
      })
    }
  }
})
