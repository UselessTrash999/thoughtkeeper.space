/**
 * 编辑器组件
 * 负责文本编辑和格式化功能
 */

class Editor {
    constructor(container, storage, navigation) {
        this.container = container;
        this.storage = storage;
        this.navigation = navigation;
        this.currentCategoryId = null;
        this.autoSaveTimer = null;
        this.autoSaveInterval = 3000; // 3秒自动保存
        
        this.editorElement = null;
        this.toolbarElement = null;
        this.statusElement = null;
    }
    
    /**
     * 渲染编辑器
     */
    render(categoryId) {
        // 如果是同一个分类，只需要重新加载内容
        if (this.currentCategoryId === categoryId && this.editorElement) {
            this.loadContent();
            return;
        }
        
        this.currentCategoryId = categoryId;
        
        // 只有在必要时才重新创建DOM结构
        if (!this.editorElement || this.container.children.length === 0) {
            // 清空容器
            this.container.innerHTML = '';
            
            // 创建编辑器结构
            this.createEditorStructure();
            
            // 设置事件监听（只设置一次）
            this.setupEventListeners();
        }
        
        // 加载内容
        this.loadContent();
        
        // 延迟聚焦，避免阻塞UI
        requestAnimationFrame(() => {
            if (this.editorElement) {
                this.editorElement.focus();
            }
        });
    }
    
    /**
     * 创建编辑器结构
     */
    createEditorStructure() {
        // 创建工具栏
        this.toolbarElement = document.createElement('div');
        this.toolbarElement.className = 'editor-toolbar';
        this.toolbarElement.innerHTML = `
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="bold" data-i18n-title="ui.bold">
                    <strong>B</strong>
                </button>
                <button type="button" class="toolbar-btn" data-command="italic" data-i18n-title="ui.italic">
                    <em>I</em>
                </button>
                <button type="button" class="toolbar-btn" data-command="underline" data-i18n-title="ui.underline">
                    <u>U</u>
                </button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="insertUnorderedList" data-i18n-title="ui.unorderedList">
                    • <span data-i18n="ui.unorderedList">列表</span>
                </button>
                <button type="button" class="toolbar-btn" data-command="insertOrderedList" data-i18n-title="ui.orderedList">
                    1. <span data-i18n="ui.orderedList">列表</span>
                </button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="undo" data-i18n-title="ui.undo">
                    ↶ <span data-i18n="ui.undo">撤销</span>
                </button>
                <button type="button" class="toolbar-btn" data-command="redo" data-i18n-title="ui.redo">
                    ↷ <span data-i18n="ui.redo">重做</span>
                </button>
            </div>
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-command="removeFormat" data-i18n-title="ui.clearFormat">
                    <span data-i18n="ui.clearFormat">清除格式</span>
                </button>
            </div>
            <div class="toolbar-group">
                <span class="save-status" id="save-status" data-i18n="ui.saved">已保存</span>
            </div>
        `;
        
        // 创建编辑区域
        this.editorElement = document.createElement('div');
        this.editorElement.className = 'editor-content';
        this.editorElement.contentEditable = true;
        this.editorElement.setAttribute('data-placeholder', window.i18n.t('ui.placeholder'));
        
        // 创建状态栏
        this.statusElement = document.createElement('div');
        this.statusElement.className = 'editor-status';
        this.statusElement.innerHTML = `
            <div class="status-left">
                <span class="word-count"><span data-i18n="ui.wordCount">字数</span>: <span id="word-count">0</span></span>
                <span class="char-count"><span data-i18n="ui.charCount">字符</span>: <span id="char-count">0</span></span>
                <span class="line-count"><span data-i18n="ui.lineCount">行数</span>: <span id="line-count">1</span></span>
            </div>
            <div class="status-right">
                <span class="last-modified"><span data-i18n="ui.lastModified">最后修改</span>: <span id="last-modified" data-i18n="ui.never">从未</span></span>
            </div>
        `;
        
        // 添加到容器
        this.container.appendChild(this.toolbarElement);
        this.container.appendChild(this.editorElement);
        this.container.appendChild(this.statusElement);
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 工具栏按钮事件
        this.toolbarElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('toolbar-btn')) {
                e.preventDefault();
                const command = e.target.getAttribute('data-command');
                this.executeCommand(command);
            }
        });
        
        // 编辑器输入事件
        this.editorElement.addEventListener('input', () => {
            this.onContentChange();
        });
        
        // 编辑器键盘事件
        this.editorElement.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 编辑器粘贴事件
        this.editorElement.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
        
        // 选择变化事件 - 更新工具栏状态
        this.editorElement.addEventListener('mouseup', () => {
            this.updateToolbarState();
        });
        
        this.editorElement.addEventListener('keyup', () => {
            this.updateToolbarState();
        });
    }
    
    /**
     * 执行格式化命令
     */
    executeCommand(command) {
        document.execCommand(command, false, null);
        this.editorElement.focus();
        this.onContentChange();
        
        // 更新工具栏按钮状态
        this.updateToolbarState();
    }
    
    /**
     * 更新工具栏按钮状态
     */
    updateToolbarState() {
        const commands = ['bold', 'italic', 'underline'];
        
        commands.forEach(command => {
            const button = this.toolbarElement.querySelector(`[data-command="${command}"]`);
            if (button) {
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            }
        });
    }
    
    /**
     * 处理键盘事件
     */
    handleKeydown(e) {
        // Ctrl+B 加粗
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            this.executeCommand('bold');
        }
        
        // Ctrl+I 斜体
        if (e.ctrlKey && e.key === 'i') {
            e.preventDefault();
            this.executeCommand('italic');
        }
        
        // Ctrl+U 下划线
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            this.executeCommand('underline');
        }
        
        // Ctrl+S 手动保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveContent();
        }
        
        // Ctrl+Z 撤销
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.executeCommand('undo');
        }
        
        // Ctrl+Y 或 Ctrl+Shift+Z 重做
        if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            this.executeCommand('redo');
        }
        
        // Tab键处理 - 插入缩进而不是跳出编辑器
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    '); // 插入4个空格
        }
        
        // Enter键在列表中的特殊处理
        if (e.key === 'Enter') {
            // 让浏览器处理默认行为，但触发内容变化
            setTimeout(() => this.onContentChange(), 10);
        }
    }
    
    /**
     * 处理粘贴事件
     */
    handlePaste(e) {
        e.preventDefault();
        
        // 获取纯文本内容
        const text = (e.clipboardData || window.clipboardData).getData('text');
        
        // 插入纯文本
        document.execCommand('insertText', false, text);
        
        this.onContentChange();
    }
    
    /**
     * 内容变化处理（优化版本）
     */
    onContentChange() {
        // 使用防抖优化统计更新
        if (this.updateStatsTimer) {
            clearTimeout(this.updateStatsTimer);
        }
        
        this.updateStatsTimer = setTimeout(() => {
            this.updateWordCount();
        }, 100); // 100ms防抖
        
        // 立即更新保存状态
        this.updateSaveStatus('未保存');
        
        // 设置自动保存
        this.scheduleAutoSave();
    }
    
    /**
     * 更新字数统计
     */
    updateWordCount() {
        const content = this.getContent();
        const textContent = this.editorElement.textContent || '';
        
        // 字数统计
        const wordCount = this.storage.countWords(content);
        const wordCountElement = document.getElementById('word-count');
        if (wordCountElement) {
            wordCountElement.textContent = wordCount;
        }
        
        // 字符统计
        const charCount = textContent.length;
        const charCountElement = document.getElementById('char-count');
        if (charCountElement) {
            charCountElement.textContent = charCount;
        }
        
        // 行数统计
        const lineCount = textContent.split('\n').length;
        const lineCountElement = document.getElementById('line-count');
        if (lineCountElement) {
            lineCountElement.textContent = lineCount;
        }
    }
    
    /**
     * 更新保存状态
     */
    updateSaveStatus(status) {
        const saveStatusElement = document.getElementById('save-status');
        if (saveStatusElement) {
            saveStatusElement.textContent = status;
            
            let statusClass = 'saved';
            if (status === '未保存') {
                statusClass = 'unsaved';
            } else if (status === '保存中...') {
                statusClass = 'saving';
            } else if (status === '保存失败') {
                statusClass = 'error';
            }
            
            saveStatusElement.className = `save-status ${statusClass}`;
        }
    }
    
    /**
     * 计划自动保存（防抖优化）
     */
    scheduleAutoSave() {
        // 清除之前的定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // 设置新的定时器，使用防抖减少保存频率
        this.autoSaveTimer = setTimeout(() => {
            this.saveContent();
        }, this.autoSaveInterval);
    }
    
    /**
     * 获取编辑器内容
     */
    getContent() {
        return this.editorElement ? this.editorElement.innerHTML : '';
    }
    
    /**
     * 设置编辑器内容
     */
    setContent(content) {
        if (this.editorElement) {
            this.editorElement.innerHTML = content || '';
            this.updateWordCount();
        }
    }
    
    /**
     * 加载内容
     */
    loadContent() {
        if (!this.currentCategoryId) return;
        
        const categoryData = this.storage.loadContent(this.currentCategoryId);
        this.setContent(categoryData.content);
        
        // 更新最后修改时间
        this.updateLastModified(categoryData.lastModified);
        
        // 设置保存状态
        this.updateSaveStatus('已保存');
    }
    
    /**
     * 保存内容（异步版本）
     */
    async saveContent() {
        if (!this.currentCategoryId) return false;
        
        try {
            this.updateSaveStatus('保存中...');
            
            const content = this.getContent();
            
            // 使用带重试的保存方法
            const data = this.storage.getData();
            data.categories[this.currentCategoryId] = {
                content: content,
                lastModified: new Date().toISOString(),
                wordCount: this.storage.countWords(content)
            };
            
            const success = await this.storage.saveWithRetry(data);
            
            if (success) {
                this.updateSaveStatus('已保存');
                this.updateLastModified(new Date().toISOString());
                
                // 更新主界面的预览
                if (window.app && window.app.mainGrid) {
                    window.app.mainGrid.updateCategoryPreview(this.currentCategoryId, content);
                }
                
                // 清除自动保存定时器
                if (this.autoSaveTimer) {
                    clearTimeout(this.autoSaveTimer);
                    this.autoSaveTimer = null;
                }
            } else {
                this.updateSaveStatus('保存失败');
                // 如果保存失败，重新安排自动保存
                this.scheduleAutoSave();
            }
            
            return success;
        } catch (error) {
            console.error('保存内容时发生错误:', error);
            this.updateSaveStatus('保存失败');
            
            // 保存失败时重新安排自动保存
            this.scheduleAutoSave();
            return false;
        }
    }
    
    /**
     * 更新最后修改时间
     */
    updateLastModified(timestamp) {
        const lastModifiedElement = document.getElementById('last-modified');
        if (lastModifiedElement && timestamp) {
            const date = new Date(timestamp);
            const formatted = date.toLocaleString('zh-CN');
            lastModifiedElement.textContent = formatted;
        }
    }
    
    /**
     * 清空编辑器
     */
    clear() {
        this.setContent('');
        this.updateSaveStatus('已保存');
    }
    
    /**
     * 销毁编辑器
     */
    destroy() {
        // 保存当前内容
        this.saveContent();
        
        // 清除定时器
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        // 清空容器
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // 重置状态
        this.currentCategoryId = null;
        this.editorElement = null;
        this.toolbarElement = null;
        this.statusElement = null;
    }
}