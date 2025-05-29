'use client';

import { useState } from 'react';
import { Item, Character, useProjectStore } from '@/store/useProjectStore';

interface ItemEditorProps {
  projectId: string;
  items: Item[];
  characters: Character[];
}

const TYPE_OPTIONS = [
  { value: 'weapon', label: '무기', icon: '⚔️' },
  { value: 'armor', label: '방어구', icon: '🛡️' },
  { value: 'accessory', label: '장신구', icon: '💍' },
  { value: 'consumable', label: '소모품', icon: '🧪' },
  { value: 'magic', label: '마법', icon: '✨' },
  { value: 'skill', label: '스킬', icon: '🎯' },
  { value: 'other', label: '기타', icon: '📦' }
];

const RARITY_OPTIONS = [
  { value: 'common', label: '일반', color: 'bg-gray-100 text-gray-800' },
  { value: 'uncommon', label: '고급', color: 'bg-green-100 text-green-800' },
  { value: 'rare', label: '희귀', color: 'bg-blue-100 text-blue-800' },
  { value: 'epic', label: '영웅', color: 'bg-purple-100 text-purple-800' },
  { value: 'legendary', label: '전설', color: 'bg-yellow-100 text-yellow-800' }
];

export default function ItemEditor({ projectId, items, characters }: ItemEditorProps) {
  const { addItem, updateItem, deleteItem } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterRarity, setFilterRarity] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    type: 'weapon' as const,
    description: '',
    effects: '',
    rarity: 'common' as const,
    owner: '',
  });

  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.description.trim()) {
      addItem(projectId, {
        ...newItem,
        owner: newItem.owner || undefined
      });
      setNewItem({
        name: '',
        type: 'weapon',
        description: '',
        effects: '',
        rarity: 'common',
        owner: '',
      });
      setIsAdding(false);
    }
  };

  const handleUpdateItem = (itemId: string, data: Partial<Item>) => {
    updateItem(projectId, itemId, data);
    setEditingId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('이 아이템을 삭제하시겠습니까?')) {
      deleteItem(projectId, itemId);
    }
  };

  // 필터링된 아이템 목록
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || item.type === filterType;
    const matchesRarity = !filterRarity || item.rarity === filterRarity;
    const matchesOwner = !filterOwner || item.owner === filterOwner;
    return matchesSearch && matchesType && matchesRarity && matchesOwner;
  });

  const getTypeOption = (type: string) => {
    return TYPE_OPTIONS.find(opt => opt.value === type) || TYPE_OPTIONS[0];
  };

  const getRarityOption = (rarity: string) => {
    return RARITY_OPTIONS.find(opt => opt.value === rarity) || RARITY_OPTIONS[0];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">아이템/마법</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          아이템 추가
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <input
            type="text"
            placeholder="아이템 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 타입</option>
            {TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 등급</option>
            {RARITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 소유자</option>
            <option value="none">소유자 없음</option>
            {characters.map(character => (
              <option key={character.id} value={character.id}>{character.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Item Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                아이템명
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="아이템명을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                타입
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                등급
              </label>
              <select
                value={newItem.rarity}
                onChange={(e) => setNewItem({ ...newItem, rarity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RARITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="아이템 설명을 작성해주세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                효과
              </label>
              <textarea
                value={newItem.effects}
                onChange={(e) => setNewItem({ ...newItem, effects: e.target.value })}
                placeholder="아이템의 효과나 능력을 작성해주세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소유자
            </label>
            <select
              value={newItem.owner}
              onChange={(e) => setNewItem({ ...newItem, owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">소유자 없음</option>
              {characters.map(character => (
                <option key={character.id} value={character.id}>{character.name}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddItem}
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

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm || filterType || filterRarity || filterOwner ? '검색 결과가 없습니다.' : '아직 등록된 아이템이 없습니다.'}
          </div>
        ) : (
          filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              characters={characters}
              isEditing={editingId === item.id}
              onEdit={() => setEditingId(item.id)}
              onSave={(data) => handleUpdateItem(item.id, data)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteItem(item.id)}
              getTypeOption={getTypeOption}
              getRarityOption={getRarityOption}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface ItemCardProps {
  item: Item;
  characters: Character[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Item>) => void;
  onCancel: () => void;
  onDelete: () => void;
  getTypeOption: (type: string) => { value: string; label: string; icon: string };
  getRarityOption: (rarity: string) => { value: string; label: string; color: string };
}

function ItemCard({
  item,
  characters,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  getTypeOption,
  getRarityOption,
}: ItemCardProps) {
  const [editData, setEditData] = useState({
    name: item.name,
    type: item.type,
    description: item.description,
    effects: item.effects || '',
    rarity: item.rarity || 'common',
    owner: item.owner || '',
  });

  const handleSave = () => {
    onSave({
      ...editData,
      owner: editData.owner || undefined
    });
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이템명
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                타입
              </label>
              <select
                value={editData.type}
                onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                등급
              </label>
              <select
                value={editData.rarity}
                onChange={(e) => setEditData({ ...editData, rarity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RARITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              효과
            </label>
            <textarea
              value={editData.effects}
              onChange={(e) => setEditData({ ...editData, effects: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              소유자
            </label>
            <select
              value={editData.owner}
              onChange={(e) => setEditData({ ...editData, owner: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">소유자 없음</option>
              {characters.map(character => (
                <option key={character.id} value={character.id}>{character.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
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
      </div>
    );
  }

  const typeOption = getTypeOption(item.type);
  const rarityOption = getRarityOption(item.rarity || 'common');
  const owner = item.owner ? characters.find(c => c.id === item.owner) : null;

  return (
    <div className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeOption.icon}</span>
          <h4 className="font-medium text-gray-900">{item.name}</h4>
        </div>
        <div className="flex items-center gap-1">
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
      
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
          {typeOption.label}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${rarityOption.color}`}>
          {rarityOption.label}
        </span>
        {owner && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
            {owner.name}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-2 whitespace-pre-wrap">{item.description}</p>
      
      {item.effects && (
        <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
          <span className="font-medium text-yellow-800">효과: </span>
          <span className="text-yellow-700">{item.effects}</span>
        </div>
      )}
    </div>
  );
} 