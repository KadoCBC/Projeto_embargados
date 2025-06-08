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

// Cria a tabela "alarmes" se não existir
db.run(`CREATE TABLE IF NOT EXISTS alarmes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_local TEXT NOT NULL,
    status INTEGER,
    usuarios_ids TEXT,
    pontos_monitorados TEXT
)`, (err) => {
    if (err) {
        console.log('ERRO ao criar tabela alarmes.');
        throw err;
    }
});

app.post('/alarmes', (req, res) => {
    const { nome_local, status, usuarios_ids, pontos_monitorados } = req.body || {};

    if (!nome_local) {
        return res.status(400).send("O campo 'nome_local' é obrigatório.");
    }

    // Trate campos separados por vírgulas
    const usuariosIdsStr = usuarios_ids || '';
    const pontosStr = pontos_monitorados || '';

    db.run(`INSERT INTO alarmes (nome_local, status, usuarios_ids, pontos_monitorados)
            VALUES (?, ?, ?, ?)`,
        [
            nome_local,
            status,
            usuariosIdsStr,
            pontosStr
        ],
        function (err) {
            if (err) {
                console.log(err);
                return res.status(500).send('Erro ao cadastrar alarme.');
            }
            res.status(200).send('Alarme cadastrado com sucesso!');
        }
    );
});

// GET - Buscar todos os alarmes
app.get('/alarmes', (req, res) => {
    db.all('SELECT * FROM alarmes', [], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao obter alarmes.');
        } else {
            res.status(200).json(result);
        }
    });
});

// GET - Buscar alarme por ID
app.get('/alarmes/:id', (req, res) => {
    db.get('SELECT * FROM alarmes WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar alarme.');
        } else if (!result) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            res.status(200).json(result);
        }
    });
});

// PATCH - Atualizar alarme por ID
app.patch('/alarmes/:id', (req, res) => {
    const { nome_local, status, usuarios_ids, pontos_monitorados } = req.body;

    db.run(`UPDATE alarmes SET
            nome_local = COALESCE(?, nome_local),
            status = COALESCE(?, status),
            usuarios_ids = COALESCE(?, usuarios_ids),
            pontos_monitorados = COALESCE(?, pontos_monitorados)
            WHERE id = ?`,
        [
            nome_local || null,
            status === undefined ? null : (status ? 1 : 0), //converte booleano para 1 ou 0
            usuarios_ids ? usuarios_ids.join(',') : null,
            pontos_monitorados ? pontos_monitorados.join(',') : null,
            req.params.id
        ],
        function (err) {
            if (err) {
                res.status(500).send('Erro ao atualizar alarme.');
            } else if (this.changes === 0) {
                res.status(404).send('Alarme não encontrado.');
            } else {
                res.status(200).send('Alarme atualizado com sucesso!');
            }
        });
});

// DELETE - Remover alarme
app.delete('/alarmes/:id', (req, res) => {
    db.run('DELETE FROM alarmes WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            res.status(500).send('Erro ao remover alarme.');
        } else if (this.changes === 0) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            res.status(200).send('Alarme removido com sucesso.');
        }
    });
});

// Permissão de acesso
app.get('/permissao', (req, res) => {
    const { id_usuario, id_alarme } = req.query;
    db.get('SELECT * FROM alarmes WHERE id = ?', [id_alarme], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Erro ao buscar alarme.');
        } else if (!result) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            const lista = result.usuarios_ids.split(',').map(id => id.trim()); // gambiarra
            
            const permitido = lista.includes(id_usuario.trim());
            const status = result.status; // Pegando o status da tupla do banco

            return res.json({permitido,status})
        };
    });
});


// Inicia o servidor
const porta = 8090;
app.listen(porta, () => {
    console.log('Microserviço de alarmes rodando na porta: ' + porta);
});