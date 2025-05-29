import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Episode {
  id: string;
  number: number;
  title: string;
  summary: string;
  appearingCharacters?: string[]; // 등장인물 ID 목록 추가
  novelContent?: string; // 소설화된 내용
  storyboardContent?: string; // 콘티 내용
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  age?: string;
  occupation?: string;
  personality?: string;
  family?: string;
  notes?: string;
  appearance?: string;
  mbti?: string;
  bloodType?: string;
  image?: string; // base64 data URL
  createdAt: Date;
  updatedAt: Date;
}

export interface Memo {
  id: string;
  title: string;
  content: string; // markdown content
  createdAt: Date;
  updatedAt: Date;
}

export interface WorldSetting {
  id: string;
  category: 'background' | 'era' | 'region' | 'culture' | 'politics' | 'economy' | 'other';
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  category?: string;
  relatedTerms?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date?: string; // 작품 내 시간
  importance: 'low' | 'medium' | 'high';
  relatedCharacters?: string[];
  relatedEpisodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'magic' | 'skill' | 'other';
  description: string;
  effects?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  owner?: string; // character ID
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  synopsis: string;
  genres: string[];
  writingStyle?: string; // 문체 스타일 추가
  coverImage?: string; // base64 data URL
  episodes: Episode[];
  characters: Character[];
  memos: Memo[]; // memo를 memos 배열로 변경
  worldSettings: WorldSetting[];
  terms: Term[];
  events: Event[];
  items: Item[];
  createdAt: Date;
  updatedAt: Date;
}

// 문체 옵션 정의
export const WRITING_STYLES = [
  { value: 'modern', label: '현대적 문체', description: '간결하고 현대적인 표현' },
  { value: 'classical', label: '고전적 문체', description: '격조 있고 우아한 표현' },
  { value: 'casual', label: '일상적 문체', description: '친근하고 편안한 표현' },
  { value: 'dramatic', label: '극적 문체', description: '감정적이고 드라마틱한 표현' },
  { value: 'poetic', label: '시적 문체', description: '아름답고 서정적인 표현' },
  { value: 'humorous', label: '유머러스 문체', description: '재미있고 위트 있는 표현' },
  { value: 'serious', label: '진중한 문체', description: '무겁고 진지한 표현' },
  { value: 'fantasy', label: '판타지 문체', description: '환상적이고 신비로운 표현' }
];

// MBTI 옵션 정의
export const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  grokApiKey: string; // Grok API 키
  
  // Project actions
  createProject: (data: Omit<Project, 'id' | 'episodes' | 'characters' | 'memos' | 'worldSettings' | 'terms' | 'events' | 'items' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  getCurrentProject: () => Project | null;
  
  // Episode actions
  addEpisode: (projectId: string, episode: Omit<Episode, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEpisode: (projectId: string, episodeId: string, data: Partial<Episode>) => void;
  deleteEpisode: (projectId: string, episodeId: string) => void;
  reorderEpisodes: (projectId: string, episodes: Episode[]) => void;
  
  // Character actions
  addCharacter: (projectId: string, character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCharacter: (projectId: string, characterId: string, data: Partial<Character>) => void;
  deleteCharacter: (projectId: string, characterId: string) => void;
  
  // Memo actions
  addMemo: (projectId: string, memo: Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemo: (projectId: string, memoId: string, data: Partial<Memo>) => void;
  deleteMemo: (projectId: string, memoId: string) => void;
  
  // WorldSetting actions
  addWorldSetting: (projectId: string, worldSetting: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorldSetting: (projectId: string, worldSettingId: string, data: Partial<WorldSetting>) => void;
  deleteWorldSetting: (projectId: string, worldSettingId: string) => void;
  
  // Term actions
  addTerm: (projectId: string, term: Omit<Term, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTerm: (projectId: string, termId: string, data: Partial<Term>) => void;
  deleteTerm: (projectId: string, termId: string) => void;
  
  // Event actions
  addEvent: (projectId: string, event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (projectId: string, eventId: string, data: Partial<Event>) => void;
  deleteEvent: (projectId: string, eventId: string) => void;
  
  // Item actions
  addItem: (projectId: string, item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (projectId: string, itemId: string, data: Partial<Item>) => void;
  deleteItem: (projectId: string, itemId: string) => void;
  
  // API Key actions
  setGrokApiKey: (apiKey: string) => void;
  getGrokApiKey: () => string;
  
  // Novel generation actions
  generateNovelContent: (projectId: string, episodeId: string, customWritingStyle?: string) => Promise<void>;
  
  // Storyboard generation actions
  generateStoryboardContent: (projectId: string, episodeId: string, cutCount: number) => Promise<void>;
  
  // Import/Export
  exportProject: (projectId: string) => string;
  importProject: (jsonData: string) => void;
  clearAllData: () => void;
  
  // 내부 유틸리티 함수: 안전한 프로젝트 조회
  _getProjectSafely: (projectId: string) => Project | null;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      grokApiKey: 'xai-blwB0UnbNdoYkJLqKsNCWogWKM17RXDJGcfzUYlHTI3qlXjKiN0h4Xge2yGHdIb0KsnsJXuG81pxT3lU',
      
      createProject: (data) => {
        const id = uuidv4();
        const now = new Date();
        const newProject: Project = {
          ...data,
          id,
          episodes: [],
          characters: [],
          memos: [],
          worldSettings: [],
          terms: [],
          events: [],
          items: [],
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
        }));
        
        return id;
      },
      
      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...data, updatedAt: new Date() }
              : project
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },
      
      setCurrentProject: (id) => {
        set({ currentProjectId: id });
      },
      
      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        const project = projects.find((p) => p.id === currentProjectId);
        if (!project) return null;
        
        // 안전한 프로젝트 객체 반환 (모든 배열 필드가 정의되도록)
        return {
          ...project,
          episodes: Array.isArray(project.episodes) ? project.episodes : [],
          characters: Array.isArray(project.characters) ? project.characters : [],
          memos: Array.isArray(project.memos) ? project.memos : [],
          worldSettings: Array.isArray(project.worldSettings) ? project.worldSettings : [],
          terms: Array.isArray(project.terms) ? project.terms : [],
          events: Array.isArray(project.events) ? project.events : [],
          items: Array.isArray(project.items) ? project.items : [],
        };
      },
      
      // 내부 유틸리티 함수: 안전한 프로젝트 조회
      _getProjectSafely: (projectId: string) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === projectId);
        if (!project) return null;
        
        // 모든 배열 필드가 안전하게 정의되도록 보장
        return {
          ...project,
          episodes: Array.isArray(project.episodes) ? project.episodes : [],
          characters: Array.isArray(project.characters) ? project.characters : [],
          memos: Array.isArray(project.memos) ? project.memos : [],
          worldSettings: Array.isArray(project.worldSettings) ? project.worldSettings : [],
          terms: Array.isArray(project.terms) ? project.terms : [],
          events: Array.isArray(project.events) ? project.events : [],
          items: Array.isArray(project.items) ? project.items : [],
        };
      },
      
      addEpisode: (projectId, episode) => {
        const id = uuidv4();
        const now = new Date();
        const newEpisode: Episode = {
          ...episode,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  episodes: [...project.episodes, newEpisode],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateEpisode: (projectId, episodeId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  episodes: project.episodes.map((episode) =>
                    episode.id === episodeId
                      ? { ...episode, ...data, updatedAt: new Date() }
                      : episode
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteEpisode: (projectId, episodeId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  episodes: project.episodes.filter((episode) => episode.id !== episodeId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      reorderEpisodes: (projectId, episodes) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  episodes,
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addCharacter: (projectId, character) => {
        const id = uuidv4();
        const now = new Date();
        const newCharacter: Character = {
          ...character,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  characters: [...project.characters, newCharacter],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateCharacter: (projectId, characterId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  characters: project.characters.map((character) =>
                    character.id === characterId
                      ? { ...character, ...data, updatedAt: new Date() }
                      : character
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteCharacter: (projectId, characterId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  characters: project.characters.filter((character) => character.id !== characterId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addMemo: (projectId, memo) => {
        const id = uuidv4();
        const now = new Date();
        const newMemo: Memo = {
          ...memo,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, memos: [...project.memos, newMemo], updatedAt: now }
              : project
          ),
        }));
      },
      
      updateMemo: (projectId, memoId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  memos: project.memos.map((memo) =>
                    memo.id === memoId
                      ? { ...memo, ...data, updatedAt: new Date() }
                      : memo
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteMemo: (projectId, memoId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  memos: project.memos.filter((memo) => memo.id !== memoId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addWorldSetting: (projectId, worldSetting) => {
        const id = uuidv4();
        const now = new Date();
        const newWorldSetting: WorldSetting = {
          ...worldSetting,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  worldSettings: Array.isArray(project.worldSettings) 
                    ? [...project.worldSettings, newWorldSetting]
                    : [newWorldSetting],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateWorldSetting: (projectId, worldSettingId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  worldSettings: Array.isArray(project.worldSettings)
                    ? project.worldSettings.map((worldSetting) =>
                        worldSetting.id === worldSettingId
                          ? { ...worldSetting, ...data, updatedAt: new Date() }
                          : worldSetting
                      )
                    : [],
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteWorldSetting: (projectId, worldSettingId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  worldSettings: Array.isArray(project.worldSettings)
                    ? project.worldSettings.filter((worldSetting) => worldSetting.id !== worldSettingId)
                    : [],
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addTerm: (projectId, term) => {
        const id = uuidv4();
        const now = new Date();
        const newTerm: Term = {
          ...term,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  terms: [...project.terms, newTerm],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateTerm: (projectId, termId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  terms: project.terms.map((term) =>
                    term.id === termId
                      ? { ...term, ...data, updatedAt: new Date() }
                      : term
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteTerm: (projectId, termId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  terms: project.terms.filter((term) => term.id !== termId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addEvent: (projectId, event) => {
        const id = uuidv4();
        const now = new Date();
        const newEvent: Event = {
          ...event,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  events: [...project.events, newEvent],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateEvent: (projectId, eventId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  events: project.events.map((event) =>
                    event.id === eventId
                      ? { ...event, ...data, updatedAt: new Date() }
                      : event
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteEvent: (projectId, eventId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  events: project.events.filter((event) => event.id !== eventId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      addItem: (projectId, item) => {
        const id = uuidv4();
        const now = new Date();
        const newItem: Item = {
          ...item,
          id,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  items: [...project.items, newItem],
                  updatedAt: now,
                }
              : project
          ),
        }));
      },
      
      updateItem: (projectId, itemId, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  items: project.items.map((item) =>
                    item.id === itemId
                      ? { ...item, ...data, updatedAt: new Date() }
                      : item
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      deleteItem: (projectId, itemId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  items: project.items.filter((item) => item.id !== itemId),
                  updatedAt: new Date(),
                }
              : project
          ),
        }));
      },
      
      setGrokApiKey: (apiKey) => {
        set({ grokApiKey: apiKey });
      },
      
      getGrokApiKey: () => {
        return get().grokApiKey;
      },
      
      generateNovelContent: async (projectId, episodeId, customWritingStyle) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === projectId);
        
        if (!project) {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        const episode = project.episodes.find((e) => e.id === episodeId);
        if (!episode) {
          throw new Error('회차를 찾을 수 없습니다.');
        }
        
        try {
          // MBTI 성격 특성 매핑
          const getMbtiTraits = (mbti: string) => {
            const traits: { [key: string]: string } = {
              'ISTJ': '신중하고 책임감이 강하며 체계적인',
              'ISFJ': '배려심이 깊고 헌신적이며 꼼꼼한',
              'INFJ': '통찰력이 있고 이상적이며 공감능력이 뛰어난',
              'INTJ': '분석적이고 전략적이며 독립적인',
              'ISTP': '논리적이고 융통성 있으며 실용적인',
              'ISFP': '예술적 감각이 있고 자유로우며 섬세한',
              'INFP': '이상주의적이고 창의적이며 감수성이 풍부한',
              'INTP': '지적 호기심이 많고 혁신적이며 논리적인',
              'ESTP': '활동적이고 현실적이며 순발력 있는',
              'ESFP': '사교적이고 즉흥적이며 열정적인',
              'ENFP': '열정적이고 창의적이며 사람들을 잘 이끄는',
              'ENTP': '독창적이고 도전적이며 논쟁을 즐기는',
              'ESTJ': '체계적이고 실용적이며 지도력 있는',
              'ESFJ': '친절하고 협조적이며 사교성이 좋은',
              'ENFJ': '카리스마 있고 이타적이며 사람들을 잘 이끄는',
              'ENTJ': '결단력 있고 전략적이며 리더십이 있는'
            };
            return traits[mbti] || '';
          };

          // 이번 회차 등장인물 정보만 상세하게 수집
          const appearingCharacterInfo = episode.appearingCharacters && episode.appearingCharacters.length > 0
            ? project.characters
                .filter(char => episode.appearingCharacters!.includes(char.id))
                .map(char => {
                  const details = [];
                  if (char.name) details.push(`이름: ${char.name}`);
                  if (char.age) details.push(`나이: ${char.age}`);
                  if (char.occupation) details.push(`직업: ${char.occupation}`);
                  
                  // 성격 정보에 MBTI 특성을 자연스럽게 통합
                  const mbtiTraits = char.mbti ? getMbtiTraits(char.mbti) : '';
                  const personalityDesc = [char.personality, mbtiTraits].filter(Boolean).join(', ');
                  if (personalityDesc) details.push(`성격: ${personalityDesc}`);
                  
                  if (char.appearance) details.push(`외모: ${char.appearance}`);
                  if (char.family) details.push(`가족관계: ${char.family}`);
                  if (char.bloodType) details.push(`혈액형: ${char.bloodType}`);
                  if (char.notes) details.push(`특이사항: ${char.notes}`);
                  
                  return details.join(', ');
                }).join('\n\n')
            : '이번 회차에 등장하는 인물이 지정되지 않았습니다.';
          
          // 이전 회차들의 맥락 정보 수집 (실제 소설 내용도 포함)
          const previousEpisodes = project.episodes
            .filter(ep => ep.number < episode.number)
            .sort((a, b) => a.number - b.number)
            .map(ep => `${ep.number}화: ${ep.title}
줄거리: ${ep.summary}
${ep.novelContent ? `내용: ${ep.novelContent.substring(0, 500)}...` : ''}`)
            .join('\n\n==========\n\n');
          
          // 문체 정보 가져오기 (커스텀 문체가 있으면 우선 사용)
          const selectedWritingStyle = customWritingStyle || project.writingStyle;
          const writingStyleInfo = selectedWritingStyle 
            ? WRITING_STYLES.find(style => style.value === selectedWritingStyle)
            : null;
          
          // 세계관 설정 정보 수집
          const worldSettingsInfo = Array.isArray(project.worldSettings) && project.worldSettings.length > 0
            ? project.worldSettings
                .map(ws => `【${ws.category}】 ${ws.title}: ${ws.content}`)
                .join('\n\n')
            : '세계관 설정이 없습니다.';
          
          // 용어사전 정보 수집
          const termsInfo = Array.isArray(project.terms) && project.terms.length > 0
            ? project.terms
                .map(term => `${term.term}: ${term.definition}${term.category ? ` (${term.category})` : ''}`)
                .join('\n')
            : '용어사전이 없습니다.';
          
          // 중요한 사건들 정보 수집
          const eventsInfo = Array.isArray(project.events) && project.events.length > 0
            ? project.events
                .filter(event => event.importance === 'high' || event.importance === 'medium')
                .map(event => `${event.title}: ${event.description}${event.date ? ` (${event.date})` : ''}`)
                .join('\n')
            : '주요 사건이 없습니다.';
          
          // 이번 회차 등장인물이 소유한 아이템/마법 정보 수집
          const characterItems = Array.isArray(project.items) && episode.appearingCharacters 
            ? project.items
                .filter(item => item.owner && episode.appearingCharacters!.includes(item.owner))
                .map(item => {
                  const ownerName = project.characters.find(char => char.id === item.owner)?.name || '미지';
                  return `${ownerName}의 ${item.name} (${item.type}): ${item.description}${item.effects ? ` - 효과: ${item.effects}` : ''}`;
                })
                .join('\n')
            : '등장인물 관련 아이템/마법이 없습니다.';

          // 상세한 프롬프트 생성
          const prompt = `당신은 최고의 S급 웹소설 작가입니다. 다음 웹소설의 회차를 5000자 이상의 분량으로 자세히 작성해주세요.

【작품 기본 정보】
- 제목: ${project.title}
- 장르: ${project.genres.join(', ')}
- 시놉시스: ${project.synopsis}
${writingStyleInfo ? `- 문체 스타일: ${writingStyleInfo.label} (${writingStyleInfo.description})` : ''}

【세계관 설정】
${worldSettingsInfo}

【용어사전】
${termsInfo}

【주요 사건 및 배경】
${eventsInfo}

【등장인물의 아이템/마법】
${characterItems}

【작가 메모 및 참고사항】
${project.memos.length > 0 ? project.memos.map(memo => memo.content).join('\n\n') : '작가 메모가 없습니다.'}

【S급 웹소설 작가의 문체 특징】
1. 강력한 몰입감을 주는 생생한 현장감
2. 캐릭터의 감정과 내면을 섬세하게 표현
3. 긴장감 있는 장면 전환과 속도감 있는 전개
4. 독자의 호기심을 자극하는 복선과 반전
5. 감정이입을 돕는 감각적인 묘사
6. 캐릭터만의 개성있는 말투와 습관
7. 웹소설에 최적화된 간결하고 강렬한 문장
8. 절정 장면에서의 압도적인 연출
9. 독자의 기대를 배신하지 않는 탄탄한 구성
10. 중독성 있는 문장 끊기와 호흡

【이번 회차 등장인물】
${appearingCharacterInfo}

【이전 회차 정보】
${previousEpisodes || '이전 회차가 없습니다.'}

【현재 회차 정보】
- 회차: ${episode.number}화
- 제목: ${episode.title}
- 줄거리: ${episode.summary}

【작성 요구사항】
1. 반드시 5000자 이상으로 작성 (매우 중요!)
2. 한국어 웹소설 스타일 (대화체와 서술체의 조화)
${writingStyleInfo ? `3. ${writingStyleInfo.label} 스타일로 작성 - ${writingStyleInfo.description}` : '3. 자연스러운 문체로 작성'}
4. 등장인물들의 성격과 특징을 정확히 반영
5. 시놉시스의 세계관과 설정을 충실히 반영
6. 이전 회차와의 연결성 고려
7. 생생한 묘사와 감정 표현
8. 독자의 몰입감을 높이는 전개
9. 대화는 따옴표("")로 표시
10. 장면 전환 시 적절한 여백 활용
11. 회차의 줄거리를 자세히 풀어서 작성
12. S급 웹소설 작가들의 문체 특징을 최대한 반영
13. 캐릭터의 성격은 자연스럽게 행동과 대화를 통해 표현 (MBTI나 혈액형 등은 직접적으로 언급하지 않음)

【참고사항】
- 이 회차에서 일어나야 할 주요 사건: ${episode.summary}
- 등장인물들의 관계와 갈등을 자세히 묘사
- 감정의 변화와 심리 묘사에 중점
- 대화를 통한 캐릭터 개성 표현
- 작가 메모의 설정과 아이디어를 적극 활용
- S급 웹소설의 특징인 강한 몰입감과 중독성 있는 문체 사용
- 각 장면마다 독자가 현장에 있는 것처럼 생생하게 묘사
- 캐릭터의 대사와 행동을 통해 자연스러운 성격 표현
${writingStyleInfo ? `- ${writingStyleInfo.label}의 특징을 살려 문장을 구성` : ''}

반드시 5000자 이상의 완성도 높은 소설로 작성해주세요.`;

          console.log('Sending detailed prompt to API:', prompt);

          const response = await fetch('/api/grok', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });

          console.log('API response status:', response.status);
          const data = await response.json();
          console.log('API response:', data);

          if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}\n${JSON.stringify(data.error || {}, null, 2)}`);
          }

          const novelContent = data.content;
          console.log('Generated content length:', novelContent?.length || 0);

          if (!novelContent) {
            throw new Error('소설 내용을 생성하지 못했습니다.');
          }

          // 생성된 소설 내용을 에피소드에 저장
          set((state) => ({
            projects: state.projects.map((proj) =>
              proj.id === projectId
                ? {
                    ...proj,
                    episodes: proj.episodes.map((ep) =>
                      ep.id === episodeId
                        ? { ...ep, novelContent, updatedAt: new Date() }
                        : ep
                    ),
                    updatedAt: new Date(),
                  }
                : proj
            ),
          }));

        } catch (error) {
          console.error('소설 생성 중 오류:', error);
          throw error;
        }
      },
      
      generateStoryboardContent: async (projectId, episodeId, cutCount) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === projectId);
        
        if (!project) {
          throw new Error('프로젝트를 찾을 수 없습니다.');
        }
        
        const episode = project.episodes.find((e) => e.id === episodeId);
        if (!episode) {
          throw new Error('회차를 찾을 수 없습니다.');
        }
        
        if (!episode.novelContent) {
          throw new Error('소설화된 내용이 없습니다. 먼저 소설화를 진행해주세요.');
        }
        
        try {
          // 등장인물 상세 정보 수집
          const characterInfo = episode.appearingCharacters && episode.appearingCharacters.length > 0
            ? project.characters
                .filter(char => episode.appearingCharacters!.includes(char.id))
                .map(char => {
                  const details = [];
                  if (char.name) details.push(`이름: ${char.name}`);
                  if (char.personality) details.push(`성격: ${char.personality}`);
                  if (char.appearance) details.push(`외모: ${char.appearance}`);
                  if (char.occupation) details.push(`직업: ${char.occupation}`);
                  return details.join(', ');
                })
                .join('\n')
            : '등장인물 정보 없음';

          // 세계관 설정 정보 수집 (콘티에 필요한 배경 정보)
          const worldSettingsInfo = Array.isArray(project.worldSettings) && project.worldSettings.length > 0
            ? project.worldSettings
                .filter(ws => ws.category === 'background' || ws.category === 'region' || ws.category === 'era')
                .map(ws => `${ws.title}: ${ws.content}`)
                .join('\n')
            : '세계관 배경 정보 없음';

          // 이번 회차 등장인물이 소유한 아이템/마법 정보 수집 (시각적 표현에 필요)
          const characterItems = Array.isArray(project.items) && episode.appearingCharacters 
            ? project.items
                .filter(item => item.owner && episode.appearingCharacters!.includes(item.owner))
                .filter(item => item.type === 'weapon' || item.type === 'armor' || item.type === 'magic')
                .map(item => {
                  const ownerName = project.characters.find(char => char.id === item.owner)?.name || '미지';
                  return `${ownerName}: ${item.name} (${item.type}) - ${item.description}`;
                })
                .join('\n')
            : '등장인물 관련 아이템/마법 없음';

          // 개선된 콘티 생성 프롬프트 (완전한 출력 보장)
          const prompt = `당신은 최고의 상업 웹툰 콘티 작가입니다. 반드시 ${cutCount}컷을 모두 완성해주세요.

【절대 준수 사항】
1. 반드시 컷 1부터 컷 ${cutCount}까지 빠짐없이 모든 컷을 완성
2. 중간에 절대 끊지 말고 마지막 컷까지 완료
3. 각 컷마다 아래 형식을 정확히 준수

【콘티 형식】
컷 [번호]: [크기/앵글]
배경: [배경 상세 묘사]
인물: [인물 동작/표정 상세 묘사]
대사: [인물명] "[대사 내용]"
생각: [인물명] ([생각 내용])
효과음: "[효과음]"
나레이션: "[나레이션 내용]"

【작품 정보】
- 제목: ${project.title}
- 회차: ${episode.number}화 - ${episode.title}
- 장르: ${project.genres.join(', ')}

【등장인물 상세 정보】
${characterInfo}

【세계관 배경 설정】
${worldSettingsInfo}

【등장인물의 아이템/무기/마법】
${characterItems}

【소설 내용 (이 내용을 ${cutCount}컷으로 완전히 변환)】
${episode.novelContent}

【콘티 작성 시작】
지금부터 위 소설 내용을 바탕으로 정확히 ${cutCount}컷의 상업 콘티를 작성합니다.
반드시 컷 1부터 시작해서 컷 ${cutCount}까지 완성하세요:`;

          console.log('Sending improved storyboard prompt to API:', prompt);

          const response = await fetch('/api/grok', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
          });

          console.log('Storyboard API response status:', response.status);
          const data = await response.json();
          console.log('Storyboard API response:', data);

          if (!response.ok) {
            throw new Error(`API 요청 실패: ${response.status} ${response.statusText}\n${JSON.stringify(data.error || {}, null, 2)}`);
          }

          const storyboardContent = data.content;
          console.log('Generated storyboard length:', storyboardContent?.length || 0);

          if (!storyboardContent) {
            throw new Error('콘티 내용을 생성하지 못했습니다.');
          }

          // 생성된 콘티 내용을 에피소드에 저장
          set((state) => ({
            projects: state.projects.map((proj) =>
              proj.id === projectId
                ? {
                    ...proj,
                    episodes: proj.episodes.map((ep) =>
                      ep.id === episodeId
                        ? { ...ep, storyboardContent, updatedAt: new Date() }
                        : ep
                    ),
                    updatedAt: new Date(),
                  }
                : proj
            ),
          }));

        } catch (error) {
          console.error('콘티 생성 중 오류:', error);
          throw error;
        }
      },
      
      exportProject: (projectId) => {
        const { projects } = get();
        const project = projects.find((p) => p.id === projectId);
        return project ? JSON.stringify(project, null, 2) : '';
      },
      
      importProject: (jsonData) => {
        try {
          const project: Project = JSON.parse(jsonData);
          // Generate new ID to avoid conflicts
          const newProject = {
            ...project,
            id: uuidv4(),
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(),
          };
          
          set((state) => ({
            projects: [...state.projects, newProject],
          }));
        } catch (error) {
          console.error('Failed to import project:', error);
        }
      },
      
      clearAllData: () => {
        set({
          projects: [],
          currentProjectId: null,
          grokApiKey: '',
        });
      },
    }),
    {
      name: 'novel-maker-storage',
      version: 2, // 버전을 올려서 마이그레이션 강제 실행
      migrate: (persistedState: any, version: number) => {
        console.log('Migration running...', { version, persistedState });
        
        if (persistedState && persistedState.projects) {
          const migratedProjects = persistedState.projects.map((project: any) => {
            const migratedProject = {
              ...project,
              // 새로운 필드들을 빈 배열로 초기화
              worldSettings: Array.isArray(project.worldSettings) ? project.worldSettings : [],
              terms: Array.isArray(project.terms) ? project.terms : [],
              events: Array.isArray(project.events) ? project.events : [],
              items: Array.isArray(project.items) ? project.items : [],
              // memo를 memos 배열로 변환 (하위 호환성)
              memos: Array.isArray(project.memos) 
                ? project.memos 
                : project.memo 
                  ? [{ id: Date.now().toString(), content: project.memo, createdAt: new Date().toISOString() }]
                  : []
            };
            
            // 기존 memo 필드 제거
            delete migratedProject.memo;
            
            console.log('Migrated project:', migratedProject.title, {
              worldSettings: migratedProject.worldSettings?.length || 0,
              terms: migratedProject.terms?.length || 0,
              events: migratedProject.events?.length || 0,
              items: migratedProject.items?.length || 0,
              memos: migratedProject.memos?.length || 0
            });
            
            return migratedProject;
          });
          
          const migratedState = {
            ...persistedState,
            projects: migratedProjects
          };
          
          console.log('Migration completed!');
          return migratedState;
        }
        
        console.log('No migration needed');
        return persistedState;
      },
    }
  )
); 