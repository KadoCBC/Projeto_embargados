// Inicia o Express.js
const express = require('express');
const app = express();
const axios = require('axios');

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Aciona Alarme
app.post('/Acionar', async (req, res) => {
    const { id_alarme, id_usuario, origem } = req.body; 
    console.log(id_alarme)

    try {
        const permissao = await verificaPermissao(id_alarme, id_usuario);
        console.log(permissao);

        if (!permissao || !permissao.permitido) {
            return res.status(403).json({ mensagem: 'Usuário sem permissão para acionar o alarme.' });
        }

        // Simulação de acionamento do alarme
        console.log(`Alarme ${id_alarme} acionado por ${id_usuario} via ${origem}`);
        res.status(200).json({ mensagem: 'Alarme acionado com sucesso!' });

    } catch (error) {
        console.error('Erro ao acionar alarme:', error.message);
        res.status(500).json({ mensagem: 'Erro interno ao acionar alarme.' });
    }
});








// Inicia o Servidor na porta 8080
let porta = 8100;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


async function verificaPermissao(id_alarme, id_usuario) {
    try {
        const response = await axios.get(`http://localhost:8090/permissao?id_alarme=${id_alarme}&id_usuario=${id_usuario}`);
        return response.data; // normalmente você quer acessar os dados aqui
    } catch (err) {
        console.log('Erro ao buscar alarme:', err.message);
        return null;
    }
}
