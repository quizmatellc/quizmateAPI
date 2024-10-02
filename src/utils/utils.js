const { validationResult } = require("express-validator");
const fs = require("fs");
const sharp = require("sharp");
const axios = require("axios");
const FormData = require("form-data");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

// Function to ensure a directory exists
exports.ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    // Recursive option allows creating nested directories if needed
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return;
};

exports.compressImageWithSharp = async (imageFilePath, next) => {
  try {
    // using sharp

    // Retrieve information about the image
    const metadata = await sharp(imageFilePath).metadata();

    // Use Sharp to optimize the image with a quality reduction
    const optimizedImageBuffer = await sharp(imageFilePath)
      .toFormat(metadata.format, { quality: 40 }) // Use the original image format
      .toBuffer();

    return optimizedImageBuffer;
  } catch (error) {
    return next(error);
  }
};

exports.extractMathTextFromImageUsingMathPix = async (imageFilePath, next) => {
  try {
    let formData = new FormData();
    formData.append("file", fs.createReadStream(imageFilePath));
    formData.append("options_json", JSON.stringify({ rm_spaces: true }));

    const response = await axios.post(
      "https://api.mathpix.com/v3/text",
      formData,
      {
        headers: {
          app_id: process.env.MATHPIX_APP_ID,
          app_key: process.env.MATHPIX_APP_KEY,
        },
      }
    );
    return response?.data;
  } catch (error) {
    return next(error);
  }
};

exports.generatePrompt = ({ promptType, problemText }) => {
  const prompts = {
    //     mathPrompt: `You are a highly skilled and detailed math homework assistant. Your task is to solve the following math problem and provide a detailed step-by-step solution. If applicable, verify your solution by plugging it back into the original equation.

    // Note: This prompt is exclusively for math-related problems. If the problem is outside the scope of mathematics, please do not provide a solution.

    // **Problem (can be in plain text or LaTeX format):**
    // ${problemText}

    // **Guidelines:**
    // 1. Simplify the problem step-by-step.
    // 2. Explain each step clearly.
    // 3. If there are multiple ways to solve the problem, choose the most efficient one and briefly mention the alternatives.
    // 4. If the problem is ambiguous or missing information, specify the assumptions you are making and solve accordingly.
    // 5. Verify your final answer if possible.
    // 6. Use appropriate mathematical notation and formatting in LaTeX if suitable.

    // **Provide the solution below in LaTeX format:**

    // latex
    // % Given Problem:
    // Find the derivative of the function \( f(x) = 3x^2 + 2x - 5 \).

    // % Solution:
    // To find the derivative of the function \( f(x) = 3x^2 + 2x - 5 \), we apply the power rule:

    // \[
    // f'(x) = \frac{d}{dx}(3x^2 + 2x - 5) = 3 \cdot 2x^{2-1} + 2 \cdot x^{1-1} - 0
    // \]

    // Simplifying each term:

    // \[
    // f'(x) = 6x + 2
    // \]

    // Therefore, the derivative of the function \( f(x) = 3x^2 + 2x - 5 \) is \( f'(x) = 6x + 2 \).
    // `,
    //     miscPrompt: `You are an expert assistant capable of handling a wide range of miscellaneous questions. Your task is to provide a detailed, articulate, and accurate response to the following question. The question can pertain to any topic, including but not limited to general knowledge, history, science, technology, culture, literature, and more.

    // Note: This prompt is designed for non-mathematical and non-calculative questions. Please ensure your response is in plain text and avoids mathematical notations or calculations.

    // Question:
    // ${problemText}

    // Guidelines:
    // 1. Understand the Question: Ensure you grasp the full context of the question before formulating your response.
    // 2. Detailed Explanation: Provide a comprehensive and detailed answer, explaining any relevant concepts, context, or background information.
    // 3. Clarity and Coherence: Ensure your response is clear and easy to understand. Avoid jargon unless necessary and provide explanations for any technical terms used.
    // 4. Use Appropriate Examples: Illustrate your points with relevant examples or case studies where applicable.
    // 5. Verify Information: Cross-check facts to ensure accuracy. Provide references if the response relies on specific sources.
    // 6. Scope and Relevance: Stay within the scope of the question. If the question is ambiguous, state any assumptions you are making in your response.

    // Example Response:

    // Question: What are some of the key challenges in developing artificial intelligence?

    // Response:
    // Developing artificial intelligence (AI) involves several significant challenges, including:

    // 1. Data Quality and Quantity: AI systems require vast amounts of high-quality data to learn effectively. Inadequate, biased, or noisy data can severely impact the performance and accuracy of AI models.

    // 2. Computational Resources: Training sophisticated AI models, especially deep learning networks, demands substantial computational power and resources, which can be costly and resource-intensive.

    // 3. Ethical Considerations: Ensuring that AI systems are developed and deployed ethically is a major challenge. Issues such as bias, fairness, transparency, and accountability need to be addressed to prevent harm and ensure trust in AI technologies.

    // 4. Interpretability and Explainability: Many AI models, particularly deep learning networks, function as 'black boxes', making it difficult to understand how they make decisions. Enhancing the interpretability of AI systems is critical for trust and validation.

    // 5. Legal and Regulatory Compliance: Navigating the evolving legal and regulatory landscape is essential for AI development. Compliance with data protection laws, industry standards, and ethical guidelines is necessary to avoid legal repercussions and maintain public trust.

    // By addressing these challenges, developers can create more robust, reliable, and ethical AI systems that benefit society.

    // Provide the detailed answer below in plain text:
    // `,

    mathPrompt: `You are a highly skilled and detailed math homework assistant. Your task is to solve the following math problem and provide a detailed step-by-step solution. If applicable, verify your solution by plugging it back into the original equation.

Problem (can be in plain text or LaTeX format):
${problemText}

Guidelines:

1. If there are multiple choice options, provide the answer first, then follow up with a detailed explanation.
2. Simplify the problem step-by-step.
3. Explain each step clearly.
4. If there are multiple ways to solve the problem, choose the most efficient one and briefly mention the alternatives.
5. If the problem is ambiguous or missing information, specify the assumptions you are making and solve accordingly.
6. Verify your final answer if possible.
7. Use appropriate mathematical notation and formatting in LaTeX if suitable.

Provide the solution below in LaTeX format:

Here's an example applying these guidelines:

Example Problem:

Find the derivative of the function ( f(x) = 3x^2 + 2x - 5 ).

Solution:

Answer: The derivative of the function ( f(x) = 3x^2 + 2x - 5 ) is ( f'(x) = 6x + 2 ).

Explanation:

To find the derivative of the function ( f(x) = 3x^2 + 2x - 5 ), we apply the power rule. The power rule states that (\frac{d}{dx}[x^n] = nx^{n-1}).

So, we differentiate each term separately:

[ f'(x) = \frac{d}{dx}(3x^2 + 2x - 5) = 3 \cdot 2x^{2-1} + 2 \cdot x^{1-1} - 0 ]

Simplifying each term, we get:

[ f'(x) = 6x + 2 ]

Therefore, the derivative of the function ( f(x) = 3x^2 + 2x - 5 ) is ( f'(x) = 6x + 2 ).`,
    miscPrompt: `You are an expert assistant capable of handling a wide range of miscellaneous questions. Your task is to provide a detailed, articulate, and accurate response to the following question. The question can pertain to any topic, including but not limited to general knowledge, history, science, technology, culture, literature, and more.

Note: This prompt is designed for non-mathematical and non-calculative questions. Please ensure your response is in plain text and avoids mathematical notations or calculations.

Question:
${problemText}

Guidelines:

1. Understand the Question: Ensure you grasp the full context of the question before formulating your response.
2. If there are multiple choice options, provide the answer first, then follow up with a detailed explanation.
3. Detailed Explanation: Provide a comprehensive and detailed answer, explaining any relevant concepts, context, or background information.
4. Clarity and Coherence: Ensure your response is clear and easy to understand. Avoid jargon unless necessary and provide explanations for any technical terms used.
5. Use Appropriate Examples: Illustrate your points with relevant examples or case studies where applicable.
6. Verify Information: Cross-check facts to ensure accuracy. Provide references if the response relies on specific sources.
7. Scope and Relevance: Stay within the scope of the question. If the question is ambiguous, state any assumptions you are making in your response.

Example Response:

Question: What are some of the key challenges in developing artificial intelligence?

Response:

Answer: The key challenges in developing artificial intelligence include data quality and quantity, computational resources, ethical considerations, interpretability and explainability, and legal and regulatory compliance.

Detailed Explanation:

Developing artificial intelligence (AI) involves several significant challenges, including:

1. Data Quality and Quantity: AI systems require vast amounts of high-quality data to learn effectively. Inadequate, biased, or noisy data can severely impact the performance and accuracy of AI models.

2. Computational Resources: Training sophisticated AI models, especially deep learning networks, demands substantial computational power and resources, which can be costly and resource-intensive.

3. Ethical Considerations: Ensuring that AI systems are developed and deployed ethically is a major challenge. Issues such as bias, fairness, transparency, and accountability need to be addressed to prevent harm and ensure trust in AI technologies.

4. Interpretability and Explainability: Many AI models, particularly deep learning networks, function as 'black boxes', making it difficult to understand how they make decisions. Enhancing the interpretability of AI systems is critical for trust and validation.

5. Legal and Regulatory Compliance: Navigating the evolving legal and regulatory landscape is essential for AI development. Compliance with data protection laws, industry standards, and ethical guidelines is necessary to avoid legal repercussions and maintain public trust.

By addressing these challenges, developers can create more robust, reliable, and ethical AI systems that benefit society.

Provide the detailed answer below in plain text:
`,
  };

  return prompts[promptType];
};

exports.chatCompletionWithOpenAi = async (
  { model = "gpt-3.5-turbo", prompt },
  next
) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "system",
            content: "You are a highly skilled math homework assistant.",
          },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response?.data;
  } catch (error) {
    return next(error);
  }
};

/**
 * Construct full text from blocks of given type.
 *
 * @param {Array} blocks - The blocks from Textract response.
 * @param {string} blockType - The type of blocks to construct text from.
 */
exports.constructFullText = (blocks, blockType) => {
  let text = "";
  blocks.forEach((block) => {
    if (block.BlockType === blockType) {
      text += block.Text + " "; // Append each block text with a space
    }
  });
  return text.trim(); // Trim trailing spaces
};
