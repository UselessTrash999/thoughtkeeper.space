/**
 * 应用主入口文件
 * 负责初始化应用和协调各个组件
 */

class ThoughtOrganizerApp {
    constructor() {
        this.storage = null;
        this.navigation = null;
        this.mainGrid = null;
        this.editor = null;
        this.routeChangeTimer = null;
        
        // 设置全局错误处理
        this.setupGlobalErrorHandling();
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            // 显示加载指示器
            this.showLoadingScreen();
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initComponents());
            } else {
                this.initComponents();
            }
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.hideLoadingScreen();
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }
    
    /**
     * 初始化各个组件
     */
    initComponents() {
        // 初始化存储管理器
        this.storage = new StorageManager();
        
        // 检查数据恢复
        this.checkDataRecovery();
        
        // 初始化导航系统
        this.navigation = new Navigation();
        
        // 初始化主网格
        this.mainGrid = new MainGrid(
            document.getElementById('grid-container'),
            this.storage,
            this.navigation
        );
        
        // 初始化编辑器
        this.editor = new Editor(
            document.getElementById('editor-container'),
            this.storage,
            this.navigation
        );
        
        // 设置导航事件监听
        this.setupNavigationEvents();
        
        // 设置全局引用，供其他组件使用
        window.app = this;
        
        // 初始化多语言支持
        this.setupI18n();
        
        // 设置设置弹窗事件
        this.setupSettingsModal();
        
        // 渲染初始界面
        this.render();
        
        // 隐藏加载指示器
        setTimeout(() => {
            this.hideLoadingScreen();
            
            // 检查是否需要显示用户引导
            this.checkFirstTimeUser();
        }, 500); // 延迟500ms以确保用户能看到加载过程
        
        console.log('思维记录工具初始化完成');
    }
    
    /**
     * 检查数据恢复
     */
    checkDataRecovery() {
        try {
            const storageInfo = this.storage.getStorageInfo();
            
            if (storageInfo.supported) {
                console.log(`存储使用情况: ${storageInfo.used} bytes (${storageInfo.percentage}%)`);
                
                // 如果存储使用率过高，提醒用户
                if (storageInfo.percentage > 80) {
                    console.warn('存储空间使用率较高，建议清理旧数据');
                }
            }
            
            // 检查是否有未保存的数据需要恢复
            const allCategories = this.storage.getAllCategories();
            const categoryCount = Object.keys(allCategories).length;
            
            if (categoryCount > 0) {
                console.log(`恢复了 ${categoryCount} 个分类的数据`);
            }
        } catch (error) {
            console.error('数据恢复检查失败:', error);
        }
    }
    
    /**
     * 设置导航相关事件
     */
    setupNavigationEvents() {
        // 返回按钮事件
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigation.goBack();
            });
        }
        
        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            // ESC键返回主界面
            if (e.key === 'Escape' && this.navigation.getCurrentPage() === 'editor') {
                e.preventDefault();
                this.navigation.goBack();
            }
            
            // Alt + 数字键快速切换分类
            if (e.altKey && e.key >= '1' && e.key <= '6') {
                e.preventDefault();
                const categoryIndex = parseInt(e.key) - 1;
                const categories = this.mainGrid.categories;
                if (categories[categoryIndex]) {
                    this.navigation.navigateTo('editor', { 
                        categoryId: categories[categoryIndex].id 
                    });
                }
            }
        });
        
        // 使用Navigation类的路由变化监听
        this.navigation.onRouteChange((route) => {
            this.render(route);
        });
    }
    
    /**
     * 处理路由变化（防抖优化）
     */
    handleRouteChange() {
        // 防抖处理，避免快速点击导致的性能问题
        if (this.routeChangeTimer) {
            clearTimeout(this.routeChangeTimer);
        }
        
        this.routeChangeTimer = setTimeout(() => {
            const currentRoute = this.navigation.getCurrentRoute();
            this.render(currentRoute);
        }, 50); // 50ms防抖
    }
    
    /**
     * 渲染应用界面
     */
    render(route = null) {
        const currentRoute = route || this.navigation.getCurrentRoute();
        
        if (currentRoute.page === 'editor' && currentRoute.categoryId) {
            this.showEditorView(currentRoute.categoryId);
        } else {
            this.showMainView();
        }
    }
    
    /**
     * 显示主界面
     */
    showMainView() {
        // 立即切换视图
        document.getElementById('main-view').classList.remove('hidden');
        document.getElementById('editor-view').classList.add('hidden');
        
        // 重置页面标题
        this.navigation.setPageTitle('');
        
        // 优化主网格渲染
        requestAnimationFrame(() => {
            this.mainGrid.render();
        });
    }
    
    /**
     * 显示编辑界面
     */
    showEditorView(categoryId) {
        // 立即切换视图，提升响应速度
        const mainView = document.getElementById('main-view');
        const editorView = document.getElementById('editor-view');
        
        mainView.classList.add('hidden');
        editorView.classList.remove('hidden');
        
        // 更新分类标题和面包屑
        const categoryTitle = this.mainGrid.getCategoryTitle(categoryId);
        const titleElement = document.getElementById('category-title');
        const breadcrumbElement = document.getElementById('category-breadcrumb');
        
        if (titleElement) {
            titleElement.textContent = categoryTitle;
        }
        
        if (breadcrumbElement) {
            breadcrumbElement.textContent = categoryTitle;
        }
        
        // 更新页面标题
        this.navigation.setPageTitle(categoryTitle);
        
        // 显示加载状态
        const editorContainer = document.getElementById('editor-container');
        if (editorContainer) {
            editorContainer.style.opacity = '0.7';
        }
        
        // 使用 requestAnimationFrame 优化渲染时机
        requestAnimationFrame(() => {
            this.editor.render(categoryId);
            
            // 渲染完成后恢复透明度
            if (editorContainer) {
                editorContainer.style.opacity = '1';
            }
        });
    }
    
    /**
     * 设置设置弹窗事件
     */
    setupSettingsModal() {
        const settingsBtn = document.getElementById('settings-btn');
        const settingsModal = document.getElementById('settings-modal');
        const closeModal = document.getElementById('close-modal');
        const backupBtn = document.getElementById('backup-btn');
        const restoreBtn = document.getElementById('restore-btn');
        const restoreFile = document.getElementById('restore-file');
        const clearDataBtn = document.getElementById('clear-data-btn');
        
        // 打开设置弹窗
        settingsBtn.addEventListener('click', () => {
            this.showSettingsModal();
        });
        
        // 关闭设置弹窗
        closeModal.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
        });
        
        // 点击背景关闭弹窗
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });
        
        // 备份数据
        backupBtn.addEventListener('click', () => {
            if (this.storage.backupData()) {
                this.showMessage(window.i18n.t('ui.backupSuccess'));
            } else {
                this.showMessage(window.i18n.t('ui.backupFailed'), 'error');
            }
        });
        
        // 恢复数据
        restoreBtn.addEventListener('click', () => {
            restoreFile.click();
        });
        
        restoreFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                if (await this.storage.restoreData(file)) {
                    this.showMessage(window.i18n.t('ui.restoreSuccess'));
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    this.showMessage(window.i18n.t('ui.restoreFailed'), 'error');
                }
            }
        });
        
        // 清空数据
        clearDataBtn.addEventListener('click', () => {
            if (confirm(window.i18n.t('ui.confirmClearData'))) {
                if (this.storage.clearAllData()) {
                    this.showMessage(window.i18n.t('ui.dataCleared'));
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    this.showMessage(window.i18n.t('ui.clearDataFailed'), 'error');
                }
            }
        });
    }
    
    /**
     * 显示设置弹窗
     */
    showSettingsModal() {
        const settingsModal = document.getElementById('settings-modal');
        const storageInfo = document.getElementById('storage-info');
        
        // 更新存储信息
        const info = this.storage.getStorageInfo();
        const supportedText = info.supported ? window.i18n.t('ui.yes') : window.i18n.t('ui.no');
        storageInfo.innerHTML = `
            <p><strong>${window.i18n.t('ui.storageSupported')}:</strong> ${supportedText}</p>
            <p><strong>${window.i18n.t('ui.storageUsed')}:</strong> ${(info.used / 1024).toFixed(2)} KB</p>
            <p><strong>${window.i18n.t('ui.storageUsage')}:</strong> ${info.percentage}%</p>
            <p><strong>${window.i18n.t('ui.categoryCount')}:</strong> ${Object.keys(this.storage.getAllCategories()).length}</p>
        `;
        
        settingsModal.classList.remove('hidden');
    }
    
    /**
     * 显示消息
     */
    showMessage(message, type = 'success') {
        // 创建消息元素
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            background: ${type === 'error' ? '#dc2626' : '#059669'};
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        document.body.appendChild(messageDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 3000);
    }
    
    /**
     * 显示加载屏幕
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }
    
    /**
     * 隐藏加载屏幕
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            // 完全隐藏后移除元素以释放内存
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 300);
        }
    }
    
    /**
     * 检查首次使用用户
     */
    checkFirstTimeUser() {
        const hasUsedBefore = localStorage.getItem('thoughtOrganizer_hasUsed');
        
        if (!hasUsedBefore) {
            this.showWelcomeGuide();
        }
    }
    
    /**
     * 显示欢迎引导
     */
    showWelcomeGuide() {
        const welcomeModal = document.getElementById('welcome-modal');
        const closeWelcome = document.getElementById('close-welcome');
        const startUsing = document.getElementById('start-using');
        
        if (welcomeModal) {
            welcomeModal.classList.remove('hidden');
            
            // 关闭引导
            const closeGuide = () => {
                welcomeModal.classList.add('hidden');
                localStorage.setItem('thoughtOrganizer_hasUsed', 'true');
            };
            
            closeWelcome.addEventListener('click', closeGuide);
            startUsing.addEventListener('click', closeGuide);
            
            // 点击背景关闭
            welcomeModal.addEventListener('click', (e) => {
                if (e.target === welcomeModal) {
                    closeGuide();
                }
            });
        }
    }
    
    /**
     * 设置全局错误处理
     */
    setupGlobalErrorHandling() {
        // 捕获未处理的JavaScript错误
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.showMessage('应用遇到了一个错误，但仍可继续使用', 'error');
        });
        
        // 捕获未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            this.showMessage('操作失败，请重试', 'error');
        });
        
        // 监听存储配额超出错误
        window.addEventListener('storage', (event) => {
            if (event.key === null) {
                // 存储被清空
                this.showMessage('存储数据已被清空，应用将重新初始化', 'warning');
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        });
    }
    
    /**
     * 初始化多语言支持
     */
    setupI18n() {
        // 初始化i18n
        window.i18n.init();
        
        // 设置语言切换按钮事件
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
        
        // 设置语言选择器事件
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.addEventListener('click', () => {
                const lang = option.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
        
        // 监听语言变化事件
        window.addEventListener('languageChanged', () => {
            this.updateUI();
        });
        
        // 初始化UI文本
        this.updateUI();
    }
    
    /**
     * 切换语言
     */
    toggleLanguage() {
        const currentLang = window.i18n.getCurrentLanguage();
        const newLang = currentLang === 'zh' ? 'en' : 'zh';
        this.setLanguage(newLang);
    }
    
    /**
     * 设置语言
     */
    setLanguage(lang) {
        window.i18n.setLanguage(lang);
        
        // 更新语言选择器状态
        const langOptions = document.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.classList.toggle('active', option.getAttribute('data-lang') === lang);
        });
    }
    
    /**
     * 更新UI文本
     */
    updateUI() {
        // 更新所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = window.i18n.t(key);
        });
        
        // 更新所有带有data-i18n-title属性的元素
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = window.i18n.t(key);
        });
        
        // 更新编辑器占位符
        const editorContent = document.querySelector('.editor-content');
        if (editorContent) {
            editorContent.setAttribute('data-placeholder', window.i18n.t('ui.placeholder'));
        }
        
        // 重新渲染主网格以更新分类标题
        if (this.mainGrid) {
            this.mainGrid.render();
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        this.showMessage(message, 'error');
    }
}

// 创建应用实例
const app = new ThoughtOrganizerApp();