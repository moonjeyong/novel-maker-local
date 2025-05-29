'use client';

import { useState } from 'react';
import { Term, useProjectStore } from '@/store/useProjectStore';

interface TermEditorProps {
  projectId: string;
  terms: Term[];
}

export default function TermEditor({ projectId, terms }: TermEditorProps) {
  const { addTerm, updateTerm, deleteTerm } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTerm, setNewTerm] = useState({
    term: '',
    definition: '',
    category: '',
    relatedTerms: [] as string[],
  });

  const handleAddTerm = () => {
    if (newTerm.term.trim() && newTerm.definition.trim()) {
      addTerm(projectId, newTerm);
      setNewTerm({
        term: '',
        definition: '',
        category: '',
        relatedTerms: [],
      });
      setIsAdding(false);
    }
  };

  const handleUpdateTerm = (termId: string, data: Partial<Term>) => {
    updateTerm(projectId, termId, data);
    setEditingId(null);
  };

  const handleDeleteTerm = (termId: string) => {
    if (confirm('이 용어를 삭제하시겠습니까?')) {
      deleteTerm(projectId, termId);
    }
  };

  // 필터링된 용어 목록
  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(terms.map(term => term.category).filter(Boolean)));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">용어 사전</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          용어 추가
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="용어 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Term Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                용어
              </label>
              <input
                type="text"
                value={newTerm.term}
                onChange={(e) => setNewTerm({ ...newTerm, term: e.target.value })}
                placeholder="용어를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <input
                type="text"
                value={newTerm.category}
                onChange={(e) => setNewTerm({ ...newTerm, category: e.target.value })}
                placeholder="카테고리 (선택사항)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              정의
            </label>
            <textarea
              value={newTerm.definition}
              onChange={(e) => setNewTerm({ ...newTerm, definition: e.target.value })}
              placeholder="용어의 정의를 상세히 작성해주세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddTerm}
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

      {/* Terms List */}
      <div className="space-y-3">
        {filteredTerms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedCategory ? '검색 결과가 없습니다.' : '아직 등록된 용어가 없습니다.'}
          </div>
        ) : (
          filteredTerms.map((term) => (
            <TermCard
              key={term.id}
              term={term}
              isEditing={editingId === term.id}
              onEdit={() => setEditingId(term.id)}
              onSave={(data) => handleUpdateTerm(term.id, data)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteTerm(term.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TermCardProps {
  term: Term;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Term>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function TermCard({
  term,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: TermCardProps) {
  const [editData, setEditData] = useState({
    term: term.term,
    definition: term.definition,
    category: term.category || '',
    relatedTerms: term.relatedTerms || [],
  });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              용어
            </label>
            <input
              type="text"
              value={editData.term}
              onChange={(e) => setEditData({ ...editData, term: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            정의
          </label>
          <textarea
            value={editData.definition}
            onChange={(e) => setEditData({ ...editData, definition: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            <h4 className="font-medium text-gray-900 text-lg">{term.term}</h4>
            {term.category && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                {term.category}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{term.definition}</p>
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-blue-600"
            title="편집"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
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