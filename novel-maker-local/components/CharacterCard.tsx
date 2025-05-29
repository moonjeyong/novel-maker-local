'use client';

import { useState, useRef } from 'react';
import { Character, useProjectStore, MBTI_OPTIONS } from '@/store/useProjectStore';
import Image from 'next/image';

interface CharacterCardProps {
  projectId: string;
  characters: Character[];
}

export default function CharacterCard({ projectId, characters }: CharacterCardProps) {
  const { addCharacter, updateCharacter, deleteCharacter } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCharacter, setNewCharacter] = useState({
    name: '',
    age: '',
    occupation: '',
    personality: '',
    family: '',
    notes: '',
    appearance: '',
    mbti: '',
    bloodType: '',
    image: '',
  });

  const handleAddCharacter = () => {
    if (newCharacter.name.trim()) {
      addCharacter(projectId, newCharacter);
      setNewCharacter({
        name: '',
        age: '',
        occupation: '',
        personality: '',
        family: '',
        notes: '',
        appearance: '',
        mbti: '',
        bloodType: '',
        image: '',
      });
      setIsAdding(false);
    }
  };

  const handleUpdateCharacter = (characterId: string, data: Partial<Character>) => {
    updateCharacter(projectId, characterId, data);
    setEditingId(null);
  };

  const handleDeleteCharacter = (characterId: string) => {
    if (confirm('이 등장인물을 삭제하시겠습니까?')) {
      deleteCharacter(projectId, characterId);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false, characterId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          if (isEdit && characterId) {
            handleUpdateCharacter(characterId, { image: imageData });
          } else {
            setNewCharacter({ ...newCharacter, image: imageData });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">등장인물</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          등장인물 추가
        </button>
      </div>

      {/* Add New Character Form */}
      {isAdding && (
        <CharacterForm
          character={newCharacter}
          onChange={setNewCharacter}
          onSave={handleAddCharacter}
          onCancel={() => setIsAdding(false)}
          onImageUpload={(e) => handleImageUpload(e)}
          title="새 등장인물 추가"
        />
      )}

      {/* Characters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            아직 등록된 등장인물이 없습니다.
          </div>
        ) : (
          characters.map((character) => (
            <div key={character.id}>
              {editingId === character.id ? (
                <CharacterForm
                  character={character}
                  onChange={(data) => {
                    // This is a bit hacky, but works for editing
                    const updatedCharacter = { ...character, ...data };
                    setEditingId(character.id); // Keep editing state
                  }}
                  onSave={(data) => handleUpdateCharacter(character.id, data)}
                  onCancel={() => setEditingId(null)}
                  onImageUpload={(e) => handleImageUpload(e, true, character.id)}
                  title="등장인물 편집"
                  isEditing={true}
                  characterId={character.id}
                />
              ) : (
                <CharacterDisplayCard
                  character={character}
                  onEdit={() => setEditingId(character.id)}
                  onDelete={() => handleDeleteCharacter(character.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface CharacterFormProps {
  character: any;
  onChange: (data: any) => void;
  onSave: (data?: any) => void;
  onCancel: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title: string;
  isEditing?: boolean;
  characterId?: string;
}

function CharacterForm({
  character,
  onChange,
  onSave,
  onCancel,
  onImageUpload,
  title,
  isEditing = false,
  characterId,
}: CharacterFormProps) {
  const [editData, setEditData] = useState(character);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(e);
    }
  };

  const handleSave = () => {
    if (isEditing) {
      onSave(editData);
    } else {
      onChange(editData);
      onSave();
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h4 className="text-lg font-medium mb-4">{title}</h4>
      
      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          캐릭터 이미지
        </label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
            {editData.image ? (
              <Image
                src={editData.image}
                alt="Character"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              이미지 선택
            </button>
            {editData.image && (
              <button
                type="button"
                onClick={() => setEditData({ ...editData, image: '' })}
                className="ml-2 px-3 py-2 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm hover:bg-red-200"
              >
                제거
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이름 *
          </label>
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="캐릭터 이름"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            나이
          </label>
          <input
            type="text"
            value={editData.age}
            onChange={(e) => setEditData({ ...editData, age: e.target.value })}
            placeholder="예: 25세, 20대 초반"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            직업
          </label>
          <input
            type="text"
            value={editData.occupation}
            onChange={(e) => setEditData({ ...editData, occupation: e.target.value })}
            placeholder="직업 또는 역할"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            MBTI
          </label>
          <select
            value={editData.mbti}
            onChange={(e) => setEditData({ ...editData, mbti: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">MBTI 선택</option>
            {MBTI_OPTIONS.map((mbti) => (
              <option key={mbti} value={mbti}>
                {mbti}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            혈액형
          </label>
          <select
            value={editData.bloodType}
            onChange={(e) => setEditData({ ...editData, bloodType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">혈액형 선택</option>
            <option value="A">A형</option>
            <option value="B">B형</option>
            <option value="AB">AB형</option>
            <option value="O">O형</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            가족관계
          </label>
          <input
            type="text"
            value={editData.family}
            onChange={(e) => setEditData({ ...editData, family: e.target.value })}
            placeholder="예: 부모님, 형제자매"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          성격
        </label>
        <textarea
          value={editData.personality}
          onChange={(e) => setEditData({ ...editData, personality: e.target.value })}
          placeholder="성격, 특징, 말투 등"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          외모
        </label>
        <textarea
          value={editData.appearance}
          onChange={(e) => setEditData({ ...editData, appearance: e.target.value })}
          placeholder="키, 체형, 머리색, 눈색 등"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          특이사항
        </label>
        <textarea
          value={editData.notes}
          onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
          placeholder="배경 스토리, 특별한 능력, 기타 메모"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isEditing ? '저장' : '추가'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

interface CharacterDisplayCardProps {
  character: Character;
  onEdit: () => void;
  onDelete: () => void;
}

function CharacterDisplayCard({ character, onEdit, onDelete }: CharacterDisplayCardProps) {
  return (
    <div className="bg-white rounded-lg border hover:border-gray-300 transition-colors overflow-hidden">
      {/* Character Image */}
      <div className="relative h-48 bg-gray-200">
        {character.image ? (
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        
        {/* Action buttons */}
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
      </div>

      {/* Character Info */}
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{character.name}</h4>
        
        <div className="space-y-2 text-sm">
          {character.age && (
            <div className="flex justify-between">
              <span className="text-gray-500">나이:</span>
              <span className="text-gray-900">{character.age}</span>
            </div>
          )}
          {character.occupation && (
            <div className="flex justify-between">
              <span className="text-gray-500">직업:</span>
              <span className="text-gray-900">{character.occupation}</span>
            </div>
          )}
          {character.mbti && (
            <div className="flex justify-between">
              <span className="text-gray-500">MBTI:</span>
              <span className="text-gray-900">{character.mbti}</span>
            </div>
          )}
          {character.bloodType && (
            <div className="flex justify-between">
              <span className="text-gray-500">혈액형:</span>
              <span className="text-gray-900">{character.bloodType}형</span>
            </div>
          )}
        </div>

        {character.personality && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">성격</p>
            <p className="text-sm text-gray-700 line-clamp-2">{character.personality}</p>
          </div>
        )}

        {character.appearance && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">외모</p>
            <p className="text-sm text-gray-700 line-clamp-2">{character.appearance}</p>
          </div>
        )}
      </div>
    </div>
  );
} 