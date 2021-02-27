module.exports = {
    purge: {
      enabled: true,
      content: [
        "./snippets/*.liquid",
        "./sections/*.liquid",
        "./templates/*.liquid",
        "./layout/*.liquid",
      ],
    },
    theme: {
      extend: {},
    },
    variants: {},
    plugins: [],
  };
