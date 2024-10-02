const { body } = require("express-validator");

exports.analyseValidator = [
  body("questionType")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (questionType) => {
      if (questionType) {
        if (!["misc", "math"].includes(questionType)) {
          throw new Error("Question type does not exist");
        }
      }

      return true;
    }),
  body("questionFormat")
    .not()
    .isEmpty()
    .withMessage("Cannot be empty")
    .isString()
    .withMessage("Should be a string")
    .custom(async (questionFormat) => {
      if (questionFormat) {
        if (!["image", "text"].includes(questionFormat)) {
          throw new Error("Question format does not exist");
        }
      }

      return true;
    }),
  body("questionText").custom((value, { req }) => {
    if (req.body.questionFormat === "text") {
      if (!value) {
        throw new Error("Cannot be empty");
      }
      if (typeof value !== "string") {
        throw new Error("Should be a string");
      }
    }
    return true;
  }),
  body("imageFile").custom(async (value, { req }) => {
    if (req?.body?.questionFormat !== "image") {
      return true;
    } else {
      if (req.files?.imageFile) {
        if (
          !["image/png", "image/jpg", "image/jpeg"].includes(
            req.files?.imageFile?.mimetype
          )
        ) {
          throw new Error("File is not in a valid format");
        } else if (req.files?.imageFile?.size > 5000000) {
          throw new Error("File size is more than 5MB");
        }

        return true;
      } else {
        throw new Error("Upload an image");
      }
    }
  }),
];
