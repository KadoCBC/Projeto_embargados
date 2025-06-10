const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Acessa o arquivo com o banco de dados
var db = new sqlite3.Database('./dados.db', (err) => {
    if (err) {
        console.log('ERRO: não foi possível conectar ao SQLite.');
        throw err;
    }
    console.log('Conectado ao SQLite!');
});

// Cria a tabela "logs" se não existir
db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evento TEXT NOT NULL,
    data TEXT NOT NULL,
    id_alarme INTEGER NOT NULL,
    local TEXT
)`, (err) => {
    if (err) {
        console.log('ERRO ao criar tabela alarmes.');
        throw err;
    }
});

app.post('/registro', (req, res) => {
    const { evento, id_alarme, local } = req.body || {};
    const data = dataAtualFormatada();

    db.run(`INSERT INTO logs (evento, data, id_alarme, local)
            VALUES (?, ?, ?, ?)`,
        [
            evento,
            data,
            id_alarme,
            local
        ],
        function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Erro ao registrar log.');
            }
            res.status(200).send('log registrado com sucesso!');
        }
    );
});

//GET ALL
app.get('/registros', (req, res) => {
    db.all('SELECT * FROM logs', [], (err, result) => {
        if (err){
            console.log(err);
            res.status(500).send('Erro ao obter dados');
        } else {
            res.status(200).json(result);
        }
    });
});

//GET USUARIO POR ID
app.get('/registro/:id', (req, res) => {
    db.get(`SELECT * FROM logs WHERE id = ?`, req.params.id, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter dados.');
        }else if (result == null){
            console.log("Log não encontrado")
            res.status(404).send("Log não encontrado.");
        }else {
            res.status(200).json(result);
        }
    });
});


// Inicia o servidor
const porta = 8120;
app.listen(porta, () => {
    console.log('Microserviço de log rodando na porta: ' + porta);
});


function dataAtualFormatada() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minuto = String(agora.getMinutes()).padStart(2, '0');
    const segundo = String(agora.getSeconds()).padStart(2, '0');

    return `${dia}-${mes}-${ano} ${hora}:${minuto}:${segundo}`;
}