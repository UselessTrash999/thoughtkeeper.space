/**
 * 国际化支持
 * 中英双语切换功能
 */

class I18n {
    constructor() {
        this.currentLang = this.getStoredLanguage() || this.detectLanguage();
        this.translations = {
            zh: {
                // 应用标题和描述
                appTitle: 'ThoughtKeeper',
                appSubtitle: '整理你的想法，分类你的思考',
                
                // 分类名称
                categories: {
                    'todo-list': {
                        title: '待办清单',
                        description: '记录和管理日常任务与待办事项'
                    },
                    'reflection': {
                        title: '反思复盘',
                        description: '总结经验教训，反思成长历程'
                    },
                    'creative-ideas': {
                        title: '创作灵感',
                        description: '捕捉创意火花，记录灵感瞬间'
                    },
                    'philosophical-insights': {
                        title: '哲思洞察',
                        description: '深度思考，哲学思辨与洞察'
                    },
                    'literature-poetry': {
                        title: '文学诗歌',
                        description: '文学创作，诗歌韵律与美感'
                    },
                    'principles-treasury': {
                        title: '原则宝典',
                        description: '人生原则，智慧箴言与准则'
                    }
                },
                
                // 界面文本
                ui: {
                    back: '返回',
                    settings: '设置',
                    dataManagement: '数据管理',
                    close: '关闭',
                    
                    // 编辑器
                    bold: '加粗',
                    italic: '斜体',
                    underline: '下划线',
                    unorderedList: '无序列表',
                    orderedList: '有序列表',
                    undo: '撤销',
                    redo: '重做',
                    clearFormat: '清除格式',
                    placeholder: '开始记录你的想法...',
                    
                    // 状态
                    saved: '已保存',
                    unsaved: '未保存',
                    saving: '保存中...',
                    saveFailed: '保存失败',
                    
                    // 统计
                    wordCount: '字数',
                    charCount: '字符',
                    lineCount: '行数',
                    lastModified: '最后修改',
                    never: '从未',
                    
                    // 设置弹窗
                    dataBackup: '数据备份',
                    dataBackupDesc: '将您的所有思维记录导出为JSON文件',
                    backupData: '备份数据',
                    dataRestore: '数据恢复',
                    dataRestoreDesc: '从备份文件恢复您的思维记录',
                    restoreData: '恢复数据',
                    storageInfo: '存储信息',
                    loadingStorageInfo: '正在加载存储信息...',
                    dangerousOperations: '危险操作',
                    clearAllData: '清空所有数据',
                    clearAllDataDesc: '清空所有数据（此操作不可恢复）',
                    
                    // 存储信息
                    storageSupported: '存储支持',
                    storageUsed: '已使用',
                    storageUsage: '使用率',
                    categoryCount: '分类数量',
                    yes: '是',
                    no: '否',
                    
                    // 语言设置
                    language: '语言',
                    languageSettings: '语言设置',
                    chinese: '中文',
                    english: 'English',
                    
                    // 消息提示
                    backupSuccess: '数据备份成功！',
                    backupFailed: '数据备份失败！',
                    restoreSuccess: '数据恢复成功！请刷新页面查看。',
                    restoreFailed: '数据恢复失败！请检查文件格式。',
                    dataCleared: '数据已清空！',
                    clearDataFailed: '清空数据失败！',
                    confirmClearData: '确定要清空所有数据吗？此操作不可恢复！',
                    
                    // 欢迎引导
                    welcome: '欢迎使用 ThoughtKeeper！',
                    welcomeSteps: {
                        categorize: {
                            title: '分类思考',
                            desc: '6个分类方块帮您整理不同类型的想法和思考。'
                        },
                        richText: {
                            title: '富文本编辑',
                            desc: '支持加粗、斜体、列表等格式，让您的想法更有条理。'
                        },
                        autoSave: {
                            title: '自动保存',
                            desc: '3秒自动保存，数据存储在本地，保护您的隐私。'
                        }
                    },
                    keyboardShortcuts: '快捷键提示',
                    startUsing: '开始使用'
                }
            },
            
            en: {
                // App title and description
                appTitle: 'ThoughtKeeper',
                appSubtitle: 'Organize your thoughts, categorize your thinking',
                
                // Category names
                categories: {
                    'todo-list': {
                        title: 'Todo List',
                        description: 'Record and manage daily tasks and to-do items'
                    },
                    'reflection': {
                        title: 'Reflection',
                        description: 'Summarize lessons learned and reflect on growth'
                    },
                    'creative-ideas': {
                        title: 'Creative Ideas',
                        description: 'Capture creative sparks and record moments of inspiration'
                    },
                    'philosophical-insights': {
                        title: 'Philosophical Insights',
                        description: 'Deep thinking, philosophical contemplation and insights'
                    },
                    'literature-poetry': {
                        title: 'Literature & Poetry',
                        description: 'Literary creation, poetic rhythm and aesthetics'
                    },
                    'principles-treasury': {
                        title: 'Principles Treasury',
                        description: 'Life principles, wisdom maxims and guidelines'
                    }
                },
                
                // UI text
                ui: {
                    back: 'Back',
                    settings: 'Settings',
                    dataManagement: 'Data Management',
                    close: 'Close',
                    
                    // Editor
                    bold: 'Bold',
                    italic: 'Italic',
                    underline: 'Underline',
                    unorderedList: 'Bullet List',
                    orderedList: 'Numbered List',
                    undo: 'Undo',
                    redo: 'Redo',
                    clearFormat: 'Clear Format',
                    placeholder: 'Start recording your thoughts...',
                    
                    // Status
                    saved: 'Saved',
                    unsaved: 'Unsaved',
                    saving: 'Saving...',
                    saveFailed: 'Save Failed',
                    
                    // Statistics
                    wordCount: 'Words',
                    charCount: 'Characters',
                    lineCount: 'Lines',
                    lastModified: 'Last Modified',
                    never: 'Never',
                    
                    // Settings modal
                    dataBackup: 'Data Backup',
                    dataBackupDesc: 'Export all your thought records as a JSON file',
                    backupData: 'Backup Data',
                    dataRestore: 'Data Restore',
                    dataRestoreDesc: 'Restore your thought records from a backup file',
                    restoreData: 'Restore Data',
                    storageInfo: 'Storage Information',
                    loadingStorageInfo: 'Loading storage information...',
                    dangerousOperations: 'Dangerous Operations',
                    clearAllData: 'Clear All Data',
                    clearAllDataDesc: 'Clear all data (this operation cannot be undone)',
                    
                    // Storage info
                    storageSupported: 'Storage Supported',
                    storageUsed: 'Used',
                    storageUsage: 'Usage',
                    categoryCount: 'Categories',
                    yes: 'Yes',
                    no: 'No',
                    
                    // Language settings
                    language: 'Language',
                    languageSettings: 'Language Settings',
                    chinese: '中文',
                    english: 'English',
                    
                    // Messages
                    backupSuccess: 'Data backup successful!',
                    backupFailed: 'Data backup failed!',
                    restoreSuccess: 'Data restore successful! Please refresh the page.',
                    restoreFailed: 'Data restore failed! Please check the file format.',
                    dataCleared: 'Data cleared!',
                    clearDataFailed: 'Failed to clear data!',
                    confirmClearData: 'Are you sure you want to clear all data? This operation cannot be undone!',
                    
                    // Welcome guide
                    welcome: 'Welcome to ThoughtKeeper!',
                    welcomeSteps: {
                        categorize: {
                            title: 'Categorized Thinking',
                            desc: '6 category blocks help you organize different types of thoughts and ideas.'
                        },
                        richText: {
                            title: 'Rich Text Editing',
                            desc: 'Support bold, italic, lists and more formats to make your thoughts more organized.'
                        },
                        autoSave: {
                            title: 'Auto Save',
                            desc: '3-second auto save, data stored locally to protect your privacy.'
                        }
                    },
                    keyboardShortcuts: 'Keyboard Shortcuts',
                    startUsing: 'Start Using'
                }
            }
        };
    }
    
    /**
     * 检测浏览器语言
     */
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }
    
    /**
     * 获取存储的语言设置
     */
    getStoredLanguage() {
        return localStorage.getItem('thoughtkeeper_language');
    }
    
    /**
     * 设置语言
     */
    setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('thoughtkeeper_language', lang);
        this.updatePageLanguage();
    }
    
    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLang;
    }
    
    /**
     * 获取翻译文本
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (value && typeof value === 'object') {
                value = value[k];
            } else {
                break;
            }
        }
        
        return value || key;
    }
    
    /**
     * 更新页面语言
     */
    updatePageLanguage() {
        // 更新HTML lang属性
        document.documentElement.lang = this.currentLang;
        
        // 触发语言变化事件
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLang }
        }));
    }
    
    /**
     * 初始化语言
     */
    init() {
        this.updatePageLanguage();
    }
}

// 创建全局实例
window.i18n = new I18n();