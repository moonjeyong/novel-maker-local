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
    
    const requestData = {
      model: 'grok-3',
      messages: [
        {
          role: "system",
          content: `당신은 전문 웹소설 작가이자 S급 웹툰 콘티 작가입니다.

【웹소설 작성 시】 5000자 이상 분량으로 작성
【콘티 작성 시】 S급 일본 만화 + 한국 웹툰 스타일 융합`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.8
    };

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestData)
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      return NextResponse.json({ content });
    } else {
      throw new Error('No content generated');
    }
    
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
