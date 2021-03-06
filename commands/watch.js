const path = require('path');
const chokidar = require('chokidar');
const consola = require('consola');
const themeKit = require('@shopify/themekit');
const ensureDirectoryExists = require('../utils/ensure-directory-exists');
const Config = require('../packages/Config');
const getShopifyEnvKeys = require('../utils/get-shopify-env-keys');
const Watcher = require('../packages/Watcher');

const watch = async ({ env }) => {
    try {
        ensureDirectoryExists(Config.get('paths.theme.dist'));

        themeKit.command('watch', {
            config: path.resolve(__dirname, '..', 'config.yml'),
            dir: Config.get('paths.theme.dist'),
            ...getShopifyEnvKeys(env),
        });
    } catch (error) {
        consola.error(error);
    }

    const server = new Watcher();
    await server.start();

    chokidar
        .watch(Config.get('paths.theme.src'), { ignoreInitial: true })
        .on('all', async (event, filepath) => {
            const changeInLayoutOrTemplatesDir = [
                Config.get('paths.theme.src.scripts.layout'),
                Config.get('paths.theme.src.scripts.templates'),
            ].some(dirPath => filepath.startsWith(dirPath));
            const restartEvent = ['add', 'unlink'].includes(event);

            if (changeInLayoutOrTemplatesDir && restartEvent) {
                await server.close();
                server.start();
            }
        });
};

module.exports = watch;
