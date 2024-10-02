const {
  compressImageWithSharp,
  ensureDirectoryExists,
  extractMathTextFromImageUsingMathPix,
  generatePrompt,
  chatCompletionWithOpenAi,
  constructFullText,
} = require("../utils/utils");
const path = require("path");
const {
  TextractClient,
  DetectDocumentTextCommand,
} = require("@aws-sdk/client-textract");
const fs = require("fs");

const handleResponse = require("../utils/response");

// // Configure AWS Textract client
const textractClient = new TextractClient({
  region: "us-west-2", // e.g., 'us-west-2'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

exports.analyze = async (req, res, next) => {
  try {
    const { questionType, questionFormat } = req.body;

    let responseDataObj;

    if (questionFormat === "image") {
      // compress image with sharp to reduce latency with Mathpix API
      const bufferResponse = await compressImageWithSharp(
        req?.files?.imageFile?.tempFilePath,
        next
      );

      let prompt;

      // take the compressed image and pass to MATHPIX API - for math
      if (questionType === "math") {
        const compressedImageDirectory = path.join(
          __dirname,
          "../compressed-images"
        );

        //ensure directory exist
        ensureDirectoryExists(compressedImageDirectory);

        const compressedImageLocation = `${path.join(
          compressedImageDirectory,
          req?.files?.imageFile?.name
        )}`;

        console.log(compressedImageLocation);

        fs.writeFileSync(compressedImageLocation, bufferResponse);

        const mathData = await extractMathTextFromImageUsingMathPix(
          compressedImageLocation,
          next
        );

        console.log(mathData, "mathData");

        fs.unlinkSync(compressedImageLocation); // clean up before returning
        if (mathData?.error) {
          return handleResponse(
            res,
            400,
            "The system encountered an error while reading the image"
          );
        }

        console.log(mathData);

        // generate the prompt
        prompt = generatePrompt({
          promptType: "mathPrompt",
          problemText: mathData?.text,
        });
      } else if (questionType === "misc") {
        try {
          // Call AWS Textract using async/await
          const command = new DetectDocumentTextCommand({
            Document: { Bytes: bufferResponse },
          });
          const data = await textractClient.send(command);

          // if textract api call is successful
          if (data?.$metadata?.httpStatusCode === 200) {
            // then construct full text retrieval since textract
            // splits text into blocks of lines/words
            const fullText = constructFullText(data?.Blocks, "LINE");
            console.log(fullText);

            // generate the prompt
            prompt = generatePrompt({
              promptType: "miscPrompt",
              problemText: fullText,
            });
          } else {
            return handleResponse(res, 500, "There is an error");
          }
        } catch (error) {
          console.log(error);
          return handleResponse(res, 500, "There is an error");
        }
      }

      // OPEN AI Chat completion
      const response = await chatCompletionWithOpenAi({ prompt }, next);

      if (response && response?.choices && response?.choices?.length) {
        responseDataObj = response;
      } else {
        return handleResponse(res, 500, "Failed to get a response");
      }
    }

    if (questionFormat === "text") {
      let prompt;
      if (questionType === "math") {
        // generate the prompt
        prompt = generatePrompt({
          promptType: "mathPrompt",
          problemText: req?.body?.questionText?.trim(),
        });
      } else if (questionType === "misc") {
        // generate the prompt
        prompt = generatePrompt({
          promptType: "miscPrompt",
          problemText: req?.body?.questionText?.trim(),
        });
      }

      // Speak to OPEN AI Chat completion directly
      const response = await chatCompletionWithOpenAi({ prompt }, next);

      if (response && response?.choices && response?.choices?.length) {
        responseDataObj = response;
      } else {
        return handleResponse(res, 500, "Failed to get a response");
      }
    }

    // since the response from OPEN AI is in latex format
    // and OpenAI uses \n to denote line break
    console.log(responseDataObj?.choices[0]?.message);
    const content =
      typeof responseDataObj?.choices[0]?.message === "string"
        ? responseDataObj?.choices[0]?.message
        : responseDataObj?.choices[0]?.message?.content;

    return handleResponse(res, 200, "Successful", {
      solution: content,
      questionFormat,
      questionType,
    });
  } catch (error) {
    return next(error);
  }
};
