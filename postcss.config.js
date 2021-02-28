module.exports = ({ mode }) => {
    const plugins = [require('autoprefixer'),require('tailwindcss')];
    if (mode === 'production') {
        plugins.push('cssnano');
    }

    return { plugins };
};

