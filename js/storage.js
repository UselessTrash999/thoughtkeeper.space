/**
 * 存储管理器
 * 负责本地数据的存储和检索
 */

class StorageManager {
    constructor() {
        this.storageKey = 'thoughtOrganizer';
        this.version = '1.0.0';
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1秒
        
        // 检查localStorage支持
        this.isSupported = this.checkLocalStorageSupport();
        
        if (!this.isSupported) {
            console.warn('localStorage不支持，将使用内存存储');
            this.memoryStorage = {};
        }
        
        // 初始化存储结构
        this.initStorage();
        
        // 监听存储空间不足
        this.setupStorageMonitoring();
    }
    
    /**
     * 检查localStorage支持
     */
    checkLocalStorageSupport() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 初始化存储结构
     */
    initStorage() {
        try {
            const data = this.getData();
            
            if (!data || !data.version) {
                // 首次使用，创建默认结构
                const defaultData = {
                    version: this.version,
                    categories: {},
                    settings: {
                        theme: 'light',
                        autoSaveInterval: 3000
                    },
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
                
                this.setData(defaultData);
                console.log('初始化存储结构完成');
            } else {
                // 检查版本兼容性
                this.handleVersionMigration(data);
            }
        } catch (error) {
            console.error('初始化存储失败:', error);
            // 如果初始化失败，创建空的内存存储
            this.memoryStorage = {
                version: this.version,
                categories: {},
                settings: { theme: 'light', autoSaveInterval: 3000 }
            };
        }
    }
    
    /**
     * 处理版本迁移
     */
    handleVersionMigration(data) {
        if (data.version !== this.version) {
            console.log(`检测到版本变化: ${data.version} -> ${this.version}`);
            
            // 这里可以添加版本迁移逻辑
            switch (data.version) {
                case undefined:
                case '0.9.0':
                    // 从旧版本迁移
                    this.migrateFromOldVersion(data);
                    break;
                default:
                    // 版本兼容，只更新版本号
                    data.version = this.version;
                    data.lastModified = new Date().toISOString();
                    this.setData(data);
                    break;
            }
        }
    }
    
    /**
     * 从旧版本迁移数据
     */
    migrateFromOldVersion(data) {
        try {
            // 确保必要的字段存在
            if (!data.settings) {
                data.settings = {
                    theme: 'light',
                    autoSaveInterval: 3000
                };
            }
            
            if (!data.createdAt) {
                data.createdAt = new Date().toISOString();
            }
            
            // 更新版本和修改时间
            data.version = this.version;
            data.lastModified = new Date().toISOString();
            
            this.setData(data);
            console.log('数据迁移完成');
        } catch (error) {
            console.error('数据迁移失败:', error);
        }
    }
    
    /**
     * 获取完整数据
     */
    getData() {
        try {
            if (this.isSupported) {
                const data = localStorage.getItem(this.storageKey);
                return data ? JSON.parse(data) : null;
            } else {
                return this.memoryStorage;
            }
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    }
    
    /**
     * 设置完整数据
     */
    setData(data) {
        try {
            data.lastModified = new Date().toISOString();
            
            if (this.isSupported) {
                localStorage.setItem(this.storageKey, JSON.stringify(data));
            } else {
                this.memoryStorage = { ...data };
            }
            
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }
    
    /**
     * 保存分类内容
     */
    saveContent(categoryId, content) {
        const data = this.getData();
        
        if (!data) {
            console.error('无法获取存储数据');
            return false;
        }
        
        // 更新分类数据
        data.categories[categoryId] = {
            content: content,
            lastModified: new Date().toISOString(),
            wordCount: this.countWords(content)
        };
        
        return this.setData(data);
    }
    
    /**
     * 加载分类内容
     */
    loadContent(categoryId) {
        const data = this.getData();
        
        if (!data || !data.categories || !data.categories[categoryId]) {
            return {
                content: '',
                lastModified: null,
                wordCount: 0
            };
        }
        
        return data.categories[categoryId];
    }
    
    /**
     * 获取所有分类数据
     */
    getAllCategories() {
        const data = this.getData();
        return data ? data.categories : {};
    }
    
    /**
     * 清空分类内容
     */
    clearCategory(categoryId) {
        const data = this.getData();
        
        if (data && data.categories && data.categories[categoryId]) {
            delete data.categories[categoryId];
            return this.setData(data);
        }
        
        return true;
    }
    
    /**
     * 导出所有数据
     */
    exportData() {
        const data = this.getData();
        return data ? JSON.stringify(data, null, 2) : null;
    }
    
    /**
     * 备份数据到文件
     */
    backupData() {
        try {
            const data = this.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `思维记录工具备份_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('备份数据失败:', error);
            return false;
        }
    }
    
    /**
     * 从文件恢复数据
     */
    async restoreData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // 验证数据格式
            if (!data.version || !data.categories) {
                throw new Error('无效的备份文件格式');
            }
            
            // 处理版本兼容性
            this.handleVersionMigration(data);
            
            return true;
        } catch (error) {
            console.error('恢复数据失败:', error);
            return false;
        }
    }
    
    /**
     * 清空所有数据
     */
    clearAllData() {
        try {
            if (this.isSupported) {
                localStorage.removeItem(this.storageKey);
            } else {
                this.memoryStorage = {};
            }
            
            this.initStorage();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }
    
    /**
     * 统计字数
     */
    countWords(content) {
        if (!content) return 0;
        
        // 移除HTML标签
        const textContent = content.replace(/<[^>]*>/g, '');
        
        // 统计中文字符和英文单词
        const chineseChars = (textContent.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishWords = (textContent.match(/[a-zA-Z]+/g) || []).length;
        
        return chineseChars + englishWords;
    }
    
    /**
     * 设置存储监控
     */
    setupStorageMonitoring() {
        // 监听存储事件
        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === this.storageKey) {
                    console.log('存储数据在其他标签页中被修改');
                    // 可以在这里添加数据同步逻辑
                }
            });
        }
    }
    
    /**
     * 带重试的保存操作
     */
    async saveWithRetry(data, retryCount = 0) {
        try {
            return this.setData(data);
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.warn(`保存失败，${this.retryDelay}ms后重试 (${retryCount + 1}/${this.maxRetries}):`, error);
                
                // 如果是存储空间不足，尝试清理
                if (error.name === 'QuotaExceededError') {
                    this.handleStorageQuotaExceeded();
                }
                
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.saveWithRetry(data, retryCount + 1);
            } else {
                console.error('保存失败，已达到最大重试次数:', error);
                throw error;
            }
        }
    }
    
    /**
     * 处理存储空间不足
     */
    handleStorageQuotaExceeded() {
        console.warn('存储空间不足，尝试清理旧数据');
        
        try {
            // 获取当前数据
            const data = this.getData();
            if (!data || !data.categories) return;
            
            // 找到最旧的分类数据并删除
            const categories = Object.entries(data.categories);
            if (categories.length > 0) {
                categories.sort((a, b) => {
                    const dateA = new Date(a[1].lastModified || 0);
                    const dateB = new Date(b[1].lastModified || 0);
                    return dateA - dateB;
                });
                
                // 删除最旧的分类
                const oldestCategory = categories[0][0];
                delete data.categories[oldestCategory];
                
                console.log(`已清理最旧的分类数据: ${oldestCategory}`);
                this.setData(data);
            }
        } catch (cleanupError) {
            console.error('清理存储空间失败:', cleanupError);
        }
    }
    
    /**
     * 获取存储使用情况
     */
    getStorageInfo() {
        if (!this.isSupported) {
            return {
                supported: false,
                used: 0,
                total: 0,
                percentage: 0
            };
        }
        
        try {
            const data = this.exportData();
            const used = new Blob([data || '']).size;
            const total = 5 * 1024 * 1024; // 假设5MB限制
            
            return {
                supported: true,
                used: used,
                total: total,
                percentage: Math.round((used / total) * 100)
            };
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return {
                supported: true,
                used: 0,
                total: 0,
                percentage: 0
            };
        }
    }
}