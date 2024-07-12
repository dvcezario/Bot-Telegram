// instagram.js

const { IgApiClient } = require('instagram-private-api');
require('dotenv').config(); // Para carregar as variáveis de ambiente do arquivo .env

const ig = new IgApiClient();

/**
 * Função para determinar a saudação baseada no horário.
 * @returns {string} - Saudação apropriada baseada no horário atual.
 */
function getSaudacao() {
    const horaAtual = new Date().getHours();
    if (horaAtual < 12) {
        return "Bom dia";
    } else if (horaAtual < 18) {
        return "Boa tarde";
    } else {
        return "Boa noite";
    }
}

/**
 * Função para simular tempo de digitação.
 * @param {number} ms - Tempo em milissegundos para simular a digitação.
 * @returns {Promise} - Retorna uma promessa que resolve após o tempo especificado.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Função para enviar mensagem de boas-vindas no Instagram.
 * @param {string} userId - ID do usuário no Instagram.
 * @param {string} username - Nome de usuário no Instagram.
 */
async function enviarMensagemBoasVindasInstagram(userId, username) {
    const saudacao = getSaudacao();
    const mensagem = `
${saudacao}, ${username}! 🌟 Bem-vindo(a) ao Década da Sorte! 🌟

Estamos muito felizes em ter você aqui com a gente! 🎉 Prepare-se para uma jornada emocionante cheia de sorte e prêmios incríveis. Aqui, cada número acertado é um passo mais perto do grande prêmio!

Não deixe de acompanhar nosso conteúdo e ficar por dentro de todas as novidades, dicas e atualizações. Estamos sempre postando algo novo para tornar sua experiência ainda mais divertida e cheia de sorte!

Se você tiver qualquer dúvida ou precisar de mais informações, estamos à disposição. Clique no link abaixo para falar diretamente com a gente pelo WhatsApp. Será um prazer ajudar!

👉https://wa.me/5531995384968?text=Ol%C3%A1%2C+quero+participar+do+D%C3%A9cada+da+Sorte%21

Boa sorte e que sua jornada no Década da Sorte seja cheia de grandes conquistas! 🍀
`;
    try {
        const typingDuration = Math.floor(Math.random() * 25000) + 5000; // 5 a 30 segundos
        console.log(`📝 Simulando digitação por ${typingDuration / 1000} segundos...`);
        await sleep(typingDuration);

        await ig.entity.directThread([userId.toString()]).broadcastText(mensagem);
        console.log(`📨 Mensagem de boas-vindas enviada para ${username} (${userId}) no Instagram`);
    } catch (error) {
        console.error(`Erro ao enviar mensagem de boas-vindas para ${username} (${userId}) no Instagram:`, error);
    }
}

/**
 * Função para rastrear novos seguidores no Instagram.
 */
async function rastrearNovosSeguidoresInstagram() {
    let numeroSeguidoresAntigos = 0;
    const seguidoresAntigos = new Set();

    const obterNumeroSeguidores = async () => {
        const userInfo = await ig.user.info(ig.state.cookieUserId);
        return userInfo.follower_count;
    };

    const obterSeguidores = async () => {
        const seguidoresFeed = ig.feed.accountFollowers();
        const seguidores = new Set();

        do {
            const seguidoresPage = await seguidoresFeed.items();
            seguidoresPage.forEach(user => seguidores.add(user.pk));
        } while (seguidoresFeed.isMoreAvailable());

        return seguidores;
    };

    try {
        numeroSeguidoresAntigos = await obterNumeroSeguidores();
        console.log(`🔍 Número inicial de seguidores: ${numeroSeguidoresAntigos}`);
        (await obterSeguidores()).forEach(pk => seguidoresAntigos.add(pk));

        setInterval(async () => {
            try {
                const numeroSeguidoresAtuais = await obterNumeroSeguidores();
                console.log(`🔍 Número atual de seguidores: ${numeroSeguidoresAtuais}`);

                if (numeroSeguidoresAtuais > numeroSeguidoresAntigos) {
                    const seguidoresAtuais = await obterSeguidores();
                    const novosSeguidores = Array.from(seguidoresAtuais).filter(pk => !seguidoresAntigos.has(pk));

                    if (novosSeguidores.length > 0) {
                        console.log(`✨ Novos seguidores detectados: ${novosSeguidores.length}`);
                        for (const seguidor of novosSeguidores) {
                            const userInfo = await ig.user.info(seguidor);
                            const username = userInfo.username;
                            await enviarMensagemBoasVindasInstagram(seguidor, username);
                            console.log(`🔔 Novo seguidor: ${username} (${seguidor})`);
                            seguidoresAntigos.add(seguidor);
                        }
                    } else {
                        console.log('🔍 Nenhum novo seguidor detectado.');
                    }

                    numeroSeguidoresAntigos = numeroSeguidoresAtuais;
                }
            } catch (error) {
                console.error('Erro ao rastrear novos seguidores no Instagram:', error);
                if (error.name === 'IgResponseError' && error.response && error.response.statusCode === 401) {
                    console.log('🔄 Aguardando 5 minutos antes de tentar novamente devido ao erro 401.');
                    await sleep(300000); // Aguarda 5 minutos antes de tentar novamente
                }
            }
        }, 300000); // Verifica novos seguidores a cada 5 minutos
    } catch (error) {
        console.error('Erro inicial ao obter seguidores no Instagram:', error);
        if (error.name === 'IgResponseError' && error.response && error.response.statusCode === 401) {
            console.log('🔄 Aguardando 5 minutos antes de tentar novamente devido ao erro 401.');
            await sleep(300000); // Aguarda 5 minutos antes de tentar novamente
            rastrearNovosSeguidoresInstagram(); // Tenta novamente após o intervalo
        }
    }
}

/**
 * Função para resolver o checkpoint.
 */
async function resolverCheckpoint() {
    const challengeUrl = await ig.challenge.auto(true); // Tenta resolver automaticamente o checkpoint
    if (challengeUrl) {
        console.log('⚠️ Desafio de verificação necessário. Por favor, resolva manualmente no navegador.');
        console.log(`Link para resolver o desafio: ${challengeUrl}`);
    } else {
        console.log('✅ Desafio de verificação resolvido automaticamente.');
    }
}

/**
 * Função para conectar ao Instagram.
 */
async function connectToInstagram() {
    ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
    try {
        await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
        console.log('✅ Conectado ao Instagram');

        const userInfo = await ig.user.info(ig.state.cookieUserId);
        console.log(`🔍 Número de seguidores no momento da conexão: ${userInfo.follower_count}`);

        rastrearNovosSeguidoresInstagram();
    } catch (error) {
        if (error.name === 'IgCheckpointError') {
            console.log('⚠️ Checkpoint necessário. Tentando resolver...');
            await resolverCheckpoint();
            try {
                await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
                console.log('✅ Conectado ao Instagram após resolver o checkpoint');

                const userInfoAfterCheckpoint = await ig.user.info(ig.state.cookieUserId);
                console.log(`🔍 Número de seguidores no momento da conexão após resolver o checkpoint: ${userInfoAfterCheckpoint.follower_count}`);

                rastrearNovosSeguidoresInstagram();
            } catch (err) {
                console.error('❌ Erro ao conectar ao Instagram após resolver o checkpoint:', err);
            }
        } else if (error.name === 'IgLoginTwoFactorRequiredError') {
            const { username, two_factor_identifier } = error.response.body.two_factor_info;
            console.log('⚠️ Autenticação de dois fatores necessária. Usando o código 2FA do .env');
            
            try {
                await ig.account.twoFactorLogin({
                    username,
                    verificationCode: process.env.INSTAGRAM_2FA_CODE,
                    twoFactorIdentifier: two_factor_identifier,
                    verificationMethod: '1', // 1 para SMS, 0 para TOTP
                    trustThisDevice: '1'
                });
                console.log('✅ Autenticação de dois fatores concluída. Conectado ao Instagram');

                const userInfoAfter2FA = await ig.user.info(ig.state.cookieUserId);
                console.log(`🔍 Número de seguidores no momento da conexão após 2FA: ${userInfoAfter2FA.follower_count}`);

                rastrearNovosSeguidoresInstagram();
            } catch (err) {
                console.error('❌ Erro ao completar a autenticação de dois fatores:', err);
            }
        } else {
            console.error('❌ Erro ao conectar ao Instagram:', error);
        }
    }
}

module.exports = {
    connectToInstagram,
    enviarMensagemBoasVindasInstagram,
    rastrearNovosSeguidoresInstagram
};
