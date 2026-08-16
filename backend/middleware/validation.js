const { z } = require("zod");

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation Error",
        errors: err.errors.map((e) => ({ field: e.path.join("."), message: e.message })),
      });
    }
    next(err);
  }
};

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be greater than 0").or(z.string().transform((v) => Number(v))),
  paidBy: z.string().min(1, "PaidBy user ID is required"),
  category: z.enum(["Food", "Transport", "Housing", "Entertainment", "Shopping", "General"]).optional().default("General"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE"]).optional().default("EQUAL"),
  splitAmong: z.array(z.string()).optional(),
  splitDetails: z
    .array(
      z.object({
        user: z.string(),
        amount: z.number().optional(),
        percentage: z.number().optional(),
      })
    )
    .optional(),
});

const settlementSchema = z.object({
  from: z.string().min(1, "From user ID is required"),
  to: z.string().min(1, "To user ID is required"),
  amount: z.number().positive("Amount must be positive").or(z.string().transform((v) => Number(v))),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

module.exports = {
  validateBody,
  expenseSchema,
  settlementSchema,
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
