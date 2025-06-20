class NotesApp {
    constructor() {
        this.currentNote = null;
        this.currentNoteTags = [];
        this.notes = [];
        this.filteredNotes = [];
        this.currentFilter = 'all';
        this.currentTag = null;
        this.searchKeyword = '';
        this.tagsSearchKeyword = '';
        this.allTags = [];
        this.filteredTags = [];
        this.isAutoSaving = false;
        this.hasUnsavedChanges = false;
        this.pendingAction = null; // 存储待执行的操作
        this.userChooseNotSave = false; // 用户是否选择了不保存
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadNotes();
        this.loadTags();
        this.loadStats();
        this.initAutoSave();
        this.initStatusBar();
        this.hideEditor(); // 确保编辑器初始时是隐藏的
    }
    
    bindEvents() {
        // 新建笔记
        document.getElementById('newNoteBtn').addEventListener('click', () => {
            this.createNewNote();
        });
        
        // 欢迎界面的新建按钮
        const welcomeNewBtn = document.getElementById('welcomeNewBtn');
        if (welcomeNewBtn) {
            welcomeNewBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }
        
        // 搜索
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        
        searchInput.addEventListener('input', this.debounce((e) => {
            this.searchKeyword = e.target.value;
            this.filterNotes();
            
            // 显示/隐藏清除按钮
            if (e.target.value.length > 0) {
                searchClear.style.display = 'flex';
            } else {
                searchClear.style.display = 'none';
            }
        }, 300));
        
        // 清除搜索
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.searchKeyword = '';
            this.filterNotes();
            searchClear.style.display = 'none';
            searchInput.focus();
        });
        
        // 标签搜索
        const tagsSearchInput = document.getElementById('tagsSearchInput');
        const tagsSearchClear = document.getElementById('tagsSearchClear');
        const tagsSearchToggle = document.getElementById('tagsSearchToggle');
        const tagsSearchContainer = document.getElementById('tagsSearchContainer');
        const tagsSearchClose = document.getElementById('tagsSearchClose');
        
        // 搜索框切换功能
        if (tagsSearchToggle && tagsSearchContainer) {
            tagsSearchToggle.addEventListener('click', () => {
                if (!tagsSearchContainer.classList.contains('show')) {
                    tagsSearchContainer.classList.add('show');
                    tagsSearchContainer.classList.remove('hide');
                    setTimeout(() => {
                        if (tagsSearchInput) {
                            tagsSearchInput.focus();
                        }
                        // 重新检测滚动状态
                        this.checkTagsScrollable();
                    }, 100);
                }
            });
        }
        
        // 关闭搜索框
        if (tagsSearchClose && tagsSearchContainer) {
            tagsSearchClose.addEventListener('click', () => {
                tagsSearchContainer.classList.add('hide');
                tagsSearchContainer.classList.remove('show');
                // 清空搜索内容
                if (tagsSearchInput) {
                    tagsSearchInput.value = '';
                    tagsSearchClear.style.display = 'none';
                    this.tagsSearchKeyword = '';
                    this.filterTags();
                }
                // 重新检测滚动状态
                setTimeout(() => {
                    this.checkTagsScrollable();
                }, 300);
            });
        }
        
        if (tagsSearchInput) {
            tagsSearchInput.addEventListener('input', this.debounce((e) => {
                this.tagsSearchKeyword = e.target.value;
                this.filterTags();
                
                // 显示/隐藏清除按钮
                if (e.target.value.length > 0) {
                    tagsSearchClear.style.display = 'flex';
                } else {
                    tagsSearchClear.style.display = 'none';
                }
            }, 200));
            
            // ESC键关闭搜索框
            tagsSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (tagsSearchClose) {
                        tagsSearchClose.click();
                    }
                }
            });
        }
        
        // 清除标签搜索
        if (tagsSearchClear) {
            tagsSearchClear.addEventListener('click', () => {
                tagsSearchInput.value = '';
                this.tagsSearchKeyword = '';
                this.filterTags();
                tagsSearchClear.style.display = 'none';
                tagsSearchInput.focus();
            });
        }
        
        // 筛选
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.setFilter(e.target.dataset.filter);
            });
        });
        
        // 排序
        document.querySelectorAll('[data-sort]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.sortNotes(e.target.dataset.sort);
            });
        });
        
        // 编辑器事件
        document.getElementById('noteTitle').addEventListener('input', (e) => {
            this.markAsUnsaved();
            this.updateEditorStats();
            this.updateTitleIndicator(e.target.value.length > 0);
        });
        
        document.getElementById('noteContent').addEventListener('input', () => {
            this.markAsUnsaved();
            this.updateEditorStats();
        });
        
        // 标签输入框不再需要input事件监听，因为现在使用按钮添加标签
        // document.getElementById('noteTags').addEventListener('input', (e) => {
        //     this.markAsUnsaved();
        // });
        
        // 添加标签按钮
        document.getElementById('addTagBtn').addEventListener('click', () => {
            this.addTag();
        });
        
        // 标签输入框支持回车键
        document.getElementById('noteTags').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });
        
        // 新编辑器工具按钮
        const lineNumberBtn = document.getElementById('lineNumberBtn');
        const wordWrapBtn = document.getElementById('wordWrapBtn');
        
        if (lineNumberBtn) {
            lineNumberBtn.addEventListener('click', () => {
                this.toggleLineNumbers();
            });
        }
        
        if (wordWrapBtn) {
            wordWrapBtn.addEventListener('click', () => {
                this.toggleWordWrap();
            });
        }
        
        // 输入状态指示器 (新编辑器设计中暂时移除)
        
        // 工具栏按钮
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveCurrentNote();
        });
        
        document.getElementById('deleteBtn').addEventListener('click', () => {
            this.showDeleteConfirm();
        });
        
        document.getElementById('favoriteBtn').addEventListener('click', () => {
            this.toggleFavorite();
        });
        

        
        // 快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }
        });
    }
    
    async loadNotes() {
        try {
            const response = await fetch('/api/notes');
            const data = await response.json();
            this.notes = data.notes || [];
            this.filteredNotes = [...this.notes];
            this.renderNotesList();
        } catch (error) {
            this.showStatus('加载笔记失败', 'error');
        }
    }
    
    async loadTags() {
        try {
            const response = await fetch('/api/notes/tags');
            const tags = await response.json();
            this.allTags = tags;
            this.filteredTags = [...tags];
            this.renderTagsList(this.filteredTags);
        } catch (error) {
            console.error('加载标签失败:', error);
        }
    }
    
    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            // 更新数字并添加动画
            this.updateBadgeWithAnimation('totalCount', stats.total_notes);
            this.updateBadgeWithAnimation('favoriteCount', stats.favorite_notes);
        } catch (error) {
            console.error('加载统计失败:', error);
        }
    }
    
    updateBadgeWithAnimation(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            const currentValue = parseInt(element.textContent) || 0;
            if (currentValue !== newValue) {
                element.classList.add('updated');
                element.textContent = newValue;
                
                // 移除动画类
                setTimeout(() => {
                    element.classList.remove('updated');
                }, 600);
            }
        }
    }
    
    renderNotesList() {
        const container = document.getElementById('notesList');
        
        if (this.filteredNotes.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-sticky-note fa-3x mb-3"></i>
                    <p>暂无笔记，点击"新建笔记"开始记录吧！</p>
                </div>
            `;
            return;
        }
        
        const notesHtml = this.filteredNotes.map(note => {
            const preview = note.content ? 
                note.content.substring(0, 100).replace(/\n/g, ' ') : '无内容';
            const tags = note.tags || [];
            
            // 标签显示逻辑：最多显示4个标签，超出显示提醒
            const maxVisibleTags = 4;
            const visibleTags = tags.slice(0, maxVisibleTags);
            const hiddenTagsCount = Math.max(0, tags.length - maxVisibleTags);
            
            let tagsHtml = visibleTags.map(tag => 
                `<span class="note-tag">${tag}</span>`
            ).join('');
            
            // 如果有隐藏的标签，添加提醒
            if (hiddenTagsCount > 0) {
                const hiddenTags = tags.slice(maxVisibleTags);
                const hiddenTagsText = hiddenTags.join(', ');
                tagsHtml += `<span class="note-tag-more" title="隐藏的标签: ${hiddenTagsText}">+${hiddenTagsCount}</span>`;
            }
            
            return `
                <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}" 
                     data-note-id="${note.id}">
                    <div class="note-title">
                        ${note.title || '无标题'}
                        ${note.is_favorite ? '<i class="fas fa-star text-warning ms-1"></i>' : ''}
                    </div>
                    <div class="note-preview">${preview}</div>
                    <div class="note-tags">${tagsHtml}</div>
                    <div class="note-meta">
                        <span>${this.formatDate(note.updated_at)}</span>
                        <span>${note.content ? note.content.length : 0} 字</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = notesHtml;
        
        // 绑定点击事件
        container.querySelectorAll('.note-item').forEach(item => {
            item.addEventListener('click', () => {
                const noteId = parseInt(item.dataset.noteId);
                
                // 检查是否点击的是当前已选中的笔记
                const isCurrentlyActive = item.classList.contains('active');
                const isEditorVisible = document.getElementById('editorMain').style.display !== 'none';
                
                if (isCurrentlyActive && isEditorVisible) {
                    // 如果点击的是当前笔记且编辑器正在显示，则返回介绍页面
                    // 但是要检查是否有未保存的修改
                    if (this.hasUnsavedChanges) {
                        this.pendingAction = () => this.doHideEditor();
                        this.showSaveConfirmModal();
                        return;
                    }
                    this.doHideEditor();
                    return;
                } else if (isCurrentlyActive && !isEditorVisible) {
                    // 如果点击的是当前笔记但编辑器未显示，则显示编辑器
                    this.showEditor();
                    return;
                }
                
                // 保存当前选中的笔记ID，以便取消时恢复
                this.previousNoteId = this.currentNote ? this.currentNote.id : null;
                
                // 立即更新选中状态的视觉效果
                document.querySelectorAll('.note-item').forEach(noteItem => {
                    noteItem.classList.remove('active');
                });
                item.classList.add('active');
                
                this.loadNote(noteId);
            });
        });
    }
    
    filterTags() {
        if (!this.tagsSearchKeyword.trim()) {
            this.filteredTags = [...this.allTags];
        } else {
            const keyword = this.tagsSearchKeyword.toLowerCase();
            this.filteredTags = this.allTags.filter(tag => 
                tag.toLowerCase().includes(keyword)
            );
        }
        this.renderTagsList(this.filteredTags);
    }
    
    renderTagsList(tags) {
        const container = document.getElementById('tagsList');
        const tagsCount = document.getElementById('tagsCount');
        const noResults = document.getElementById('tagsNoResults');
        const tagsContent = document.querySelector('.tags-content');
        
        // 更新标签计数 (显示总数，不是过滤后的数量)
        if (tagsCount) {
            tagsCount.textContent = this.allTags.length;
        }
        
        // 隐藏无结果提示
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        if (this.allTags.length === 0) {
            container.innerHTML = `
                <div class="no-tags">
                    <i class="fas fa-tag"></i>
                    <span>暂无标签</span>
                </div>
            `;
            if (tagsContent) tagsContent.classList.remove('scrollable');
            return;
        }
        
        if (tags.length === 0 && this.tagsSearchKeyword.trim()) {
            // 搜索无结果
            container.innerHTML = '';
            if (noResults) {
                noResults.style.display = 'flex';
            }
            if (tagsContent) tagsContent.classList.remove('scrollable');
            return;
        }
        
        const tagsHtml = tags.map(tag => `
            <span class="tag-badge ${this.currentTag === tag ? 'active' : ''}" 
                  data-tag="${tag}">
                <i class="fas fa-tag"></i>
                <span class="tag-text">${tag}</span>
            </span>
        `).join('');
        
        container.innerHTML = tagsHtml;
        
        // 检查是否需要滚动
        setTimeout(() => {
            this.checkTagsScrollable();
        }, 100);
        
        // 绑定标签点击事件
        container.querySelectorAll('.tag-badge').forEach(badge => {
            badge.addEventListener('click', () => {
                const tag = badge.dataset.tag;
                this.filterByTag(tag);
            });
        });
    }
    
    async loadNote(noteId) {
        // 检查是否有未保存的修改
        if (this.hasUnsavedChanges && this.currentNote && this.currentNote.id !== noteId) {
            this.pendingAction = () => this.doLoadNote(noteId);
            this.showSaveConfirmModal();
            return;
        }
        
        this.doLoadNote(noteId);
    }
    
    async doLoadNote(noteId) {
        try {
            const response = await fetch(`/api/notes/${noteId}`);
            const note = await response.json();
            
            this.currentNote = note;
            this.showEditor();
            this.fillEditor(note);
            this.updateActiveNote();
            this.updateWordCount();
        } catch (error) {
            this.showStatus('加载笔记失败', 'error');
        }
    }
    
    showEditor() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('editorMain').style.display = 'flex';
    }
    
    hideEditor() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('editorMain').style.display = 'none';
    }
    
    doHideEditor() {
        this.hideEditor();
        this.currentNote = null;
        // 移除所有笔记的高亮效果
        document.querySelectorAll('.note-item').forEach(noteItem => {
            noteItem.classList.remove('active');
        });
    }
    
    fillEditor(note) {
        document.getElementById('noteTitle').value = note.title || '';
        document.getElementById('noteContent').value = note.content || '';
        document.getElementById('noteTags').value = '';
        
        // 更新收藏按钮状态
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (note.is_favorite) {
            favoriteBtn.classList.add('active');
        } else {
            favoriteBtn.classList.remove('active');
        }
        
        // 初始化当前笔记的标签数组
        this.currentNoteTags = note.tags || [];
        
        // 更新新编辑器的状态
        this.updateEditorStats();
        this.updateTitleIndicator((note.title || '').length > 0);
        this.updateTagsPreview();
        
        // 如果行号功能开启，更新行号
        if (document.querySelector('.line-numbers')) {
            this.updateLineNumbers();
        }
        
        // 更新最后保存时间
        const lastSavedTime = document.getElementById('lastSavedTime');
        if (lastSavedTime && note.updated_at) {
            lastSavedTime.textContent = this.formatDate(note.updated_at);
        }
        
        this.markAsSaved();
    }
    
    async createNewNote() {
        // 检查是否有未保存的修改
        if (this.hasUnsavedChanges && this.currentNote) {
            this.pendingAction = () => this.doCreateNewNote();
            this.showSaveConfirmModal();
            return;
        }
        
        this.doCreateNewNote();
    }
    
    async doCreateNewNote() {
        const newNote = {
            title: '新建笔记',
            content: '',
            tags: [],
            is_favorite: false
        };
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newNote)
            });
            
            const note = await response.json();
            this.currentNote = note;
            this.currentNoteTags = [];
            this.notes.unshift(note);
            this.filterNotes();
            this.showEditor();
            this.fillEditor(note);
            
            // 聚焦到标题输入框
            document.getElementById('noteTitle').focus();
            document.getElementById('noteTitle').select();
            
            this.loadStats();
            this.showStatus('新建笔记成功', 'success');
        } catch (error) {
            this.showStatus('创建笔记失败', 'error');
        }
    }
    
    async saveCurrentNote() {
        if (!this.currentNote) {
            this.showStatus('没有可保存的笔记', 'warning');
            return;
        }
        
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const tags = this.currentNoteTags || [];
        
        const updatedNote = {
            title: title || '无标题',
            content: content,
            tags: tags,
            is_favorite: this.currentNote.is_favorite
        };
        
        try {
            const response = await fetch(`/api/notes/${this.currentNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedNote)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const note = await response.json();
            this.currentNote = note;
            this.currentNoteTags = note.tags || [];
            
            // 更新笔记列表中的数据
            const index = this.notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                this.notes[index] = note;
                this.filterNotes();
            }
            
            // 显示成功提示
            this.showSuccessBubble('保存成功', 'save');
            
            this.markAsSaved();
            this.loadTags();
            
        } catch (error) {
            console.error('保存失败:', error);
            this.showStatus('保存失败', 'error');
        }
    }
    
    async deleteCurrentNote() {
        if (!this.currentNote) return;
        
        try {
            await fetch(`/api/notes/${this.currentNote.id}`, {
                method: 'DELETE'
            });
            
            // 从列表中移除
            this.notes = this.notes.filter(n => n.id !== this.currentNote.id);
            this.filterNotes();
            
            // 隐藏编辑器并清除当前笔记
            this.hideEditor();
            this.currentNote = null;
            // 清除所有笔记的选中状态
            document.querySelectorAll('.note-item').forEach(item => {
                item.classList.remove('active');
            });
            
            this.loadStats();
            this.loadTags();
            this.showStatus('删除成功', 'success');
        } catch (error) {
            this.showStatus('删除失败', 'error');
        }
    }
    
    showDeleteConfirm() {
        const modal = document.getElementById('deleteModal');
        const noteTitle = document.getElementById('deleteNoteTitle');
        
        // 设置要删除的笔记标题
        if (this.currentNote && this.currentNote.title) {
            noteTitle.textContent = this.currentNote.title;
        } else {
            noteTitle.textContent = '无标题笔记';
        }
        
        // 显示模态框
        modal.style.display = 'flex';
        
        // 绑定事件处理器
        const cancelHandler = () => {
            this.hideDeleteModal();
        };
        
        const confirmHandler = async () => {
            this.hideDeleteModal();
            await this.deleteCurrentNote();
        };
        
        const overlayHandler = (e) => {
            if (e.target === modal) {
                this.hideDeleteModal();
            }
        };
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideDeleteModal();
            }
        };
        
        // 绑定事件
        document.getElementById('cancelDeleteBtn').addEventListener('click', cancelHandler);
        document.getElementById('confirmDeleteBtn').addEventListener('click', confirmHandler);
        modal.addEventListener('click', overlayHandler);
        document.addEventListener('keydown', escHandler);
        
        // 保存事件处理器引用以便后续清理
        modal._handlers = {
            cancel: cancelHandler,
            confirm: confirmHandler,
            overlay: overlayHandler,
            escape: escHandler
        };
    }
    
    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.style.display = 'none';
        
        // 清理事件监听器
        if (modal._handlers) {
            document.getElementById('cancelDeleteBtn').removeEventListener('click', modal._handlers.cancel);
            document.getElementById('confirmDeleteBtn').removeEventListener('click', modal._handlers.confirm);
            modal.removeEventListener('click', modal._handlers.overlay);
            document.removeEventListener('keydown', modal._handlers.escape);
            delete modal._handlers;
        }
    }
    
    async toggleFavorite() {
        if (!this.currentNote) return;
        
        const favoriteBtn = document.getElementById('favoriteBtn');
        
        this.currentNote.is_favorite = !this.currentNote.is_favorite;
        
        const updatedNote = {
            title: document.getElementById('noteTitle').value || '无标题',
            content: document.getElementById('noteContent').value,
            tags: this.currentNoteTags || [],
            is_favorite: this.currentNote.is_favorite
        };
        
        try {
            const response = await fetch(`/api/notes/${this.currentNote.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedNote)
            });
            
            const note = await response.json();
            this.currentNote = note;
            this.currentNoteTags = note.tags || [];
            
            // 更新按钮状态
            if (note.is_favorite) {
                favoriteBtn.classList.add('active');
                this.showSuccessBubble('已收藏', 'favorite');
            } else {
                favoriteBtn.classList.remove('active');
                this.showSuccessBubble('取消收藏', 'unfavorite');
            }
            
            // 更新列表
            const index = this.notes.findIndex(n => n.id === note.id);
            if (index !== -1) {
                this.notes[index] = note;
                this.filterNotes();
            }
            
            this.loadStats();
            
        } catch (error) {
            this.showStatus('操作失败', 'error');
        }
    }
    
    filterNotes() {
        let filtered = [...this.notes];
        
        // 按筛选条件过滤
        if (this.currentFilter === 'favorite') {
            filtered = filtered.filter(note => note.is_favorite);
        }
        
        // 按标签过滤
        if (this.currentTag) {
            filtered = filtered.filter(note => 
                note.tags && note.tags.includes(this.currentTag)
            );
        }
        
        // 按搜索关键词过滤
        if (this.searchKeyword) {
            filtered = filtered.filter(note =>
                (note.title && note.title.toLowerCase().includes(this.searchKeyword.toLowerCase())) ||
                (note.content && note.content.toLowerCase().includes(this.searchKeyword.toLowerCase()))
            );
        }
        
        this.filteredNotes = filtered;
        this.renderNotesList();
        
        // 检查当前选中的笔记是否还在过滤结果中
        if (this.currentNote) {
            const currentNoteInFiltered = this.filteredNotes.find(note => note.id === this.currentNote.id);
            if (!currentNoteInFiltered) {
                // 如果当前笔记不在过滤结果中，返回欢迎页面
                this.hideEditor();
                this.currentNote = null;
                // 清除所有笔记的选中状态
                document.querySelectorAll('.note-item').forEach(noteItem => {
                    noteItem.classList.remove('active');
                });
            }
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.currentTag = null; // 清除标签筛选
        
        // 更新UI状态
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.classList.toggle('active', item.dataset.filter === filter);
        });
        
        document.querySelectorAll('.tag-badge').forEach(badge => {
            badge.classList.remove('active');
        });
        
        this.filterNotes();
    }
    
    filterByTag(tag) {
        this.currentTag = this.currentTag === tag ? null : tag;
        this.currentFilter = 'all'; // 重置过滤条件
        
        // 更新UI状态
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.classList.toggle('active', item.dataset.filter === 'all');
        });
        
        document.querySelectorAll('.tag-badge').forEach(badge => {
            badge.classList.toggle('active', badge.dataset.tag === this.currentTag);
        });
        
        this.filterNotes();
    }
    
    sortNotes(sortBy) {
        switch (sortBy) {
            case 'updated':
                this.notes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                break;
            case 'created':
                this.notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'title':
                this.notes.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
        }
        
        this.filterNotes();
    }
    
    updateActiveNote() {
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.toggle('active', 
                parseInt(item.dataset.noteId) === (this.currentNote ? this.currentNote.id : -1)
            );
        });
    }
    
    markAsUnsaved() {
        this.hasUnsavedChanges = true;
        this.userChooseNotSave = false; // 重置"不保存"标记，用户开始新的编辑
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.textContent = '未保存';
        saveStatus.className = 'save-status unsaved';
    }
    
    markAsSaved() {
        this.hasUnsavedChanges = false;
        this.userChooseNotSave = false; // 重置"不保存"标记
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.textContent = '已保存';
        saveStatus.className = 'save-status saved';
        
        // 3秒后恢复默认状态
        setTimeout(() => {
            if (saveStatus.className === 'save-status saved') {
                saveStatus.textContent = '已同步';
                saveStatus.className = 'save-status';
            }
        }, 3000);
    }
    
    updateWordCount() {
        // 保留原有方法以兼容性
        this.updateEditorStats();
    }
    
    updateEditorStats() {
        const content = document.getElementById('noteContent').value;
        const title = document.getElementById('noteTitle').value;
        
        // 计算统计信息
        const charCount = content.length;
        const lineCount = content.split('\n').length;
        
        // 更新统计显示
        const charCountEl = document.getElementById('charCount');
        const lineCountEl = document.getElementById('lineCount');
        
        if (charCountEl) charCountEl.textContent = charCount;
        if (lineCountEl) lineCountEl.textContent = lineCount;
    }
    
    updateTitleIndicator(hasContent) {
        const indicator = document.getElementById('titleIndicator');
        if (indicator) {
            if (hasContent) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        }
    }
    
    updateTagsPreview() {
        const preview = document.getElementById('tagsPreview');
        if (!preview) return;
        
        // 清空现有预览
        preview.innerHTML = '';
        
        if (this.currentNoteTags && this.currentNoteTags.length > 0) {
            this.currentNoteTags.forEach(tag => {
                const tagEl = document.createElement('span');
                tagEl.className = 'tag-preview-item';
                tagEl.innerHTML = `
                    <span class="tag-text">${tag}</span>
                    <button class="remove-tag-btn" onclick="notesApp.removeTag('${tag}')" title="删除标签">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                preview.appendChild(tagEl);
            });
        }
    }
    
    addTag() {
        const tagsInput = document.getElementById('noteTags');
        const tagText = tagsInput.value.trim();
        
        if (!tagText) {
            this.showStatus('请输入标签名称', 'warning');
            return;
        }
        
        if (this.currentNoteTags.includes(tagText)) {
            this.showStatus('标签已存在', 'warning');
            tagsInput.value = '';
            return;
        }
        
        this.currentNoteTags.push(tagText);
        tagsInput.value = '';
        this.updateTagsPreview();
        this.markAsUnsaved();
        this.showStatus('标签添加成功', 'success');
    }
    
    removeTag(tagToRemove) {
        this.showTagDeleteModal(tagToRemove);
    }
    
    showTagDeleteModal(tagName) {
        const modal = document.getElementById('tagDeleteModal');
        const tagNameElement = document.getElementById('tagToDelete');
        
        // 设置要删除的标签名称
        tagNameElement.textContent = `"${tagName}"`;
        
        // 显示弹窗
        modal.style.display = 'flex';
        
        // 绑定事件（先移除旧的事件监听器避免重复绑定）
        const cancelBtn = document.getElementById('cancelTagDelete');
        const confirmBtn = document.getElementById('confirmTagDelete');
        const overlay = modal.querySelector('.custom-modal-overlay');
        
        // 取消删除
        const cancelHandler = () => {
            this.hideTagDeleteModal();
        };
        
        // 确认删除
        const confirmHandler = () => {
            this.currentNoteTags = this.currentNoteTags.filter(tag => tag !== tagName);
            this.updateTagsPreview();
            this.markAsUnsaved();
            this.showStatus('标签删除成功', 'success');
            this.hideTagDeleteModal();
        };
        
        // 点击遮罩层关闭
        const overlayHandler = (e) => {
            if (e.target === overlay) {
                this.hideTagDeleteModal();
            }
        };
        
        // 移除旧的事件监听器
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        overlay.replaceWith(overlay.cloneNode(true));
        
        // 重新获取元素并添加事件监听器
        const newCancelBtn = document.getElementById('cancelTagDelete');
        const newConfirmBtn = document.getElementById('confirmTagDelete');
        const newOverlay = modal.querySelector('.custom-modal-overlay');
        
        newCancelBtn.addEventListener('click', cancelHandler);
        newConfirmBtn.addEventListener('click', confirmHandler);
        newOverlay.addEventListener('click', overlayHandler);
        
        // ESC键关闭弹窗
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.hideTagDeleteModal();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    hideTagDeleteModal() {
        const modal = document.getElementById('tagDeleteModal');
        modal.style.display = 'none';
    }
    
    showSaveConfirmModal() {
        const modal = document.getElementById('saveConfirmModal');
        modal.style.display = 'flex';
        
        // 绑定事件
        const dontSaveBtn = document.getElementById('dontSaveBtn');
        const cancelSaveBtn = document.getElementById('cancelSaveBtn');
        const saveAndContinueBtn = document.getElementById('saveAndContinueBtn');
        const overlay = modal.querySelector('.custom-modal-overlay');
        
        // 不保存，直接执行待处理的操作
        const dontSaveHandler = () => {
            this.hasUnsavedChanges = false;
            this.userChooseNotSave = true; // 标记用户选择了不保存
            // 重置保存状态，防止自动保存
            this.markAsSaved();
            this.hideSaveConfirmModal();
            if (this.pendingAction) {
                this.pendingAction();
                this.pendingAction = null;
            }
            // 清除保存的前一个笔记ID
            this.previousNoteId = null;
        };
        
        // 取消操作
        const cancelHandler = () => {
            this.hideSaveConfirmModal();
            this.pendingAction = null;
            // 恢复原来的高亮状态
            this.restorePreviousHighlight();
        };
        
        // 保存并继续
        const saveAndContinueHandler = async () => {
            await this.saveCurrentNote();
            this.hideSaveConfirmModal();
            if (this.pendingAction) {
                this.pendingAction();
                this.pendingAction = null;
            }
            // 清除保存的前一个笔记ID
            this.previousNoteId = null;
        };
        
        // 点击遮罩层关闭
        const overlayHandler = (e) => {
            if (e.target === overlay) {
                cancelHandler();
            }
        };
        
        // 移除旧的事件监听器
        dontSaveBtn.replaceWith(dontSaveBtn.cloneNode(true));
        cancelSaveBtn.replaceWith(cancelSaveBtn.cloneNode(true));
        saveAndContinueBtn.replaceWith(saveAndContinueBtn.cloneNode(true));
        overlay.replaceWith(overlay.cloneNode(true));
        
        // 重新获取元素并添加事件监听器
        const newDontSaveBtn = document.getElementById('dontSaveBtn');
        const newCancelSaveBtn = document.getElementById('cancelSaveBtn');
        const newSaveAndContinueBtn = document.getElementById('saveAndContinueBtn');
        const newOverlay = modal.querySelector('.custom-modal-overlay');
        
        newDontSaveBtn.addEventListener('click', dontSaveHandler);
        newCancelSaveBtn.addEventListener('click', cancelHandler);
        newSaveAndContinueBtn.addEventListener('click', saveAndContinueHandler);
        newOverlay.addEventListener('click', overlayHandler);
        
        // ESC键关闭弹窗
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                cancelHandler();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    hideSaveConfirmModal() {
        const modal = document.getElementById('saveConfirmModal');
        modal.style.display = 'none';
    }
    
    restorePreviousHighlight() {
        // 清除所有高亮
        document.querySelectorAll('.note-item').forEach(noteItem => {
            noteItem.classList.remove('active');
        });
        
        // 恢复到原来选中的笔记
        if (this.previousNoteId && this.currentNote && this.currentNote.id === this.previousNoteId) {
            // 如果原来就是当前笔记，恢复高亮
            const originalItem = document.querySelector(`[data-note-id="${this.previousNoteId}"]`);
            if (originalItem) {
                originalItem.classList.add('active');
            }
        } else if (this.currentNote) {
            // 如果当前有笔记，高亮当前笔记
            const currentItem = document.querySelector(`[data-note-id="${this.currentNote.id}"]`);
            if (currentItem) {
                currentItem.classList.add('active');
            }
        }
        
        // 清除保存的前一个笔记ID
        this.previousNoteId = null;
    }
    
    toggleFullscreen() {
        const editorArea = document.querySelector('.editor-area');
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        
        if (!document.fullscreenElement) {
            editorArea.requestFullscreen().then(() => {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                fullscreenBtn.title = '退出全屏';
            });
        } else {
            document.exitFullscreen().then(() => {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                fullscreenBtn.title = '全屏编辑';
            });
        }
    }
    
    toggleWordWrap() {
        const textarea = document.getElementById('noteContent');
        const wordWrapBtn = document.getElementById('wordWrapBtn');
        
        if (wordWrapBtn.dataset.active === 'true') {
            textarea.style.whiteSpace = 'nowrap';
            textarea.style.overflowX = 'auto';
            wordWrapBtn.dataset.active = 'false';
            wordWrapBtn.innerHTML = '<i class="fas fa-align-left"></i>';
            wordWrapBtn.title = '启用自动换行';
        } else {
            textarea.style.whiteSpace = 'pre-wrap';
            textarea.style.overflowX = 'hidden';
            wordWrapBtn.dataset.active = 'true';
            wordWrapBtn.innerHTML = '<i class="fas fa-align-justify"></i>';
            wordWrapBtn.title = '禁用自动换行';
        }
    }
    
    toggleFocusMode() {
        const editorMain = document.querySelector('.editor-main');
        const focusModeBtn = document.getElementById('focusModeBtn');
        
        if (editorMain && editorMain.classList.contains('focus-mode')) {
            editorMain.classList.remove('focus-mode');
            focusModeBtn.dataset.active = 'false';
            focusModeBtn.innerHTML = '<i class="fas fa-eye"></i>';
            focusModeBtn.title = '专注模式';
        } else if (editorMain) {
            editorMain.classList.add('focus-mode');
            focusModeBtn.dataset.active = 'true';
            focusModeBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
            focusModeBtn.title = '退出专注模式';
        }
    }
    
    toggleLineNumbers() {
        const textarea = document.getElementById('noteContent');
        const contentEditor = document.querySelector('.content-editor');
        const lineNumberBtn = document.getElementById('lineNumberBtn');
        
        if (textarea && textarea.classList.contains('show-line-numbers')) {
            textarea.classList.remove('show-line-numbers');
            contentEditor.classList.remove('show-line-numbers');
            this.removeLineNumbers();
            lineNumberBtn.dataset.active = 'false';
            lineNumberBtn.title = '显示行号';
        } else if (textarea) {
            textarea.classList.add('show-line-numbers');
            contentEditor.classList.add('show-line-numbers');
            this.createLineNumbers();
            lineNumberBtn.dataset.active = 'true';
            lineNumberBtn.title = '隐藏行号';
        }
    }
    
    createLineNumbers() {
        this.removeLineNumbers(); // 先移除已存在的行号
        
        const contentEditor = document.querySelector('.content-editor');
        const textarea = document.getElementById('noteContent');
        
        if (!textarea) return;
        
        const lineNumbersDiv = document.createElement('div');
        lineNumbersDiv.className = 'line-numbers';
        
        contentEditor.appendChild(lineNumbersDiv);
        
        // 更新行号
        this.updateLineNumbers();
        
        // 移除可能存在的旧事件监听器
        if (this.lineNumberInputHandler) {
            textarea.removeEventListener('input', this.lineNumberInputHandler);
        }
        if (this.lineNumberScrollHandler) {
            textarea.removeEventListener('scroll', this.lineNumberScrollHandler);
        }
        
        // 创建新的事件处理器
        this.lineNumberInputHandler = () => {
            this.updateLineNumbers();
        };
        
        this.lineNumberScrollHandler = () => {
            const lineNumbers = document.querySelector('.line-numbers');
            if (lineNumbers) {
                lineNumbers.scrollTop = textarea.scrollTop;
            }
        };
        
        // 添加事件监听器
        textarea.addEventListener('input', this.lineNumberInputHandler);
        textarea.addEventListener('scroll', this.lineNumberScrollHandler);
    }
    
    updateLineNumbers() {
        const textarea = document.getElementById('noteContent');
        const lineNumbers = document.querySelector('.line-numbers');
        
        if (!textarea || !lineNumbers) return;
        
        // 计算实际行数
        const content = textarea.value;
        const lines = content ? content.split('\n') : [''];
        const lineCount = Math.max(lines.length, 1);
        
        // 清空现有行号
        lineNumbers.innerHTML = '';
        
        // 创建对应数量的行号
        for (let i = 1; i <= lineCount; i++) {
            const lineDiv = document.createElement('div');
            lineDiv.textContent = i;
            lineNumbers.appendChild(lineDiv);
        }
    }
    
    removeLineNumbers() {
        const existingLineNumbers = document.querySelector('.line-numbers');
        if (existingLineNumbers) {
            existingLineNumbers.remove();
        }
        
        // 清理事件监听器
        const textarea = document.getElementById('noteContent');
        if (textarea) {
            if (this.lineNumberInputHandler) {
                textarea.removeEventListener('input', this.lineNumberInputHandler);
                this.lineNumberInputHandler = null;
            }
            if (this.lineNumberScrollHandler) {
                textarea.removeEventListener('scroll', this.lineNumberScrollHandler);
                this.lineNumberScrollHandler = null;
            }
        }
    }
    
    initAutoSave() {
        // 每30秒自动保存
        setInterval(() => {
            if (this.currentNote && 
                document.getElementById('saveStatus').textContent === '未保存' &&
                !this.userChooseNotSave) { // 只有在用户没有选择"不保存"时才自动保存
                this.saveCurrentNote();
            }
        }, 30000);
    }
    
    initStatusBar() {
        this.updateCurrentTime();
        // 每秒更新时间
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        const currentTimeElement = document.getElementById('currentTime');
        if (currentTimeElement) {
            currentTimeElement.textContent = timeString;
        }
    }
    

    
    showStatus(message, type = 'info') {
        const statusText = document.querySelector('.status-text');
        if (statusText) {
        statusText.textContent = message;
            statusText.className = `status-text text-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
        
        // 3秒后重置状态
        setTimeout(() => {
                statusText.textContent = '系统运行正常';
                statusText.className = 'status-text';
        }, 3000);
        } else {
            // 如果找不到状态文本元素，使用console输出
            console.log(`状态: ${message} (${type})`);
        }
    }
    
    formatDate(dateString) {
        // 解析时间字符串，确保使用正确的时区
        const date = new Date(dateString);
        const now = new Date();
        
        // 计算时间差
        const diff = now - date;
        
        if (diff < 60000) { // 1分钟内
            return '刚刚';
        } else if (diff < 3600000) { // 1小时内
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) { // 24小时内
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            // 显示完整的日期和时间
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    checkTagsScrollable() {
        const tagsContent = document.querySelector('.tags-content');
        if (tagsContent) {
            if (tagsContent.scrollHeight > tagsContent.clientHeight) {
                tagsContent.classList.add('scrollable');
            } else {
                tagsContent.classList.remove('scrollable');
            }
        }
    }
    

    
    // 显示成功提示气泡
    showSuccessBubble(message, type) {
        // 移除现有的气泡
        const existingBubble = document.querySelector('.success-bubble');
        if (existingBubble) {
            existingBubble.remove();
        }
        
        const bubble = document.createElement('div');
        bubble.className = `success-bubble ${type}`;
        
        const icon = type === 'save' ? '💾' : 
                    type === 'favorite' ? '⭐' : '✓';
        
        bubble.innerHTML = `
            <i>${icon}</i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(bubble);
        
        // 自动移除气泡
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
        }, 3000);
    }
}

// 初始化应用
let notesApp;
document.addEventListener('DOMContentLoaded', () => {
    notesApp = new NotesApp();
});