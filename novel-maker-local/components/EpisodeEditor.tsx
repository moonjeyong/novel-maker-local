'use client';

import { useState, useEffect, useCallback } from 'react';
import { Episode, Character, useProjectStore, WRITING_STYLES } from '@/store/useProjectStore';

interface EpisodeEditorProps {
  projectId: string;
  episodes: Episode[];
  characters: Character[];
}

export default function EpisodeEditor({ projectId, episodes, characters }: EpisodeEditorProps) {
  const { addEpisode, updateEpisode, deleteEpisode, reorderEpisodes, generateNovelContent, generateStoryboardContent, getGrokApiKey } = useProjectStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatingStoryboardId, setGeneratingStoryboardId] = useState<string | null>(null);
  const [showWritingStyleModal, setShowWritingStyleModal] = useState(false);
  const [showStoryboardModal, setShowStoryboardModal] = useState(false);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [cutCount, setCutCount] = useState(60);
  const [newEpisode, setNewEpisode] = useState({
    number: episodes.length + 1,
    title: '',
    summary: '',
    appearingCharacters: [] as string[],
  });

  const handleAddEpisode = () => {
    if (newEpisode.title.trim()) {
      addEpisode(projectId, newEpisode);
      setNewEpisode({
        number: episodes.length + 2,
        title: '',
        summary: '',
        appearingCharacters: [],
      });
      setIsAdding(false);
    }
  };

  const handleUpdateEpisode = (episodeId: string, data: Partial<Episode>) => {
    updateEpisode(projectId, episodeId, data);
    setEditingId(null);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (confirm('이 회차를 삭제하시겠습니까?')) {
      deleteEpisode(projectId, episodeId);
    }
  };

  const handleGenerateNovelClick = (episodeId: string) => {
    const apiKey = getGrokApiKey();
    if (!apiKey) {
      alert('Grok API 키가 설정되지 않았습니다. 설정 탭에서 API 키를 입력해주세요.');
      return;
    }

    setSelectedEpisodeId(episodeId);
    setShowWritingStyleModal(true);
  };

  const handleGenerateNovel = async (writingStyle?: string) => {
    if (!selectedEpisodeId) return;

    setGeneratingId(selectedEpisodeId);
    setShowWritingStyleModal(false);
    
    try {
      await generateNovelContent(projectId, selectedEpisodeId, writingStyle);
      alert('소설 내용이 성공적으로 생성되었습니다!');
    } catch (error) {
      console.error('소설 생성 오류:', error);
      alert(`소설 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setGeneratingId(null);
      setSelectedEpisodeId(null);
    }
  };

  const handleGenerateStoryboard = async (episodeId: string) => {
    if (!getGrokApiKey()) {
      alert('Grok API 키가 설정되지 않았습니다. 설정 탭에서 API 키를 입력해주세요.');
      return;
    }

    setSelectedEpisodeId(episodeId);
    setShowStoryboardModal(true);
  };

  const handleConfirmStoryboard = async () => {
    if (!selectedEpisodeId) return;

    // 현재 에피소드에 이미 콘티가 있는지 확인
    const currentEpisode = episodes.find(ep => ep.id === selectedEpisodeId);
    const isRegeneration = currentEpisode?.storyboardContent;

    setGeneratingStoryboardId(selectedEpisodeId);
    setShowStoryboardModal(false);
    
    try {
      await generateStoryboardContent(projectId, selectedEpisodeId, cutCount);
      // 콘티 생성/재생성에 따라 다른 메시지 표시
      if (isRegeneration) {
        alert('콘티 재생성이 완료되었습니다!');
      } else {
        alert('콘티 내용이 성공적으로 생성되었습니다!');
      }
    } catch (error) {
      console.error('콘티 생성 오류:', error);
      alert(`콘티 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setGeneratingStoryboardId(null);
      setSelectedEpisodeId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">회차 줄거리</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          회차 추가
        </button>
      </div>

      {/* Add New Episode Form */}
      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                회차 번호
              </label>
              <input
                type="number"
                value={newEpisode.number}
                onChange={(e) => setNewEpisode({ ...newEpisode, number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                value={newEpisode.title}
                onChange={(e) => setNewEpisode({ ...newEpisode, title: e.target.value })}
                placeholder="회차 제목을 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              줄거리 요약
            </label>
            <textarea
              value={newEpisode.summary}
              onChange={(e) => setNewEpisode({ ...newEpisode, summary: e.target.value })}
              placeholder="회차 줄거리를 간단히 요약해주세요"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 등장인물 선택 */}
          {characters.length > 0 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                등장인물
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {characters.map(character => (
                  <label key={character.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newEpisode.appearingCharacters.includes(character.id)}
                      onChange={(e) => {
                        setNewEpisode({
                          ...newEpisode,
                          appearingCharacters: e.target.checked
                            ? [...newEpisode.appearingCharacters, character.id]
                            : newEpisode.appearingCharacters.filter(id => id !== character.id)
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
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAddEpisode}
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

      {/* Episodes List */}
      <div className="space-y-3">
        {episodes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 등록된 회차가 없습니다.
          </div>
        ) : (
          episodes.map((episode, index) => (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              totalCount={episodes.length}
              isEditing={editingId === episode.id}
              isGenerating={generatingId === episode.id}
              generatingStoryboardId={generatingStoryboardId}
              onEdit={() => setEditingId(episode.id)}
              onSave={(data) => handleUpdateEpisode(episode.id, data)}
              onCancel={() => setEditingId(null)}
              onDelete={() => handleDeleteEpisode(episode.id)}
              onGenerateNovel={() => handleGenerateNovelClick(episode.id)}
              onGenerateStoryboard={() => handleGenerateStoryboard(episode.id)}
              characters={characters}
            />
          ))
        )}
      </div>

      {/* Writing Style Selection Modal */}
      {showWritingStyleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">문체 선택</h3>
            <p className="text-sm text-gray-600 mb-4">
              이 회차에 사용할 문체를 선택해주세요. 프로젝트 기본 문체를 사용하거나 다른 문체를 선택할 수 있습니다.
            </p>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleGenerateNovel()}
                className="w-full p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">프로젝트 기본 문체 사용</div>
                <div className="text-sm text-gray-500">설정된 기본 문체로 생성합니다</div>
              </button>
              
              {WRITING_STYLES.map((style) => (
                <button
                  key={style.value}
                  onClick={() => handleGenerateNovel(style.value)}
                  className="w-full p-3 text-left border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{style.label}</div>
                  <div className="text-sm text-gray-500">{style.description}</div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowWritingStyleModal(false);
                  setSelectedEpisodeId(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Modal */}
      {showStoryboardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">컷 수 선택</h3>
            <p className="text-sm text-gray-600 mb-4">
              이 회차의 컷 수를 선택해주세요.
            </p>
            
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                컷 수 (40~100)
              </label>
              <input
                type="number"
                min="40"
                max="100"
                value={cutCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 60;
                  if (value < 40) setCutCount(40);
                  else if (value > 100) setCutCount(100);
                  else setCutCount(value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500">
                S급 작가 수준의 고퀄리티 콘티를 생성합니다.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowStoryboardModal(false);
                  setSelectedEpisodeId(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmStoryboard}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                콘티 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  totalCount: number;
  isEditing: boolean;
  isGenerating: boolean;
  generatingStoryboardId: string | null;
  onEdit: () => void;
  onSave: (data: Partial<Episode>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onGenerateNovel: () => void;
  onGenerateStoryboard: () => void;
  characters: Character[];
}

function EpisodeCard({
  episode,
  index,
  totalCount,
  isEditing,
  isGenerating,
  generatingStoryboardId,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onGenerateNovel,
  onGenerateStoryboard,
  characters,
}: EpisodeCardProps) {
  const [editData, setEditData] = useState({
    number: episode.number,
    title: episode.title,
    summary: episode.summary,
    appearingCharacters: episode.appearingCharacters || [],
  });
  const [showNovelContent, setShowNovelContent] = useState(false);
  const [isEditingNovel, setIsEditingNovel] = useState(false);
  const [novelEditData, setNovelEditData] = useState(episode.novelContent || '');
  const [showStoryboardContent, setShowStoryboardContent] = useState(false);
  const [isEditingStoryboard, setIsEditingStoryboard] = useState(false);
  const [storyboardEditData, setStoryboardEditData] = useState(episode.storyboardContent || '');

  const handleSave = () => {
    onSave(editData);
  };

  const handleSaveNovel = useCallback(() => {
    onSave({ novelContent: novelEditData });
    setIsEditingNovel(false);
    alert('소설 내용이 저장되었습니다.');
  }, [novelEditData, onSave]);

  const handleSaveStoryboard = useCallback(() => {
    onSave({ storyboardContent: storyboardEditData });
    setIsEditingStoryboard(false);
    alert('콘티 내용이 저장되었습니다.');
  }, [storyboardEditData, onSave]);

  const handleCancelNovelEdit = () => {
    if (novelEditData !== episode.novelContent) {
      if (confirm('편집한 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
        setNovelEditData(episode.novelContent || '');
        setIsEditingNovel(false);
      }
    } else {
      setIsEditingNovel(false);
    }
  };

  const handleCancelStoryboardEdit = () => {
    if (storyboardEditData !== episode.storyboardContent) {
      if (confirm('편집한 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
        setStoryboardEditData(episode.storyboardContent || '');
        setIsEditingStoryboard(false);
      }
    } else {
      setIsEditingStoryboard(false);
    }
  };

  // episode.novelContent가 변경될 때마다 novelEditData 업데이트
  useEffect(() => {
    setNovelEditData(episode.novelContent || '');
  }, [episode.novelContent]);

  // episode.storyboardContent가 변경될 때마다 storyboardEditData 업데이트
  useEffect(() => {
    setStoryboardEditData(episode.storyboardContent || '');
  }, [episode.storyboardContent]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingNovel && e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveNovel();
      } else if (isEditingStoryboard && e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveStoryboard();
      }
    };

    if (isEditingNovel || isEditingStoryboard) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditingNovel, isEditingStoryboard, handleSaveNovel, handleSaveStoryboard]);

  if (isEditing) {
    return (
      <div className="bg-white p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              회차 번호
            </label>
            <input
              type="number"
              value={editData.number}
              onChange={(e) => setEditData({ ...editData, number: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
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
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            줄거리 요약
          </label>
          <textarea
            value={editData.summary}
            onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        {/* 등장인물 선택 */}
        {characters.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              등장인물
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {characters.map(character => (
                <label key={character.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editData.appearingCharacters.includes(character.id)}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        appearingCharacters: e.target.checked
                          ? [...editData.appearingCharacters, character.id]
                          : editData.appearingCharacters.filter(id => id !== character.id)
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
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
              {episode.number}화
            </span>
            <h4 className="font-medium text-gray-900">{episode.title}</h4>
            {episode.novelContent && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                소설화 완료
              </span>
            )}
            {episode.storyboardContent && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                콘티화 완료
              </span>
            )}
          </div>
          {episode.summary && (
            <p className="text-gray-600 text-sm mb-3">{episode.summary}</p>
          )}
          
          {/* 등장인물 표시 */}
          {episode.appearingCharacters && episode.appearingCharacters.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-medium text-gray-700 mb-1">등장인물:</h5>
              <div className="flex flex-wrap gap-1">
                {episode.appearingCharacters.map(characterId => {
                  const character = characters.find(c => c.id === characterId);
                  return character ? (
                    <span
                      key={characterId}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {character.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {/* 소설화 버튼 */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={onGenerateNovel}
              disabled={isGenerating || !episode.summary.trim()}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              {isGenerating ? (
                <>
                  <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  소설화하기
                </>
              )}
            </button>
            
            {episode.novelContent && (
              <button
                onClick={() => setShowNovelContent(!showNovelContent)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                {showNovelContent ? '소설 숨기기' : '소설 보기'}
              </button>
            )}
            
            {episode.storyboardContent && (
              <button
                onClick={() => setShowStoryboardContent(!showStoryboardContent)}
                className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
              >
                {showStoryboardContent ? '콘티 숨기기' : '콘티 보기'}
              </button>
            )}
          </div>
          
          {/* Novel Content */}
          {episode.novelContent && showNovelContent && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">소설 내용</h5>
                <div className="flex gap-2">
                  {/* 콘티화 버튼 - 소설화가 완료된 경우에만 표시 */}
                  <button
                    onClick={onGenerateStoryboard}
                    disabled={generatingStoryboardId === episode.id}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      generatingStoryboardId === episode.id
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                    }`}
                  >
                    {generatingStoryboardId === episode.id 
                      ? '생성 중...' 
                      : episode.storyboardContent 
                        ? '콘티 재생성' 
                        : '콘티 생성'
                    }
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {isEditingNovel ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>소설 편집 모드</span>
                      <span>{novelEditData.length.toLocaleString()}자</span>
                    </div>
                    <textarea
                      value={novelEditData}
                      onChange={(e) => setNovelEditData(e.target.value)}
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="소설 내용을 편집하세요..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveNovel}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        저장 (Ctrl+S)
                      </button>
                      <button
                        onClick={handleCancelNovelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                      {episode.novelContent}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingNovel(true)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded hover:bg-yellow-200 transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(episode.novelContent || '');
                          alert('소설 내용이 클립보드에 복사되었습니다.');
                        }}
                        className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded hover:bg-green-200 transition-colors"
                      >
                        복사
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([episode.novelContent || ''], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${episode.number}화_${episode.title}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
                      >
                        다운로드
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Storyboard Content */}
          {episode.storyboardContent && showStoryboardContent && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-medium text-gray-700">콘티 내용</h5>
              </div>
              
              <div className="space-y-3">
                {isEditingStoryboard ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>콘티 편집 모드</span>
                      <span>{storyboardEditData.length.toLocaleString()}자</span>
                    </div>
                    <textarea
                      value={storyboardEditData}
                      onChange={(e) => setStoryboardEditData(e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                      placeholder="콘티 내용을 편집하세요..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveStoryboard}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        저장 (Ctrl+S)
                      </button>
                      <button
                        onClick={handleCancelStoryboardEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-orange-50 p-3 rounded text-sm max-h-64 overflow-y-auto whitespace-pre-wrap font-mono">
                      {episode.storyboardContent}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingStoryboard(true)}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded hover:bg-orange-200 transition-colors"
                      >
                        편집
                      </button>
                      <button
                        onClick={onGenerateStoryboard}
                        disabled={generatingStoryboardId === episode.id}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          generatingStoryboardId === episode.id
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        }`}
                      >
                        {generatingStoryboardId === episode.id 
                          ? '생성 중...' 
                          : episode.storyboardContent 
                            ? '콘티 재생성' 
                            : '콘티 생성'
                        }
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(episode.storyboardContent || '');
                          alert('콘티 내용이 클립보드에 복사되었습니다.');
                        }}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded hover:bg-orange-200 transition-colors"
                      >
                        복사
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([episode.storyboardContent || ''], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${episode.number}화_${episode.title}_콘티.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded hover:bg-orange-200 transition-colors"
                      >
                        다운로드
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
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