document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const toggleEnabled = document.getElementById('toggleEnabled');
    const toggleLabel = document.getElementById('toggleLabel');
    const websiteInput = document.getElementById('websiteInput');
    const addWebsite = document.getElementById('addWebsite');
    const websiteList = document.getElementById('websiteList');
    const patternInput = document.getElementById('patternInput');
    const addPattern = document.getElementById('addPattern');
    const patternList = document.getElementById('patternList');
    
    // 从后台获取当前规则
    chrome.runtime.sendMessage({ action: "getRules" }, (response) => {
      updateUI(response);
    });
    
    // 更新UI函数
    function updateUI(rules) {
      // 更新开关状态
      toggleEnabled.checked = rules.enabled;
      toggleLabel.textContent = rules.enabled ? "Filtering Enabled" : "Filtering Disabled";
      
      // 更新网站列表
      websiteList.innerHTML = '';
      rules.targetWebsites.forEach(site => {
        const li = document.createElement('li');
        li.textContent = site;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          removeItem('targetWebsites', site);
        });
        li.appendChild(removeBtn);
        websiteList.appendChild(li);
      });
      
      // 更新模式列表
      patternList.innerHTML = '';
      rules.blockedRequests.forEach(pattern => {
        const li = document.createElement('li');
        li.textContent = pattern;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          removeItem('blockedRequests', pattern);
        });
        li.appendChild(removeBtn);
        patternList.appendChild(li);
      });
    }
    
    // 移除项目函数
    function removeItem(listType, item) {
      chrome.runtime.sendMessage({ action: "getRules" }, (response) => {
        const index = response[listType].indexOf(item);
        if (index > -1) {
          response[listType].splice(index, 1);
          chrome.runtime.sendMessage({ 
            action: "updateRules", 
            rules: response 
          }, () => {
            updateUI(response);
          });
        }
      });
    }
    
    // 添加网站
    addWebsite.addEventListener('click', () => {
      const site = websiteInput.value.trim();
      if (site) {
        chrome.runtime.sendMessage({ action: "getRules" }, (response) => {
          if (!response.targetWebsites.includes(site)) {
            response.targetWebsites.push(site);
            chrome.runtime.sendMessage({ 
              action: "updateRules", 
              rules: response 
            }, () => {
              websiteInput.value = '';
              updateUI(response);
            });
          }
        });
      }
    });
    
    // 添加模式
    addPattern.addEventListener('click', () => {
      const pattern = patternInput.value.trim();
      if (pattern) {
        chrome.runtime.sendMessage({ action: "getRules" }, (response) => {
          if (!response.blockedRequests.includes(pattern)) {
            response.blockedRequests.push(pattern);
            chrome.runtime.sendMessage({ 
              action: "updateRules", 
              rules: response 
            }, () => {
              patternInput.value = '';
              updateUI(response);
            });
          }
        });
      }
    });
    
    // 切换开关
    toggleEnabled.addEventListener('change', () => {
      chrome.runtime.sendMessage({ action: "getRules" }, (response) => {
        response.enabled = toggleEnabled.checked;
        chrome.runtime.sendMessage({ 
          action: "updateRules", 
          rules: response 
        }, () => {
          updateUI(response);
        });
      });
    });
  });