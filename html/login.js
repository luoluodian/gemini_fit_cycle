// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
  initializePage();
});

// 初始化页面
function initializePage() {
  // 初始化动画
  anime({
    targets: ".glass-card, .wechat-btn",
    translateY: [20, 0],
    opacity: [0, 1],
    delay: anime.stagger(100),
    duration: 600,
    easing: "easeOutQuart",
  });

  // 检查是否已经登录
  checkLoginStatus();
}

// 检查登录状态
function checkLoginStatus() {
  const userToken = localStorage.getItem("userToken");
  const userInfo = localStorage.getItem("userInfo");

  if (userToken && userInfo) {
    // 已登录，直接跳转
    console.log("用户已登录，跳转至主页面");
    // setTimeout(() => {
    //     window.location.href = 'index.html';
    // }, 1000);
  }
}

// 微信登录
function wechatLogin() {
  // 微信环境，调用微信登录
  if (typeof wx === "undefined") {
    showError("微信JS-SDK未加载，请检查网络连接");
    return;
  }

  // 调用微信登录
  wx.login({
    success: function (res) {
      if (res.code) {
        // 发送code到后台换取openId和sessionKey
        authenticateWithBackend(res.code);
      } else {
        showError("微信登录失败：" + res.errMsg);
      }
    },
    fail: function (res) {
      showError("微信登录失败：" + res.errMsg);
    },
  });
}

// 与后端认证
function authenticateWithBackend(code) {
  showSuccess("正在验证登录信息...");

  // 模拟API调用
  setTimeout(() => {
    // 模拟成功响应
    const response = {
      success: true,
      data: {
        token: "token_" + Date.now(),
        userInfo: {
          openId: "openid_" + Date.now(),
          nickName: "微信用户",
          avatarUrl: "https://via.placeholder.com/100",
          gender: 0,
          city: "北京",
          province: "北京",
          country: "中国",
        },
      },
    };

    if (response.success) {
      // 保存用户信息和token
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userInfo", JSON.stringify(response.data.userInfo));

      // 跳转到主页面
      showSuccess("登录成功！");
      setTimeout(() => {
        // window.location.href = "index.html";
      }, 1500);
    } else {
      showError("登录验证失败，请重试");
    }
  }, 2000);
}

// 免登录体验
function tryWithoutLogin() {
  if (confirm("免登录体验模式下，数据将不会保存。确定要继续吗？")) {
    // 设置免登录标记
    localStorage.setItem("demoMode", "true");

    // 跳转到主页面
    // window.location.href = "index.html";
  }
}

// 显示隐私政策
function showPrivacyPolicy() {
  const modal = document.getElementById("privacyModal");
  modal.classList.remove("hidden");

  // 添加显示动画
  anime({
    targets: modal.querySelector(".bg-white"),
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 300,
    easing: "easeOutQuart",
  });
}

// 关闭隐私政策
function closePrivacyPolicy() {
  const modal = document.getElementById("privacyModal");
  anime({
    targets: modal.querySelector(".bg-white"),
    scale: [1, 0.8],
    opacity: [1, 0],
    duration: 200,
    easing: "easeInQuart",
    complete: () => {
      modal.classList.add("hidden");
    },
  });
}

// 显示错误消息
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");

  errorText.textContent = message;
  errorDiv.classList.remove("hidden");

  // 添加显示动画
  anime({
    targets: errorDiv,
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 300,
    easing: "easeOutQuart",
  });

  // 5秒后自动隐藏
  setTimeout(() => {
    anime({
      targets: errorDiv,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuart",
      complete: () => {
        errorDiv.classList.add("hidden");
      },
    });
  }, 5000);
}

// 显示成功消息
function showSuccess(message) {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50";
  toast.textContent = message;
  document.body.appendChild(toast);

  // 添加显示动画
  anime({
    targets: toast,
    translateY: [-20, 0],
    opacity: [0, 1],
    duration: 300,
    easing: "easeOutQuart",
  });

  // 3秒后自动消失
  setTimeout(() => {
    anime({
      targets: toast,
      translateY: [0, -20],
      opacity: [1, 0],
      duration: 300,
      easing: "easeInQuart",
      complete: () => {
        document.body.removeChild(toast);
      },
    });
  }, 3000);
}

// 检查微信JS-SDK是否加载
function checkWechatSDK() {
  if (typeof wx !== "undefined") {
    console.log("微信JS-SDK已加载");
    // 配置微信JS-SDK
    wx.config({
      // 这里需要填写从后台获取的配置信息
      appId: "your_app_id",
      timestamp: Math.floor(Date.now() / 1000),
      nonceStr: "random_string",
      signature: "signature_from_backend",
      jsApiList: ["login", "getUserInfo"],
    });

    wx.ready(function () {
      console.log("微信JS-SDK配置成功");
    });

    wx.error(function (res) {
      console.error("微信JS-SDK配置失败：", res);
    });
  } else {
    console.log("微信JS-SDK未加载");
    // 延迟检查
    setTimeout(checkWechatSDK, 1000);
  }
}

// 页面可见性变化时检查登录状态
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    checkLoginStatus();
  }
});

// 监听存储变化（用于处理多标签页登录状态）
window.addEventListener("storage", function (e) {
  if (e.key === "userToken" && e.newValue) {
    // 其他标签页登录了，刷新当前页面
    window.location.reload();
  }
});
