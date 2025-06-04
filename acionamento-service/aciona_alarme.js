// Inicia o Express.js
const express = require('express');
const app = express();
const axios = require('axios');

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Aciona Alarme
app.post('/Acionar', (req, res) => {
    const { id_alarme, id_usuario, origem} = req.body;
    json_alarme = buscarAlarme(alarme)

});








// Inicia o Servidor na porta 8080
let porta = 8100;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


async function buscarAlarme(id) {
    try{
        const response = await axios.getAdapter(`http://localhost:8090/alarmes/${id}`)
        return response
    }
    catch (err){
        console.log('erro ao buscar alarme')
    }
}
