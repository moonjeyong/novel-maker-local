'use client';

import { useState } from 'react';
import { Event, Character, Episode, useProjectStore } from '@/store/useProjectStore';

interface EventEditorProps {
  projectId: string;
  events: Event[];
  characters: Character[];
  episodes: Episode[];
}

const IMPORTANCE_OPTIONS = [
  { value: 'low', label: '낮음', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: '보통', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: '높음', color: 'bg-red-100 text-red-800' }
];

export default function EventEditor({ projectId, events, characters, episodes }: EventEditorProps) {
  const { addEvent, updateEvent, deleteEvent } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'created'>('date');
  const [filterImportance, setFilterImportance] = useState('');
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    importance: 'medium' as const,
    relatedCharacters: [] as string[],
    relatedEpisodes: [] as string[],
  });

  const handleAddEvent = () => {
    if (newEvent.title.trim() && newEvent.description.trim()) {
      addEvent(projectId, newEvent);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        importance: 'medium',
        relatedCharacters: [],
        relatedEpisodes: [],
      });
      setIsAdding(false);
    }
  };

  const handleUpdateEvent = (eventId: string, data: Partial<Event>) => {
    updateEvent(projectId, eventId, data);
    setEditingId(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('이 사건을 삭제하시겠습니까?')) {
      deleteEvent(projectId, eventId);
    }
  };

  // 필터링 및 정렬된 사건 목록
  const filteredAndSortedEvents = events
    .filter(event => !filterImportance || event.importance === filterImportance)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return a.date.localeCompare(b.date);
        case 'importance':
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importance] - importanceOrder[a.importance];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getImportanceOption = (importance: string) => {
    return IMPORTANCE_OPTIONS.find(opt => opt.value === importance) || IMPORTANCE_OPTIONS[1];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">사건 연표</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          사건 추가
        </button>
      </div>

      {/* Sort and Filter */}
      <div className="flex gap-4">
        <div className="w-48">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">날짜순</option>
            <option value="importance">중요도순</option>
            <option value="created">생성일순</option>
          </select>
        </div>
        <div className="w-48">
          <select
            value={filterImportance}
            onChange={(e) => setFilterImportance(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">모든 중요도</option>
            {IMPORTANCE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add New Event Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                사건 제목
              </label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="사건 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                날짜 (작품 내)
              </label>
              <input
                type="text"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                placeholder="예: 1년차 봄, 2023년 3월"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                중요도
              </label>
              <select
                value={newEvent.importance}
                onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {IMPORTANCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사건 설명
            </label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="사건의 상세 내용을 작성해주세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 관련 인물 선택 */}
          {characters.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관련 인물
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {characters.map(character => (
                  <label key={character.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEvent.relatedCharacters.includes(character.id)}
                      onChange={(e) => {
                        setNewEvent({
                          ...newEvent,
                          relatedCharacters: e.target.checked
                            ? [...newEvent.relatedCharacters, character.id]
                            : newEvent.relatedCharacters.filter(id => id !== character.id)
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{character.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {/* 관련 회차 선택 */}
          {episodes.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                관련 회차
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {episodes.map(episode => (
                  <label key={episode.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEvent.relatedEpisodes.includes(episode.id)}
                      onChange={(e) => {
                        setNewEvent({
                          ...newEvent,
                          relatedEpisodes: e.target.checked
                            ? [...newEvent.relatedEpisodes, episode.id]
                            : newEvent.relatedEpisodes.filter(id => id !== episode.id)
                        });
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{episode.number}화. {episode.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddEvent}
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

      {/* Events List */}
      <div className="space-y-3">
        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {filterImportance ? '해당 중요도의 사건이 없습니다.' : '아직 등록된 사건이 없습니다.'}
          </div>
        ) : (
          filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              characters={characters}
              episodes={episodes}
              isEditing={editingId === event.id}
              onEdit={() => setEditingId(event.id)}
              onSave={(data) => handleUpdateEvent(event.id, data)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteEvent(event.id)}
              getImportanceOption={getImportanceOption}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  characters: Character[];
  episodes: Episode[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Event>) => void;
  onCancel: () => void;
  onDelete: () => void;
  getImportanceOption: (importance: string) => { value: string; label: string; color: string };
}

function EventCard({
  event,
  characters,
  episodes,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  getImportanceOption,
}: EventCardProps) {
  const [editData, setEditData] = useState({
    title: event.title,
    description: event.description,
    date: event.date || '',
    importance: event.importance,
    relatedCharacters: event.relatedCharacters || [],
    relatedEpisodes: event.relatedEpisodes || [],
  });

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사건 제목
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
              날짜 (작품 내)
            </label>
            <input
              type="text"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              중요도
            </label>
            <select
              value={editData.importance}
              onChange={(e) => setEditData({ ...editData, importance: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {IMPORTANCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사건 설명
          </label>
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 관련 인물 선택 */}
        {characters.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 인물
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {characters.map(character => (
                <label key={character.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editData.relatedCharacters.includes(character.id)}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        relatedCharacters: e.target.checked
                          ? [...editData.relatedCharacters, character.id]
                          : editData.relatedCharacters.filter(id => id !== character.id)
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{character.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* 관련 회차 선택 */}
        {episodes.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              관련 회차
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {episodes.map(episode => (
                <label key={episode.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editData.relatedEpisodes.includes(episode.id)}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        relatedEpisodes: e.target.checked
                          ? [...editData.relatedEpisodes, episode.id]
                          : editData.relatedEpisodes.filter(id => id !== episode.id)
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{episode.number}화. {episode.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
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

  const importanceOption = getImportanceOption(event.importance);

  return (
    <div className="bg-white p-4 rounded-lg border hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">{event.title}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded ${importanceOption.color}`}>
              {importanceOption.label}
            </span>
            {event.date && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                {event.date}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-3 whitespace-pre-wrap">{event.description}</p>
          
          {/* 관련 인물 표시 */}
          {event.relatedCharacters && event.relatedCharacters.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-700 mr-2">관련 인물:</span>
              <div className="inline-flex flex-wrap gap-1">
                {event.relatedCharacters.map(characterId => {
                  const character = characters.find(c => c.id === characterId);
                  return character ? (
                    <span
                      key={characterId}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                    >
                      {character.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {/* 관련 회차 표시 */}
          {event.relatedEpisodes && event.relatedEpisodes.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-700 mr-2">관련 회차:</span>
              <div className="inline-flex flex-wrap gap-1">
                {event.relatedEpisodes.map(episodeId => {
                  const episode = episodes.find(e => e.id === episodeId);
                  return episode ? (
                    <span
                      key={episodeId}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {episode.number}화
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
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