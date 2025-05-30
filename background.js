// 存储和更新规则
let currentRuleIds = [];

// 从存储加载配置并更新规则
async function updateRules() {
    const { filterRules = {} } = await chrome.storage.sync.get('filterRules');

    // 移除旧规则
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: currentRuleIds
    });

    currentRuleIds = [];

    if (filterRules.enabled && filterRules.targetWebsites && filterRules.blockedRequests) {
        const newRules = [];
        if(filterRules.targetWebsites){
            // 为每个目标网站和模式创建规则
            filterRules.targetWebsites.forEach((domain, domainIndex) => {
                filterRules.blockedRequests.forEach((pattern, patternIndex) => {
                    const ruleId = domainIndex * 1000 + patternIndex + 1;
                    currentRuleIds.push(ruleId);

                    newRules.push({
                        id: ruleId,
                        priority: 1,
                        action: { type: 'block' },
                        condition: {
                            urlFilter: pattern,
                            domains: [new URL(domain).hostname],
                            resourceTypes: ['xmlhttprequest']
                        }
                    });
                });
            });
        }


        // 添加新规则
        try {
            await chrome.declarativeNetRequest.updateDynamicRules({
                addRules: newRules
            });
            console.log('Rules updated successfully');
        } catch (error) {
            console.error('Error updating rules:', error);
        }
    }
}

// 初始化
chrome.runtime.onInstalled.addListener(updateRules);
chrome.storage.onChanged.addListener(updateRules);

// 与popup通信
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getRules") {
        chrome.storage.sync.get('filterRules', (data) => {
            sendResponse(data.filterRules || {});
        });
        return true; // 保持消息通道开放
    }
});