module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/upload-resume',
        destination: 'http://127.0.0.1:8000/upload-resume',
      },
      {
        source: '/api/match',
        destination: 'http://127.0.0.1:8000/match',
      },
    ];
  },
};