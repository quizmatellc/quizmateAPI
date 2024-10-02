const chatCompletionSampleData = {
  id: "chatcmpl-9kAW6oEnHVvFBIUGcMON9xFTzgwCJ",
  object: "chat.completion",
  created: 1720790542,
  model: "gpt-4o-2024-08-06",
  choices: [
    {
      index: 0,
      message: [Object],
      logprobs: null,
      finish_reason: "stop",
    },
  ],
  usage: { prompt_tokens: 463, completion_tokens: 790, total_tokens: 1253 },
  system_fingerprint: null,
};

const mathPixSampleData = {
  request_id: "2024_07_12_474f65502ad642fb0119g",
  version: "RSK-M131p6i3",
  image_width: 842,
  image_height: 538,
  is_printed: true,
  is_handwritten: false,
  auto_rotate_confidence: 0,
  auto_rotate_degrees: 0,
  confidence: 0.44884204864501953,
  confidence_rate: 0.44884204864501953,
  latex_styled:
    "\\begin{array}{l}\n" +
    "\\int_{0}^{1}\\left(x^{2}-3 x\\right) d x \\\\\n" +
    "\\int_{1}^{\\infty} x^{-2} d x \\\\\n" +
    "\\int \\frac{x^{2}-3 x}{3 x} d x \\\\\n" +
    "\\int_{2}^{4} x \\sqrt{x^{2}-4} d x\n" +
    "\\end{array}",
  text: "\\( \\begin{array}{l}\\int_{0}^{1}\\left(x^{2}-3 x\\right) d x \\\\ \\int_{1}^{\\infty} x^{-2} d x \\\\ \\int \\frac{x^{2}-3 x}{3 x} d x \\\\ \\int_{2}^{4} x \\sqrt{x^{2}-4} d x\\end{array} \\)",
};
