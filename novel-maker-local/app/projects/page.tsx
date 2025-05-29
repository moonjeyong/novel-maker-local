'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore, WRITING_STYLES } from '@/store/useProjectStore';
import ProjectCard from '@/components/ProjectCard';
import Image from 'next/image';

const GENRE_OPTIONS = [
  '로맨스', '판타지', '현대물', '사극', '액션', '스릴러', '미스터리', 
  '코미디', '드라마', 'SF', '호러', '무협', '학원물', '직장물', 
  '가족물', '성장물', '복수물', '환생물', '회귀물', '빙의물'
];

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, createProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    synopsis: '',
    genres: [] as string[],
    writingStyle: '',
    coverImage: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = () => {
    if (newProject.title.trim() && newProject.synopsis.trim()) {
      const projectId = createProject(newProject);
      router.push(`/projects/${projectId}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setNewProject({ ...newProject, coverImage: e.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleGenre = (genre: string) => {
    setNewProject({
      ...newProject,
      genres: newProject.genres.includes(genre)
        ? newProject.genres.filter(g => g !== genre)
        : [...newProject.genres, genre]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">작품 관리</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            새 작품 만들기
          </button>
        </div>

        {/* Create Project Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">새 작품 만들기</h2>
              
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    작품 제목 *
                  </label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    placeholder="작품의 제목을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    표지 이미지
                  </label>
                  <div className="flex items-center space-x-4">
                    {newProject.coverImage && (
                      <div className="w-20 h-28 relative">
                        <Image
                          src={newProject.coverImage}
                          alt="Cover preview"
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        이미지 선택
                      </button>
                      {newProject.coverImage && (
                        <button
                          type="button"
                          onClick={() => setNewProject({ ...newProject, coverImage: '' })}
                          className="ml-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          제거
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    시놉시스 *
                  </label>
                  <textarea
                    value={newProject.synopsis}
                    onChange={(e) => setNewProject({ ...newProject, synopsis: e.target.value })}
                    placeholder="작품의 줄거리를 간단히 요약해주세요"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Genres */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    장르 (다중 선택 가능)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {GENRE_OPTIONS.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          newProject.genres.includes(genre)
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Writing Style */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    문체 스타일
                  </label>
                  <select
                    value={newProject.writingStyle}
                    onChange={(e) => setNewProject({ ...newProject, writingStyle: e.target.value })}
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

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewProject({
                        title: '',
                        synopsis: '',
                        genres: [],
                        writingStyle: '',
                        coverImage: '',
                      });
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProject.title.trim() || !newProject.synopsis.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    작품 만들기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500 text-lg mb-4">아직 작품이 없습니다</div>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                첫 번째 작품 만들기
              </button>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </div>
    </div>
  );
} 