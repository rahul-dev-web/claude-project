// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Groq API error
  if (err.message.includes('Groq')) {
    return res.status(503).json({
      error: 'AI service temporarily unavailable',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Database error
  if (err.message.includes('database') || err.message.includes('Supabase')) {
    return res.status(503).json({
      error: 'Database error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandler;