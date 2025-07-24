/**
 * 主网格组件
 * 负责显示6个分类方块和处理点击事件
 */

class MainGrid {
    constructor(container, storage, navigation) {
        this.container = container;
        this.storage = storage;
        this.navigation = navigation;
        
        // 默认分类配置
        this.categories = [
            { id: 'todo-list', icon: '📋' },
            { id: 'reflection', icon: '🔄' },
            { id: 'creative-ideas', icon: '💡' },
            { id: 'philosophical-insights', icon: '🤔' },
            { id: 'literature-poetry', icon: '📝' },
            { id: 'principles-treasury', icon: '📖' }
        ];
    }
    
    /**
     * 渲染主网格
     */
    render() {
        // 如果网格已经存在，只更新内容而不重新创建
        let gridElement = this.container.querySelector('.category-grid');
        
        if (!gridElement) {
            // 首次创建网格
            this.container.innerHTML = '';
            gridElement = document.createElement('div');
            gridElement.className = 'category-grid';
            this.container.appendChild(gridElement);
            
            // 设置事件监听（只设置一次）
            this.setupEventListeners();
        }
        
        // 清空现有内容
        gridElement.innerHTML = '';
        
        // 使用文档片段优化DOM操作
        const fragment = document.createDocumentFragment();
        
        // 创建分类方块
        this.categories.forEach(category => {
            const categoryElement = this.createCategoryElement(category);
            fragment.appendChild(categoryElement);
        });
        
        // 一次性添加所有元素
        gridElement.appendChild(fragment);
    }
    
    /**
     * 创建分类方块元素
     */
    createCategoryElement(category) {
        const categoryData = this.storage.loadContent(category.id);
        const hasContent = categoryData.content && categoryData.content.trim().length > 0;
        
        const element = document.createElement('div');
        element.className = 'category-card';
        element.setAttribute('data-category-id', category.id);
        
        // 获取多语言文本
        const categoryInfo = window.i18n.t(`categories.${category.id}`);
        const title = categoryInfo.title || category.id;
        const description = categoryInfo.description || '';
        
        // 生成预览内容
        const preview = this.generatePreview(categoryData.content);
        
        element.innerHTML = `
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <h3 class="category-title">${title}</h3>
            </div>
            
            <div class="category-body">
                <p class="category-description">${description}</p>
                ${hasContent ? `
                    <div class="category-preview">
                        <div class="preview-content">${preview}</div>
                    </div>
                ` : ''}
            </div>
            
            <div class="category-footer">
                <div class="category-stats">
                    <span class="word-count">${categoryData.wordCount || 0} ${window.i18n.t('ui.wordCount')}</span>
                    ${categoryData.lastModified ? `
                        <span class="last-modified">${this.formatDate(categoryData.lastModified)}</span>
                    ` : ''}
                </div>
                ${hasContent ? '<div class="has-content-indicator">●</div>' : ''}
            </div>
        `;
        
        return element;
    }
    
    /**
     * 生成内容预览
     */
    generatePreview(content) {
        if (!content) return '';
        
        // 移除HTML标签，获取纯文本
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        
        // 截取前50个字符作为预览
        const maxLength = 50;
        if (textContent.length <= maxLength) {
            return textContent;
        }
        
        return textContent.substring(0, maxLength) + '...';
    }
    
    /**
     * 格式化日期
     */
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return '今天';
        } else if (diffDays === 1) {
            return '昨天';
        } else if (diffDays < 7) {
            return `${diffDays}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
    
    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 分类卡片点击事件
        this.container.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const categoryId = categoryCard.getAttribute('data-category-id');
                this.handleCategoryClick(categoryId);
            }
        });
        
        // 分类卡片悬停效果
        this.container.addEventListener('mouseenter', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                categoryCard.classList.add('hovered');
            }
        }, true);
        
        this.container.addEventListener('mouseleave', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                categoryCard.classList.remove('hovered');
            }
        }, true);
    }
    
    /**
     * 处理分类点击事件
     */
    handleCategoryClick(categoryId) {
        // 导航到编辑器页面
        this.navigation.navigateTo('editor', { categoryId });
    }
    
    /**
     * 获取分类标题
     */
    getCategoryTitle(categoryId) {
        const categoryInfo = window.i18n.t(`categories.${categoryId}`);
        return categoryInfo.title || categoryId;
    }
    
    /**
     * 获取分类信息
     */
    getCategoryInfo(categoryId) {
        return this.categories.find(cat => cat.id === categoryId) || null;
    }
    
    /**
     * 更新分类预览
     */
    updateCategoryPreview(categoryId, content) {
        const categoryCard = this.container.querySelector(`[data-category-id="${categoryId}"]`);
        if (!categoryCard) return;
        
        const categoryData = this.storage.loadContent(categoryId);
        const preview = this.generatePreview(content || categoryData.content);
        const hasContent = content && content.trim().length > 0;
        
        // 更新预览内容
        const previewElement = categoryCard.querySelector('.preview-content');
        if (previewElement) {
            previewElement.textContent = preview;
        } else if (hasContent) {
            // 如果之前没有预览，现在有内容了，需要重新渲染整个卡片
            const category = this.getCategoryInfo(categoryId);
            if (category) {
                const newElement = this.createCategoryElement(category);
                categoryCard.parentNode.replaceChild(newElement, categoryCard);
            }
        }
        
        // 更新统计信息
        const wordCountElement = categoryCard.querySelector('.word-count');
        if (wordCountElement) {
            wordCountElement.textContent = `${categoryData.wordCount || 0} 字`;
        }
        
        const lastModifiedElement = categoryCard.querySelector('.last-modified');
        if (lastModifiedElement && categoryData.lastModified) {
            lastModifiedElement.textContent = this.formatDate(categoryData.lastModified);
        }
        
        // 更新内容指示器
        const indicator = categoryCard.querySelector('.has-content-indicator');
        if (hasContent && !indicator) {
            const footer = categoryCard.querySelector('.category-footer');
            const newIndicator = document.createElement('div');
            newIndicator.className = 'has-content-indicator';
            newIndicator.textContent = '●';
            footer.appendChild(newIndicator);
        } else if (!hasContent && indicator) {
            indicator.remove();
        }
    }
    
    /**
     * 刷新所有分类显示
     */
    refresh() {
        this.render();
    }
}