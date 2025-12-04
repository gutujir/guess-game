import Joi from "joi";

export const createSessionSchema = Joi.object({
  code: Joi.string()
    .trim()
    .min(3)
    .max(20)
    .pattern(/^[a-zA-Z0-9]+$/)
    .required()
    .messages({
      "string.empty": "Session code is required",
      "string.min": "Session code must be at least 3 characters",
      "string.max": "Session code cannot exceed 20 characters",
      "string.pattern.base":
        "Session code must contain only letters and numbers",
    }),
});

export const joinSessionSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    "string.empty": "Session code is required to join",
  }),
});

export const startSessionSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    "string.empty": "Session code is required",
  }),
  question: Joi.string().trim().min(5).max(500).required().messages({
    "string.empty": "Question is required",
    "string.min": "Question must be at least 5 characters",
    "string.max": "Question cannot exceed 500 characters",
  }),
  answer: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "Answer is required",
    "string.min": "Answer must be at least 1 character",
    "string.max": "Answer cannot exceed 200 characters",
  }),
});

export const submitGuessSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    "string.empty": "Session code is required",
  }),
  guess: Joi.string().trim().min(1).max(200).required().messages({
    "string.empty": "Guess is required",
    "string.min": "Guess must be at least 1 character",
    "string.max": "Guess cannot exceed 200 characters",
  }),
});

export const leaveSessionSchema = Joi.object({
  code: Joi.string().trim().required().messages({
    "string.empty": "Session code is required",
  }),
  userId: Joi.string().optional(),
});
