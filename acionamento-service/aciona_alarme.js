// Inicia o Express.js
const express = require('express');
const app = express();
const axios = require('axios');

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Aciona Alarme
app.post('/acionamento', async (req, res) => {
    const { id_alarme, id_usuario, origem = 'desconhecido' } = req.body;

    // Validação de campos obrigatórios
    if (!id_alarme || !id_usuario) {
        return res.status(400).json({
            mensagem: 'Os parâmetros id_alarme e id_usuario são obrigatórios.'
        });
    };

    try {
        let { permitido, status } = await verificaPermissao(id_alarme, id_usuario);
        console.log(status);

        if (!permitido) {
            return res.status(403).json({ mensagem: 'Usuário sem permissão para acionar o alarme.' });
        };
        
        if (status == 0) {
            status = 1
            await acionamento(id_alarme, status)
            evento = `Alarme acionado pelo usuario: ${id_usuario}`
            await registraLog(id_alarme, evento, origem)
            res.status(200).json({ mensagem: 'Alarme acionado com sucesso!' });
        }
        else {
            status = 0
            await acionamento(id_alarme, status)
            evento = `Alarme desligado pelo usuario: ${id_usuario}`
            await registraLog(id_alarme, evento, origem)
            res.status(200).json({ mensagem: 'Alarme desligado com sucesso!' });
        };

    } catch (error) {
        console.error('Erro ao acionar alarme:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao acionar alarme.' });
    }
});



// Inicia o Servidor
let porta = 8100;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


async function verificaPermissao(id_alarme, id_usuario) {
    try {
        const response = await axios.get(`http://localhost:8090/permissao?id_alarme=${id_alarme}&id_usuario=${id_usuario}`);
        return response.data; //acessar os dados aqui
    } catch (err) {
        console.log('Erro ao buscar alarme:', err.message);
        return null;
    };
};

async function acionamento(id_alarme, novoStatus) {
    try {
        const response = await axios.patch(`http://localhost:8090/alarmes/${id_alarme}`,{
            status: novoStatus // corpo da requisição
        });
        console.log('Resposta:', response.data);
    } catch (err) {
        console.log('Erro ao atualizar stautus:', err.message);
        return null;
    };
};

async function registraLog(id_alarmeLog, eventoLog, localLog) {
    try {
        const response = await axios.post(`http://localhost:8120/registros`,{
            id_alarme: id_alarmeLog, // corpo da requisição
            evento: eventoLog,
            local: localLog
        });
        return
    } catch (err) {
        console.log('Erro ao registrar Log:', err.message);
        return null;
    };
};