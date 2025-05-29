// 이전 회차들의 맥락 정보 수집
const previousEpisodes = project.episodes
  .filter(ep => ep.number < episode.number)
  .sort((a, b) => a.number - b.number)
  .map(ep => `${ep.number}화: ${ep.title}
줄거리: ${ep.summary}
${ep.novelContent ? `내용: ${ep.novelContent.substring(0, 500)}...` : ''}`)
  .join('\n\n==========\n\n');

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

// 등장인물 정보 상세 수집
const characterInfo = project.characters.map(char => {
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
}).filter(info => info.length > 0).join('\n\n');

// generateNovelContent 함수 내부
const episode = project.episodes.find((e) => e.id === episodeId);
if (!episode) {
  throw new Error('회차를 찾을 수 없습니다.');
}

// 이번 회차 등장인물 정보만 상세하게 수집
const appearingCharacterInfo = project.characters
  .filter(char => episode.appearingCharacters.includes(char.id))
  .map(char => {
    const details = [];
    if (char.name) details.push(`이름: ${char.name}`);
    if (char.age) details.push(`나이: ${char.age}`);
    if (char.occupation) details.push(`직업: ${char.occupation}`);
    if (char.personality) details.push(`성격: ${char.personality}`);
    if (char.appearance) details.push(`외모: ${char.appearance}`);
    if (char.family) details.push(`가족관계: ${char.family}`);
    if (char.mbti) {
      const mbtiTraits = getMbtiTraits(char.mbti);  // MBTI 특성을 성격 설명으로 변환
      if (mbtiTraits) details.push(`성격 특성: ${mbtiTraits}`);
    }
    if (char.bloodType) details.push(`혈액형: ${char.bloodType}`);
    if (char.notes) details.push(`특이사항: ${char.notes}`);
    
    return details.join(', ');
  }).join('\n\n');

const prompt = `당신은 최고의 S급 웹소설 작가입니다. 다음 웹소설의 회차를 5000자 이상의 분량으로 자세히 작성해주세요.

【작품 기본 정보】
... (기존 내용)

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

【작성 요구사항】
... (기존 내용)
12. S급 웹소설 작가들의 문체 특징을 최대한 반영
13. 캐릭터의 성격은 자연스럽게 행동과 대화를 통해 표현 (MBTI나 혈액형 등은 직접적으로 언급하지 않음)

【참고사항】
... (기존 내용)
- S급 웹소설의 특징인 강한 몰입감과 중독성 있는 문체 사용
- 각 장면마다 독자가 현장에 있는 것처럼 생생하게 묘사
- 캐릭터의 대사와 행동을 통해 자연스러운 성격 표현

【이번 회차 등장인물】
${appearingCharacterInfo || '등장인물 정보가 없습니다.'}

반드시 5000자 이상의 완성도 높은 소설로 작성해주세요.`;

export interface Episode {
  id: string;
  number: number;
  title: string;
  summary: string;
  appearingCharacters?: string[];
  novelContent?: string;
  createdAt: Date;
  updatedAt: Date;
} 