// Inicia o Express.js
const express = require('express');
const app = express();
const axios = require('axios');

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Notifica ocorrencia para usuario
app.post('/notificar/:id', async (req, res) => {
    const id_usuario = req.params.id
    const evento = req.body.evento
    try {
        console.log(`---------USUARIO ${id_usuario} ---------`)
        console.log(`${evento}`)
        res.status(200).json({mensagem: `Notificacao enviada com sucesso!`})

    } catch (error) {
        res.status(500).json({ mensagem: 'Erro interno ao disparar alarme.' });
    }
});


// Inicia o Servidor
let porta = 8130;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});