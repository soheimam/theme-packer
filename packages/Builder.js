const consola = require('consola');
const { debounce } = require('throttle-debounce');
const webpack = require('webpack');
const getWebpackConfig = require('../webpack.config');
const logWebpackIssues = require('../utils/log-webpack-issues');

const STATES = {
    IDLE: 1,
    RUNNING: 2,
};

/** @typedef {'run'|'watch'} RunMode */

class Builder {
    constructor() {
        this.compiler = null;
        this.state = STATES.IDLE;

        // Prevent multiple files being added/deleted at once from causing multiple restarts.
        this.start = debounce(200, this.start);
        this.restart = debounce(200, this.restart);
    }

    /** @param {RunMode} mode */
    async start(mode) {
        // Close existing compiler if already running.
        await this.close();

        this.compiler = webpack(getWebpackConfig());

        if (mode === 'run') {
            this.state = STATES.RUNNING;
            this.compiler.run((error, result) => {
                logWebpackIssues(error, result);

                this.state = STATES.IDLE;
                if (result.hasErrors()) {
                    consola.info('Build attempted.');
                } else {
                    consola.success('Built!');
                }
            });
        } else if (mode === 'watch') {
            this.compiler.watch({}, (error, result) => {
                logWebpackIssues(error, result);

                this.state = STATES.RUNNING;
                if (result.hasErrors()) {
                    consola.info('Build attempted...');
                } else {
                    consola.success('Successfully built!');
                }
            });
        }
    }

    async close() {
        if (!this.compiler) {
            this.state = STATES.IDLE;
            return Promise.resolve();
        }

        this.compiler.close(() => {
            this.state = STATES.IDLE;
            Promise.resolve();
        });
    }

    /** @param {RunMode} mode */
    async restart(mode) {
        consola.info('Restarting...');
        this.start(mode);
    }
}

module.exports = Builder;