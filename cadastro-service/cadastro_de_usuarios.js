// Inicia o Express.js
const express = require('express');
const app = express();

// Body Parser - usado para processar dados da requisição HTTP
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//POST
app.post('/Cadastro-usuario', (req, res, next) => {
    db.run(`INSERT INTO usuarios(id, nome_usuario, celular) VALUES(?,?,?)`, 
         [req.body.id, req.body.nome_usuario, req.body.celular], (err) => {
        if (err) {
            console.log("Error: " + err);
            res.status(500).send('Erro ao cadastrar cliente.');
        } else {
            console.log('Cliente cadastrado com sucesso!');
            res.status(200).send('Cliente cadastrado com sucesso!');
        }
    });
});

//GET ALL
app.get('/usuarios', (req, res, next) => {
    db.all('SELECT * FROM usuarios', [], (err, result) => {
        if (err){
            console.log(err);
            res.status(500).send('Erro ao obter dados')
        } else {
            res.status(200).json(result);
        }
    });
});


//GET USUARIO POR ID
app.get('/usuarios/:id', (req, res, next) => {
    db.get('SELECT * FROM usuarios WHERE id = ?',
            req.params.id, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter dados.');
        }else if (result == null){
            console.log("Usuario não encontrado")
            res.status(404).send("Cliente não encontrado.");
        }else {
            res.status(200).json(result);
        }
    });
});

// PATCH USUARIO POR ID
app.patch('/usuarios/:id', (req , res, next) => {
    db.run('UPDATE usuarios SET nome_usuario = COALESCE(?,nome_usuario), celular = COALESCE(?,celular) WHERE id = ?',
            [req.body.nome_usuario, req.body.celular, req.params.id], function(err) {
            if (err){
                res.status(500).send('Erro ao alterar dados.');
            } else if (this.change == 0) {
                console.log('Usuario não encontrado')
                res.status(404).send('Usuario não encontrado');
            } else {
                res.status(200).send('Usuario atualizado!');
            }
    });
});

// DELETE USUARIO POR ID
app.delete('/usuarios/:id', (req , res, next) => {
    db.run('DELETE FROM usuarios WHERE id = ?',
            req.params.id, function(err) {
        if (err) {
            res.status(500).send("Erro ao remover usuario");
        } else if (this.changes == 0) {
            console.log(err)
            res.status(404).send('Usuario não encontrado');
        } else{
            res.status(200).send('Cleinte removido"!');
        }
    });
});

// Importa o package do SQLite
const sqlite3 = require('sqlite3');
// Acessa o arquivo com o banco de dados
var db = new sqlite3.Database('./dados.db', (err) => {
        if (err) {
            console.log('ERRO: não foi possível conectar ao SQLite.');
            throw err;
        }
        console.log('Conectado ao SQLite!');
    });
// Cria a tabela cadastro, caso ela não exista
db.run(`CREATE TABLE IF NOT EXISTS usuarios 
        (nome_usuario TEXT NOT NULL, celular TEXT NOT NULL, 
         id INTEGER PRIMARY KEY NOT NULL UNIQUE)`, 
        [], (err) => {
           if (err) {
              console.log('ERRO: não foi possível criar tabela.');
              throw err;
           }
      });

// Inicia o Servidor na porta 8080
let porta = 8080;
app.listen(porta, () => {
 console.log('Servidor em execução na porta: ' + porta);
});


