import { Episode, Character, useProjectStore, WRITING_STYLES } from '@/store/useProjectStore';

export interface Episode {
  id: string;
  number: number;
  title: string;
  summary: string;
  appearingCharacters: string[];  // 등장인물 ID 배열 추가
  novelContent?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EpisodeEditorProps {
  projectId: string;
  episodes: Episode[];
  characters: Character[]; // 등장인물 목록 추가
}

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  totalCount: number;
  isEditing: boolean;
  isGenerating: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Episode>) => void;
  onCancel: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onGenerateNovel: () => void;
  characters: Character[]; // 등장인물 목록 추가
}

function EpisodeCard({
  episode,
  index,
  totalCount,
  isEditing,
  isGenerating,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onMoveUp,
  onMoveDown,
  onGenerateNovel,
  characters, // 등장인물 목록 추가
}: EpisodeCardProps) {
  const [editData, setEditData] = useState({
    number: episode.number,
    title: episode.title,
    summary: episode.summary,
    appearingCharacters: episode.appearingCharacters || [], // 등장인물 ID 목록 추가
  });

  // ... existing code ...

  return (
    <div className="bg-white p-6 rounded-lg border mb-4">
      {isEditing ? (
        <div className="space-y-4">
          {/* ... existing code ... */}
          
          {/* 등장인물 선택 */}
          <div>
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
          
          {/* ... existing code ... */}
        </div>
      ) : (
        <div>
          {/* ... existing code ... */}
          
          {/* 등장인물 표시 */}
          {episode.appearingCharacters && episode.appearingCharacters.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700">등장인물:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {episode.appearingCharacters.map(characterId => {
                  const character = characters.find(c => c.id === characterId);
                  return character ? (
                    <span
                      key={characterId}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {character.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          
          {/* ... existing code ... */}
        </div>
      )}
    </div>
  );
}

export default function EpisodeEditor({ projectId, episodes, characters }: EpisodeEditorProps) {
  // ... existing code ...

  const [newEpisode, setNewEpisode] = useState({
    number: episodes.length + 1,
    title: '',
    summary: '',
    appearingCharacters: [] as string[], // 등장인물 ID 목록 추가
  });

  // ... existing code ...

  const handleAddEpisode = () => {
    if (newEpisode.title.trim()) {
      addEpisode(projectId, newEpisode);
      setNewEpisode({
        number: episodes.length + 2,
        title: '',
        summary: '',
        appearingCharacters: [], // 초기화
      });
      setIsAdding(false);
    }
  };

  // ... existing code ...

  // Add New Episode Form에 등장인물 선택 추가
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
      
      {/* 등장인물 선택 추가 */}
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

  // ... existing code ...

  // EpisodeCard에도 characters 전달
  <EpisodeCard
    key={episode.id}
    episode={episode}
    index={index}
    totalCount={episodes.length}
    isEditing={editingId === episode.id}
    isGenerating={generatingId === episode.id}
    onEdit={() => setEditingId(episode.id)}
    onSave={(data) => handleUpdateEpisode(episode.id, data)}
    onCancel={() => setEditingId(null)}
    onDelete={() => handleDeleteEpisode(episode.id)}
    onMoveUp={() => moveEpisode(index, 'up')}
    onMoveDown={() => moveEpisode(index, 'down')}
    onGenerateNovel={() => handleGenerateNovelClick(episode.id)}
    characters={characters} // 등장인물 목록 전달
  />

  // ... existing code ...
} 