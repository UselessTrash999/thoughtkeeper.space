/**
 * 导航管理器
 * 负责页面路由和导航逻辑
 */

class Navigation {
    constructor() {
        this.currentRoute = {
            page: 'main',
            categoryId: null
        };

        this.routeChangeCallbacks = [];
        this.navigationHistory = [];
        this.maxHistorySize = 10;

        // 解析初始路由
        this.parseCurrentRoute();

        // 设置浏览器前进后退监听
        this.setupBrowserNavigation();
    }

    /**
     * 解析当前路由
     */
    parseCurrentRoute() {
        const hash = window.location.hash.slice(1); // 移除 #

        if (!hash) {
            this.currentRoute = { page: 'main', categoryId: null };
            return;
        }

        const parts = hash.split('/');

        if (parts[0] === 'editor' && parts[1]) {
            this.currentRoute = {
                page: 'editor',
                categoryId: parts[1]
            };
        } else {
            this.currentRoute = { page: 'main', categoryId: null };
        }
    }

    /**
     * 导航到指定页面
     */
    navigateTo(page, params = {}) {
        // 检查是否是相同的路由，避免重复导航
        if (this.currentRoute.page === page &&
            this.currentRoute.categoryId === params.categoryId) {
            return true;
        }

        let newHash = '';
        const previousRoute = { ...this.currentRoute };

        switch (page) {
            case 'main':
                newHash = '';
                this.currentRoute = { page: 'main', categoryId: null };
                break;

            case 'editor':
                if (!params.categoryId) {
                    console.error('导航到编辑器需要提供categoryId');
                    return false;
                }
                newHash = `editor/${params.categoryId}`;
                this.currentRoute = {
                    page: 'editor',
                    categoryId: params.categoryId
                };
                break;

            default:
                console.error('未知的页面:', page);
                return false;
        }

        // 更新页面标题
        this.updatePageTitle();

        // 更新URL（这会触发hashchange事件）
        if (newHash) {
            window.location.hash = newHash;
        } else {
            // 清除hash
            history.pushState('', document.title, window.location.pathname + window.location.search);
            // 手动触发路由变化通知，因为pushState不会触发hashchange
            this.notifyRouteChange();
        }

        return true;
    }

    /**
     * 返回上一页
     */
    goBack() {
        if (this.currentRoute.page === 'editor') {
            this.navigateTo('main');
        } else {
            // 如果已经在主页，可以考虑其他逻辑
            console.log('已经在主页面');
        }
    }

    /**
     * 获取当前路由信息
     */
    getCurrentRoute() {
        return { ...this.currentRoute };
    }

    /**
     * 获取当前页面
     */
    getCurrentPage() {
        return this.currentRoute.page;
    }

    /**
     * 获取当前分类ID
     */
    getCurrentCategoryId() {
        return this.currentRoute.categoryId;
    }

    /**
     * 检查是否在指定页面
     */
    isCurrentPage(page) {
        return this.currentRoute.page === page;
    }

    /**
     * 检查是否在指定分类的编辑页面
     */
    isCurrentCategory(categoryId) {
        return this.currentRoute.page === 'editor' &&
            this.currentRoute.categoryId === categoryId;
    }

    /**
     * 设置页面标题
     */
    setPageTitle(title) {
        document.title = title ? `${title} - 思维记录工具` : '思维记录工具';
    }

    /**
     * 根据当前路由更新页面标题
     */
    updatePageTitle() {
        if (this.currentRoute.page === 'main') {
            this.setPageTitle('');
        } else if (this.currentRoute.page === 'editor' && this.currentRoute.categoryId) {
            // 这里需要从应用中获取分类标题，暂时使用ID
            this.setPageTitle(`编辑 - ${this.currentRoute.categoryId}`);
        }
    }

    /**
     * 设置浏览器导航支持
     */
    setupBrowserNavigation() {
        // 监听hash变化
        window.addEventListener('hashchange', () => {
            this.parseCurrentRoute();
            this.notifyRouteChange();
        });

        // 监听浏览器前进后退
        window.addEventListener('popstate', () => {
            this.parseCurrentRoute();
            this.notifyRouteChange();
        });
    }

    /**
     * 添加路由变化监听器
     */
    onRouteChange(callback) {
        this.routeChangeCallbacks.push(callback);
    }

    /**
     * 通知所有监听器路由已变化
     */
    notifyRouteChange() {
        const currentRoute = this.getCurrentRoute();

        // 添加到历史记录
        this.addToHistory(currentRoute);

        this.routeChangeCallbacks.forEach(callback => {
            try {
                callback(currentRoute);
            } catch (error) {
                console.error('路由变化回调执行失败:', error);
            }
        });
    }

    /**
     * 添加路由到历史记录
     */
    addToHistory(route) {
        // 避免重复添加相同的路由
        const lastRoute = this.navigationHistory[this.navigationHistory.length - 1];
        if (lastRoute && lastRoute.page === route.page && lastRoute.categoryId === route.categoryId) {
            return;
        }

        // 添加时间戳
        const historyItem = {
            ...route,
            timestamp: new Date().toISOString()
        };

        this.navigationHistory.push(historyItem);

        // 限制历史记录大小
        if (this.navigationHistory.length > this.maxHistorySize) {
            this.navigationHistory.shift();
        }
    }

    /**
     * 获取导航历史记录
     */
    getNavigationHistory() {
        return [...this.navigationHistory];
    }

    /**
     * 清除导航历史记录
     */
    clearHistory() {
        this.navigationHistory = [];
    }
}