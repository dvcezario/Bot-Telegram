// recompensas.js

const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { waitForLock } = require('./utils');

// Caminho para o arquivo da planilha de recompensas
const filePath = path.join(__dirname, 'recompensas.xlsx');

// Função para inicializar a planilha de recompensas
function inicializarPlanilha() {
    if (!fs.existsSync(filePath)) {
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([['Nome', 'ID', 'Telefone', 'Indicações', 'Compras', 'Rodadas Ativas', 'Recompensas']]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Recompensas');
        xlsx.writeFile(workbook, filePath);
        console.log('📊 Planilha de recompensas inicializada.');
    }
}

// Função para adicionar uma indicação
async function adicionarIndicacao(nome, id, telefone) {
    inicializarPlanilha();

    let release;
    try {
        release = await waitForLock(filePath);

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['Recompensas'];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        let encontrado = false;
        for (let i = 1; i < data.length; i++) {
            if (data[i][1] === id) {
                data[i][3] += 1; // Incrementa o número de indicações
                encontrado = true;
                console.log(`🔄 Indicação incrementada para o usuário ID ${id}.`);
                break;
            }
        }

        if (!encontrado) {
            data.push([nome, id, telefone, 1, 0, 0, '']);
            console.log(`➕ Usuário ${nome} adicionado com uma nova indicação.`);
        }

        const newWorksheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets['Recompensas'] = newWorksheet;
        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error('Erro ao adicionar indicação:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

// Função para adicionar uma compra
async function adicionarCompra(nome, id, telefone) {
    inicializarPlanilha();

    let release;
    try {
        release = await waitForLock(filePath);

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['Recompensas'];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        let encontrado = false;
        for (let i = 1; i < data.length; i++) {
            if (data[i][1] === id) {
                data[i][4] += 1; // Incrementa o número de compras
                encontrado = true;
                console.log(`🔄 Compra incrementada para o usuário ID ${id}.`);
                break;
            }
        }

        if (!encontrado) {
            data.push([nome, id, telefone, 0, 1, 1, '']);
            console.log(`➕ Usuário ${nome} adicionado com uma nova compra.`);
        }

        const newWorksheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets['Recompensas'] = newWorksheet;
        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error('Erro ao adicionar compra:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

// Função para adicionar rodada ativa
async function adicionarRodadaAtiva(id) {
    inicializarPlanilha();

    let release;
    try {
        release = await waitForLock(filePath);

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['Recompensas'];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        for (let i = 1; i < data.length; i++) {
            if (data[i][1] === id) {
                data[i][5] += 1; // Incrementa o número de rodadas ativas
                console.log(`🔄 Rodada ativa incrementada para o usuário ID ${id}.`);
                break;
            }
        }

        const newWorksheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets['Recompensas'] = newWorksheet;
        xlsx.writeFile(workbook, filePath);
    } catch (error) {
        console.error('Erro ao adicionar rodada ativa:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

// Função para verificar e conceder recompensas
async function verificarRecompensas() {
    inicializarPlanilha();

    let release;
    try {
        release = await waitForLock(filePath);

        const workbook = xlsx.readFile(filePath);
        const worksheet = workbook.Sheets['Recompensas'];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        for (let i = 1; i < data.length; i++) {
            const indicacoes = data[i][3];
            const compras = data[i][4];
            const rodadasAtivas = data[i][5];
            let recompensas = data[i][6] || '';

            if (indicacoes >= 5 && !recompensas.includes('Cota Gratuita - Indicações')) {
                recompensas += '🎁 Cota Gratuita - Indicações, ';
                console.log(`🏆 Usuário ID ${data[i][1]} atingiu a recompensa: Cota Gratuita - Indicações.`);
            }
            if (indicacoes >= 10 && !recompensas.includes('Prêmio em Dinheiro - Indicações')) {
                recompensas += '💰 Prêmio em Dinheiro - Indicações, ';
                console.log(`🏆 Usuário ID ${data[i][1]} atingiu a recompensa: Prêmio em Dinheiro - Indicações.`);
            }
            if (compras >= 10 && !recompensas.includes('Cota Gratuita - Compras')) {
                recompensas += '🎁 Cota Gratuita - Compras, ';
                console.log(`🏆 Usuário ID ${data[i][1]} atingiu a recompensa: Cota Gratuita - Compras.`);
            }
            if (rodadasAtivas >= 5 && !recompensas.includes('Cota Gratuita - Rodadas Ativas')) {
                recompensas += '🎁 Cota Gratuita - Rodadas Ativas, ';
                console.log(`🏆 Usuário ID ${data[i][1]} atingiu a recompensa: Cota Gratuita - Rodadas Ativas.`);
            }

            data[i][6] = recompensas;
        }

        const newWorksheet = xlsx.utils.aoa_to_sheet(data);
        workbook.Sheets['Recompensas'] = newWorksheet;
        xlsx.writeFile(workbook, filePath);
        console.log('✔️ Verificação de recompensas concluída.');
    } catch (error) {
        console.error('Erro ao verificar recompensas:', error);
    } finally {
        if (release) {
            await release();
        }
    }
}

module.exports = {
    adicionarIndicacao,
    adicionarCompra,
    adicionarRodadaAtiva,
    verificarRecompensas,
};
