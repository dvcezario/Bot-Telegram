// utils.js

const lockfile = require('proper-lockfile');

/**
 * Função para adquirir um bloqueio em um arquivo, com tentativas de repetição em caso de falha.
 * @param {string} file - O caminho do arquivo para adquirir o bloqueio.
 * @param {number} retryInterval - O intervalo de tempo (em milissegundos) entre cada tentativa de adquirir o bloqueio.
 * @param {number} maxRetries - O número máximo de tentativas para adquirir o bloqueio.
 * @returns {Promise<Function>} - A função para liberar o bloqueio quando não for mais necessário.
 * @throws {Error} - Lança um erro se não for possível adquirir o bloqueio após o número máximo de tentativas.
 */
async function waitForLock(file, retryInterval = 500, maxRetries = 10) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const release = await lockfile.lock(file);
            return release;
        } catch (error) {
            if (error.code === 'ELOCKED') {
                console.log(`Arquivo bloqueado, tentando novamente em ${retryInterval}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryInterval));
                retries++;
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Não foi possível adquirir o bloqueio após ${maxRetries} tentativas`);
}

module.exports = {
    waitForLock
};
