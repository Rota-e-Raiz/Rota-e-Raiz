export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Falha na validação dos dados",
      errors: error.errors
    });
  }
};