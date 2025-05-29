// grok-3 모델만 사용 (상업용)
const model = 'grok-3';
console.log(`\n=== Using model: ${model} ===`);

const requestData = {
  model: model,
  messages: [
    {
      role: "system",
      content: `당신은 전문 웹소설 작가입니다. 다음 요구사항을 반드시 지켜주세요:

// ... existing code ... 