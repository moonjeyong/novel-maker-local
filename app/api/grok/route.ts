const model = 'grok-3';
console.log(`\n=== Using model: ${model} ===`);

const requestData = {
  model: model,
  messages: [
    {
      role: "system",
      content: `당신은 전문 웹소설 작가입니다. 다음 요구사항을 반드시 지켜주세요:
1. 회차당 컷 수는 최소 60컷 이상으로 작성하세요.
2. 인물 성격은 에피소드 전반에 일관되게 유지해주세요.
3. 대사와 행동 묘사를 구분해서 작성해주세요.`,
    }
  ]
};
