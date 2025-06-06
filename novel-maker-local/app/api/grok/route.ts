import { NextResponse } from "next/server";

export async function POST(req: Request) {
  console.log('=== API Route Called ===');
  
  try {
    // 요청 본문 파싱
    const body = await req.json();
    console.log('Request body:', body);
    
    const { prompt } = body;
    if (!prompt) {
      console.log('No prompt provided');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 하드코딩된 API 키 사용 (테스트용)
    const apiKey = 'xai-blwB0UnbNdoYkJLqKsNCWogWKM17RXDJGcfzUYlHTI3qlXjKiN0h4Xge2yGHdIb0KsnsJXuG81pxT3lU';
    console.log('Using API key:', apiKey ? 'Yes' : 'No');

    // 작동하는 모델 우선 시도
    const modelsToTry = ['grok-3', 'grok-3-beta', 'grok-beta', 'grok'];
    
    for (const model of modelsToTry) {
      console.log(`\n=== Trying model: ${model} ===`);
      
      const requestData = {
        model: model,
        messages: [
          {
            role: "system",
            content: `당신은 전문 웹소설 작가입니다. 다음 요구사항을 반드시 지켜주세요:

1. 한국어 웹소설 스타일로 작성
2. 5000자 이상의 분량으로 작성 (매우 중요!)
3. 대화와 서술이 적절히 조화된 형태
4. 독자의 몰입감을 높이는 생생한 묘사
5. 등장인물의 성격과 특징을 정확히 반영
6. 시놉시스의 세계관과 설정을 충실히 반영
7. 회차의 줄거리를 자세히 풀어서 작성

반드시 5000자 이상으로 작성해주세요. 짧게 끝내지 마세요.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 8000, // 토큰 수 대폭 증가
        temperature: 0.8, // 창의성 증가
      };
      
      console.log('Request data:', JSON.stringify(requestData, null, 2));

      try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestData),
        });

        console.log(`Response status for ${model}:`, response.status);
        console.log(`Response ok for ${model}:`, response.ok);

        const responseText = await response.text();
        console.log(`Response text length for ${model}:`, responseText.length);

        if (response.ok) {
          let responseData;
          try {
            responseData = JSON.parse(responseText);
            console.log(`Parsed response for ${model}:`, JSON.stringify(responseData, null, 2));

            const content = responseData.choices?.[0]?.message?.content;
            if (content) {
              console.log(`Success with ${model}! Generated content length:`, content.length);
              console.log(`Generated content preview:`, content.substring(0, 200) + '...');
              return NextResponse.json({ content, model: model });
            }
          } catch (parseError) {
            console.error(`Parse error for ${model}:`, parseError);
            continue;
          }
        } else {
          console.log(`Failed with ${model}, trying next...`);
          continue;
        }
      } catch (fetchError) {
        console.error(`Fetch error for ${model}:`, fetchError);
        continue;
      }
    }

    // 모든 모델이 실패한 경우
    console.error('All models failed');
    return NextResponse.json(
      { error: 'All model attempts failed', modelsAttempted: modelsToTry },
      { status: 500 }
    );

  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        type: typeof error
      },
      { status: 500 }
    );
  }
}
