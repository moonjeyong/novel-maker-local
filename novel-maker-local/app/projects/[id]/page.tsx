'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProjectStore, Project, WRITING_STYLES } from '@/store/useProjectStore';
import Tabs from '@/components/Tabs';
import EpisodeEditor from '@/components/EpisodeEditor';
import CharacterCard from '@/components/CharacterCard';
import MemoEditor from '@/components/MemoEditor';
import WorldSettingEditor from '@/components/WorldSettingEditor';
import TermEditor from '@/components/TermEditor';
import EventEditor from '@/components/EventEditor';
import ItemEditor from '@/components/ItemEditor';
import Image from 'next/image';
import Link from 'next/link';

const GENRE_OPTIONS = [
  '로맨스', '판타지', '현대물', '사극', '액션', '스릴러', '미스터리', 
  '코미디', '드라마', 'SF', '호러', '무협', '학원물', '직장물', 
  '가족물', '성장물', '복수물', '환생물', '회귀물', '빙의물'
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { 
    projects, 
    updateProject, 
    deleteProject, 
    exportProject, 
    importProject, 
    clearAllData,
    getGrokApiKey,
    setGrokApiKey
  } = useProjectStore();
  
  const project = projects.find(p => p.id === projectId);
  const [activeTab, setActiveTab] = useState('episodes');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: project?.title || '',
    synopsis: project?.synopsis || '',
    genres: project?.genres || [],
    writingStyle: project?.writingStyle || '',
    coverImage: project?.coverImage || '',
  });
  const [apiKey, setApiKey] = useState(getGrokApiKey());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">작품을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 작품이 존재하지 않거나 삭제되었습니다.</p>
          <Link 
            href="/projects"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            작품 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProject = () => {
    updateProject(projectId, editData);
    setIsEditing(false);
  };

  const handleDeleteProject = () => {
    if (confirm('정말로 이 작품을 삭제하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.')) {
      deleteProject(projectId);
      router.push('/projects');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditData({ ...editData, coverImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = () => {
    const jsonData = exportProject(projectId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}_backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportNovel = () => {
    if (!project) return;
    
    const novelContent = project.episodes
      .filter(ep => ep.novelContent)
      .sort((a, b) => a.number - b.number)
      .map(ep => `${ep.number}화. ${ep.title}\n\n${ep.novelContent}`)
      .join('\n\n' + '='.repeat(50) + '\n\n');
    
    if (!novelContent) {
      alert('소설화된 회차가 없습니다.');
      return;
    }
    
    const fullNovel = `${project.title}\n\n${project.synopsis}\n\n${'='.repeat(50)}\n\n${novelContent}`;
    
    const blob = new Blob([fullNovel], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title}_완성소설.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          try {
            importProject(e.target.result as string);
            alert('프로젝트를 성공적으로 가져왔습니다.');
          } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearData = () => {
    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      clearAllData();
      router.push('/projects');
    }
  };

  const handleSaveApiKey = () => {
    setGrokApiKey(apiKey);
    alert('API 키가 저장되었습니다.');
  };

  const toggleGenre = (genre: string) => {
    setEditData({
      ...editData,
      genres: editData.genres.includes(genre)
        ? editData.genres.filter(g => g !== genre)
        : [...editData.genres, genre]
    });
  };

  const tabs = [
    {
      id: 'episodes',
      label: '회차 줄거리',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'characters',
      label: '등장인물',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'worldsettings',
      label: '세계관 설정',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'terms',
      label: '용어 사전',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'events',
      label: '사건 연표',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'items',
      label: '아이템/마법',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'memo',
      label: '자유 메모',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      id: 'settings',
      label: '설정',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/projects"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">작품 관리</h1>
          </div>

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {isEditing ? (
              <div className="space-y-6">
                <div className="flex items-start gap-6">
                  {/* Cover Image Edit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      표지 이미지
                    </label>
                    <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden">
                      {editData.coverImage ? (
                        <Image
                          src={editData.coverImage}
                          alt="Cover"
                          width={128}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        변경
                      </button>
                    </div>
                  </div>

                  {/* Project Details Edit */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        작품 제목
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
                        시놉시스
                      </label>
                      <textarea
                        value={editData.synopsis}
                        onChange={(e) => setEditData({ ...editData, synopsis: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        문체 스타일
                      </label>
                      <select
                        value={editData.writingStyle}
                        onChange={(e) => setEditData({ ...editData, writingStyle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">문체를 선택하세요 (선택사항)</option>
                        {WRITING_STYLES.map((style) => (
                          <option key={style.value} value={style.value}>
                            {style.label} - {style.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        장르
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {GENRE_OPTIONS.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`px-2 py-1 text-xs rounded border transition-colors ${
                              editData.genres.includes(genre)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData({
                        title: project.title,
                        synopsis: project.synopsis,
                        genres: project.genres,
                        writingStyle: project.writingStyle || '',
                        coverImage: project.coverImage || '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-6">
                {/* Cover Image */}
                <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      width={128}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      편집
                    </button>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{project.synopsis}</p>
                  
                  {project.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.writingStyle && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">문체:</span> {WRITING_STYLES.find(s => s.value === project.writingStyle)?.label}
                    </div>
                  )}

                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>회차 {project.episodes.length}개</span>
                    <span>등장인물 {project.characters.length}명</span>
                    <span>최종 수정: {new Date(project.updatedAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === 'episodes' && (
            <EpisodeEditor projectId={projectId} episodes={project.episodes} characters={project.characters} />
          )}
          
          {activeTab === 'characters' && (
            <CharacterCard projectId={projectId} characters={project.characters} />
          )}
          
          {activeTab === 'worldsettings' && (
            <WorldSettingEditor 
              projectId={projectId} 
              worldSettings={Array.isArray(project.worldSettings) ? project.worldSettings : []} 
            />
          )}
          
          {activeTab === 'terms' && (
            <TermEditor projectId={projectId} terms={project.terms || []} />
          )}
          
          {activeTab === 'events' && (
            <EventEditor 
              projectId={projectId} 
              events={project.events || []} 
              characters={project.characters}
              episodes={project.episodes}
            />
          )}
          
          {activeTab === 'items' && (
            <ItemEditor 
              projectId={projectId} 
              items={project.items || []} 
              characters={project.characters}
            />
          )}
          
          {activeTab === 'memo' && (
            <MemoEditor projectId={projectId} memos={project.memos || []} />
          )}
          
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">설정</h3>
              
              {/* API 설정 */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-md font-medium mb-4">AI 소설 생성 설정</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grok API 키
                    </label>
                    <p className="text-sm text-gray-600 mb-3">
                      Grok API를 사용하여 회차 줄거리를 소설로 변환합니다. 
                      <a 
                        href="https://console.x.ai/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline ml-1"
                      >
                        여기서 API 키를 발급받으세요.
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleSaveApiKey}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        저장
                      </button>
                    </div>
                    {getGrokApiKey() && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ API 키가 설정되었습니다. 이제 회차 줄거리를 소설로 변환할 수 있습니다.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Export/Import */}
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="text-md font-medium mb-4">데이터 관리</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">프로젝트 백업</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      현재 작품의 모든 데이터를 JSON 파일로 내보냅니다.
                    </p>
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      JSON으로 내보내기
                    </button>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">완성 소설 내보내기</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      소설화된 모든 회차를 하나의 텍스트 파일로 내보냅니다.
                    </p>
                    <button
                      onClick={handleExportNovel}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      완성 소설 다운로드
                    </button>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">프로젝트 복원</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      JSON 파일에서 작품 데이터를 가져옵니다.
                    </p>
                    <input
                      ref={importInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => importInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      JSON에서 가져오기
                    </button>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <h4 className="text-md font-medium text-red-800 mb-4">위험 구역</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">작품 삭제</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      이 작품과 관련된 모든 데이터가 영구적으로 삭제됩니다.
                    </p>
                    <button
                      onClick={handleDeleteProject}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      작품 삭제
                    </button>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">모든 데이터 삭제</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      모든 작품과 데이터가 영구적으로 삭제됩니다.
                    </p>
                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                    >
                      모든 데이터 삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
} 