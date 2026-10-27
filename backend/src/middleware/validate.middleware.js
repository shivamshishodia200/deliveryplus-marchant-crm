export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data provided.',
        details: error.errors?.map((err) => ({
          field: err.path.join('.'),
          message: err.message
        })) || []
      }
    });
  }
};
