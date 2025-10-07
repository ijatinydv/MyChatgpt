import React, { useState } from 'react';
import './ChatSidebar.css';
import ConfirmDialog from './ConfirmDialog';


const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onRenameChat, onDeleteChat, open }) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const handleStartEdit = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat._id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId, e) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat?.(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleDelete = (chatId, e) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat?.(chatToDelete);
    }
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setChatToDelete(null);
  };

  
  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <div
            key={c._id}
            className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
            onClick={() => editingId !== c._id && onSelectChat(c._id)}
          >
            {editingId === c._id ? (
              <div className="edit-mode" onClick={e => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveEdit(c._id, e);
                    if (e.key === 'Escape') handleCancelEdit(e);
                  }}
                  autoFocus
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button onClick={e => handleSaveEdit(c._id, e)} title="Save">✓</button>
                  <button onClick={handleCancelEdit} title="Cancel">✕</button>
                </div>
              </div>
            ) : (
              <>
                <span className="title-line">{c.title}</span>
                <div className="chat-actions">
                  <button 
                    onClick={e => handleStartEdit(c, e)} 
                    title="Rename"
                    className="action-btn"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={e => handleDelete(c._id, e)} 
                    title="Delete"
                    className="action-btn delete-btn"
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet. Click "New" to start!</p>}
      </nav>
      
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete chat?"
        message="This will permanently delete this chat and all its messages. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </aside>
  );
};

export default ChatSidebar;
