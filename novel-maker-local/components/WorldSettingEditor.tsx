'use client';

import { useState } from 'react';
import { WorldSetting, useProjectStore } from '@/store/useProjectStore';

interface WorldSettingEditorProps {
  projectId: string;
  worldSettings: WorldSetting[];
}

const CATEGORY_OPTIONS = [
  { value: 'background', label: '배경', description: '작품의 전반적인 배경 설정' },
  { value: 'era', label: '시대', description: '시간적 배경과 시대적 특징' },
  { value: 'region', label: '지역', description: '지리적 배경과 장소 설정' },
  { value: 'culture', label: '문화', description: '사회 문화와 관습' },
  { value: 'politics', label: '정치', description: '정치 체제와 권력 구조' },
  { value: 'economy', label: '경제', description: '경제 시스템과 화폐' },
  { value: 'other', label: '기타', description: '기타 설정' }
];

export default function WorldSettingEditor({ projectId, worldSettings }: WorldSettingEditorProps) {
  const { addWorldSetting, updateWorldSetting, deleteWorldSetting } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWorldSetting, setNewWorldSetting] = useState({
    category: 'background' as const,
    title: '',
    content: '',
  });

  // 안전한 배열 확보
  const safeWorldSettings = Array.isArray(worldSettings) ? worldSettings : [];

  const handleAddWorldSetting = () => {
    if (newWorldSetting.title.trim() && newWorldSetting.content.trim()) {
      addWorldSetting(projectId, newWorldSetting);
      setNewWorldSetting({
        category: 'background',
        title: '',
        content: '',
      });
      setIsAdding(false);
    }
  };

  const handleUpdateWorldSetting = (worldSettingId: string, data: Partial<WorldSetting>) => {
    updateWorldSetting(projectId, worldSettingId, data);
    setEditingId(null);
  };

  const handleDeleteWorldSetting = (worldSettingId: string) => {
    if (confirm('이 세계관 설정을 삭제하시겠습니까?')) {
      deleteWorldSetting(projectId, worldSettingId);
    }
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      background: 'bg-blue-100 text-blue-800',
      era: 'bg-purple-100 text-purple-800',
      region: 'bg-green-100 text-green-800',
      culture: 'bg-yellow-100 text-yellow-800',
      politics: 'bg-red-100 text-red-800',
      economy: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">세계관 설정</h3>
      </div>

      {/* WorldSettings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Add Button Card */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-gray-400 transition-colors min-h-[200px]">
          {isAdding ? (
            <WorldSettingForm
              worldSetting={newWorldSetting}
              onChange={setNewWorldSetting}
              onSave={handleAddWorldSetting}
              onCancel={() => setIsAdding(false)}
              title="새 세계관 설정 추가"
              isCompact={true}
            />
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">세계관 설정 추가</span>
            </button>
          )}
        </div>

        {/* Existing WorldSettings */}
        {safeWorldSettings.map((worldSetting) => (
          <div key={worldSetting.id}>
            {editingId === worldSetting.id ? (
              <WorldSettingForm
                worldSetting={worldSetting}
                onChange={() => {}} // Not used in edit mode
                onSave={(data) => handleUpdateWorldSetting(worldSetting.id, data)}
                onCancel={() => setEditingId(null)}
                title="세계관 설정 편집"
                isEditing={true}
                worldSettingId={worldSetting.id}
                isCompact={true}
              />
            ) : (
              <WorldSettingDisplayCard
                worldSetting={worldSetting}
                onEdit={() => setEditingId(worldSetting.id)}
                onDelete={() => handleDeleteWorldSetting(worldSetting.id)}
                getCategoryLabel={getCategoryLabel}
                getCategoryColor={getCategoryColor}
              />
            )}
          </div>
        ))}

        {safeWorldSettings.length === 0 && !isAdding && (
          <div className="col-span-full text-center py-8 text-gray-500">
            세계관 설정을 추가해보세요.
          </div>
        )}
      </div>
    </div>
  );
}

interface WorldSettingFormProps {
  worldSetting: any;
  onChange: (data: any) => void;
  onSave: (data?: any) => void;
  onCancel: () => void;
  title: string;
  isEditing?: boolean;
  worldSettingId?: string;
  isCompact?: boolean;
}

function WorldSettingForm({
  worldSetting,
  onChange,
  onSave,
  onCancel,
  title,
  isEditing = false,
  worldSettingId,
  isCompact = false,
}: WorldSettingFormProps) {
  const [editData, setEditData] = useState(worldSetting);

  const handleSave = () => {
    if (isEditing) {
      onSave(editData);
    } else {
      onChange(editData);
      onSave();
    }
  };

  const containerClass = isCompact 
    ? "bg-white p-4 rounded-lg border border-blue-200 h-full"
    : "bg-gray-50 p-6 rounded-lg border";

  return (
    <div className={containerClass}>
      {!isCompact && <h4 className="text-lg font-medium mb-4">{title}</h4>}
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리
          </label>
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            placeholder="설정 제목"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            내용
          </label>
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            placeholder="세계관 설정 내용"
            rows={isCompact ? 3 : 4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEditing ? '저장' : '추가'}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

interface WorldSettingDisplayCardProps {
  worldSetting: WorldSetting;
  onEdit: () => void;
  onDelete: () => void;
  getCategoryLabel: (category: string) => string;
  getCategoryColor: (category: string) => string;
}

function WorldSettingDisplayCard({
  worldSetting,
  onEdit,
  onDelete,
  getCategoryLabel,
  getCategoryColor,
}: WorldSettingDisplayCardProps) {
  return (
    <div className="bg-white rounded-lg border hover:border-gray-300 transition-colors overflow-hidden h-fit min-h-[200px] relative">
      {/* Edit/Delete Buttons */}
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={onEdit}
          className="p-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100 text-gray-600 hover:text-blue-600"
          title="편집"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-1 bg-white bg-opacity-80 rounded hover:bg-opacity-100 text-gray-600 hover:text-red-600"
          title="삭제"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(worldSetting.category)}`}>
          {getCategoryLabel(worldSetting.category)}
        </span>
        <h4 className="font-semibold text-gray-900 text-lg mt-2">{worldSetting.title}</h4>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 text-sm whitespace-pre-wrap overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 6,
          WebkitBoxOrient: 'vertical',
          maxHeight: '9rem'
        }}>{worldSetting.content}</p>
      </div>
    </div>
  );
}