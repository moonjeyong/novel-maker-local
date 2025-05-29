'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Memo, useProjectStore } from '@/store/useProjectStore';

interface MemoEditorProps {
  projectId: string;
  memos: Memo[];
}

export default function MemoEditor({ projectId, memos }: MemoEditorProps) {
  const { addMemo, updateMemo, deleteMemo } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMemo, setNewMemo] = useState({
    title: '',
    content: '',
  });

  const handleAddMemo = () => {
    if (newMemo.title.trim()) {
      addMemo(projectId, newMemo);
      setNewMemo({
        title: '',
        content: '',
      });
      setIsAdding(false);
    }
  };

  const handleUpdateMemo = (memoId: string, data: Partial<Memo>) => {
    updateMemo(projectId, memoId, data);
    setEditingId(null);
  };

  const handleDeleteMemo = (memoId: string) => {
    if (confirm('이 메모를 삭제하시겠습니까?')) {
      deleteMemo(projectId, memoId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">자유 메모</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          메모 추가
        </button>
      </div>

      {/* Add New Memo Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                value={newMemo.title}
                onChange={(e) => setNewMemo({ ...newMemo, title: e.target.value })}
                placeholder="메모 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                내용 (마크다운 지원)
              </label>
              <textarea
                value={newMemo.content}
                onChange={(e) => setNewMemo({ ...newMemo, content: e.target.value })}
                placeholder="메모 내용을 마크다운으로 작성하세요..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddMemo}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              추가
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Memos List */}
      <div className="space-y-3">
        {memos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 등록된 메모가 없습니다.
          </div>
        ) : (
          memos.map((memo, index) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              index={index}
              isEditing={editingId === memo.id}
              onEdit={() => setEditingId(memo.id)}
              onSave={(data) => handleUpdateMemo(memo.id, data)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteMemo(memo.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface MemoCardProps {
  memo: Memo;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Memo>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function MemoCard({
  memo,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: MemoCardProps) {
  const [editData, setEditData] = useState({
    title: memo.title,
    content: memo.content,
  });
  const [isPreview, setIsPreview] = useState(false);

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              내용 (마크다운 지원)
            </label>
            <textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">{memo.title}</h4>
            <span className="text-xs text-gray-500">
              {new Date(memo.updatedAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
          
          {/* Content Preview/Full */}
          <div className="mb-3">
            {isPreview ? (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{memo.content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-600 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                {memo.content || '내용이 없습니다.'}
              </div>
            )}
          </div>
          
          {/* Toggle Preview Button */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              {isPreview ? '원본 보기' : '미리보기'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="편집"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* Delete button */}
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600"
            title="삭제"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 