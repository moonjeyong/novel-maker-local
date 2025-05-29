import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log('=== API Route Called ===');
  
  try {
    const body = await req.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = 'xai-blwB0UnbNdoYkJLqKsNCWogWKM17RXDJGcfzUYlHTI3qlXjKiN0h4Xge2yGHdIb0KsnsJXuG81pxT3lU';
    
    const modelsToTry = ['grok-3', 'grok-3-beta', 'grok-beta'];
    
    for (const model of modelsToTry) {
      const requestData = {
        model: model,
        messages: [
          {
            role: "system",
            content: `당신은 전문 웹소설 작가이자 S급 웹툰 콘티 작가입니다. 요청에 따라 다음 중 하나를 수행합니다:

【웹소설 작성 시】
1. 한국어 웹소설 스타일로 작성
2. 5000자 이상의 분량으로 작성 (매우 중요!)
3. 대화와 서술이 적절히 조화된 형태
4. 독자의 몰입감을 높이는 생생한 묘사
5. 등장인물의 성격과 특징을 정확히 반영
6. 시놉시스의 세계관과 설정을 충실히 반영
7. 회차의 줄거리를 자세히 풀어서 작성

【콘티 작성 시】
1. S급 일본 만화작가 + 한국 웹툰작가 스타일 융합
2. 드라마틱 연출 (로우앵글, 하이앵글, 버드아이뷰)
3. 감정적 몰입 극대화 (표정, 여백, 침묵 활용)
4. 요청된 컷 수를 정확히 완성 (절대 중단 금지)
5. 향상된 콘티 형식 준수:
   - 컷 번호: 크기/앵글 - 연출 의도
   - 배경: 상세 묘사 + 분위기/색감/조명
   - 인물: 동작/표정/자세 + 감정 상태
   - 대사/생각/효과음/나레이션 완벽 기입
   - 연출 포인트 명시

【공통 준수 사항】
- 절대 중간에 끊지 말고 완료까지 진행
- 요청된 분량/컷 수를 정확히 맞춤
- 고퀄리티 창작물 수준의 완성도 유지`
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.8
      };

      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (content) {
            return NextResponse.json({ content, model: model });
          }
        }
      } catch (fetchError) {
        console.error(`Error with ${model}:`, fetchError);
        continue;
      }
    }
    
    return NextResponse.json({ error: 'All models failed' }, { status: 500 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
