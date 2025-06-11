// Inicia o Express.js
const express = require('express');
const app = express();
const axios = require('axios');

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Alarme faz disparo dele proprio 
app.post('/disparo/:id', async (req, res) => {
    const id_alarme = req.params.id;
    const ponto_disparado = req.body.ponto;
    
    try {
        let data = await procura_alarme(id_alarme)
        evento = `Disparo de alarme`
        const log = await registraLog(data.id, evento, data.nome_local)
        res.status(200).json({mensagem: `Alarme ${data.id} em ${data.nome_local} detectou movimento, ponto disparado: ${ponto_disparado} `})

    } catch (error) {
        console.error('Erro ao disparar o alarme:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao disparar alarme.' });
    }
});


// Inicia o Servidor
let porta = 8110;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});

async function procura_alarme(id_alarme) {
    try {
        const response = await axios.get(`http://localhost:8090/alarmes/${id_alarme}`)
        return response.data
    } catch (err) {
        console.log('Erro ao encontrar alarme:', err.message);
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
