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
    pontos_monitorados TEXT
)`, (err) => {
    if (err) {
        console.log('ERRO ao criar tabela alarmes.');
        throw err;
    }
});

// Cria a tabela "permissoes" se não existir
db.run(`
    CREATE TABLE IF NOT EXISTS permissoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_alarme INTEGER NOT NULL,
        id_usuario INTEGER NOT NULL,
    )
`, (err) => {
    if (err) {
        console.log('ERRO ao criar tabela permissoes.');
        throw err;
    } else {
        console.log('Tabela permissoes criada com sucesso!');
    }
});

//CRIA UM ALARME
app.post('/alarmes', (req, res) => {
    const { nome_local, status, pontos_monitorados } = req.body || {};

    if (!nome_local) {
        return res.status(400).send("O campo 'nome_local' é obrigatório.");
    }

    // Trate campos separados por vírgulas
    const pontosStr = pontos_monitorados || '';

    db.run(`INSERT INTO alarmes (nome_local, status, pontos_monitorados)
            VALUES (?, ?, ?, ?)`,
        [
            nome_local,
            status,
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
    const { nome_local, status, pontos_monitorados } = req.body;

    db.run(`UPDATE alarmes SET
            nome_local = COALESCE(?, nome_local),
            status = COALESCE(?, status),
            pontos_monitorados = COALESCE(?, pontos_monitorados)
            WHERE id = ?`,
        [
            nome_local || null,
            status === undefined ? null : (status ? 1 : 0), //converte booleano para 1 ou 0
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
    db.run('DELETE FROM permissoes WHERE id_alarme = ?', [req.params.id], function (err) {
        if (err) {
            res.status(500).send('Erro ao remover alarme.');
        } else if (this.changes === 0) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            res.status(200).send('Alarme removido com sucesso.');
        }
    });
});

//VINCULA UM USUARIO A UM ALARME
app.post('/alarmes/permissao/:id', async (req,res) => {
    const id_alarme = req.params.id;
    const id_usuario = req.body.id_usuario;

    if (!id_usuario) {
        return res.status(400).send("id_usuario é obrigatório")
    };
    
    const data = await procura_usuario(id_usuario);

    if (!data.id){
        return res.status(400).send("Usuario não existe")
    }

    db.run(`INSERT INTO permissoes (id_alarme, id_usuario)`
        [
            id_alarme,
            id_usuario
        ],
        function (err) {
            if (err) {
                return res.status(500).send('Erro ao vincular Usuario ao alarme')
            };
            res.status(200).send(`Usuario: ${id_usuario} vinculado ao alarme: ${id_alarme}`)
        }
    );
});

//GET permissoes por id_alarme
app.get('/alarmes/permissao/:id', (req, res) => {
    const id_alarme = req.params.id;

    db.all('SELECT id_usuario FROM permissoes WHERE id_alarme = ?', [id_alarme], (err, results) => {
        if (err) {
            res.status(500).send('Erro ao buscar as permissoes do alarme')
        } else if (!result) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            res.status(200).json(results);
        };
    });
});

// Permissão de acesso
app.get('/permissao', (req, res) => {
    const { id_usuario, id_alarme } = req.query;

    if (!id_alarme || !id_usuario) {
        return res.status(400).json({ mensagem: 'Parâmetros id_alarme e id_usuario são obrigatórios.' });
    }

    db.get('SELECT * FROM alarmes WHERE id = ?', [id_alarme], (err, result) => {
        if (err) {
            res.status(500).send('Erro ao buscar alarme.')
        } else if (!result) {
            res.status(404).send('Alarme não encontrado.');
        } else {
            var status_alarme = result.status; // Pegando o status da tupla do banco
        };
    });

    db.get('SELECT * FROM permissoes WHERE id_alarme = ? AND id_usuario = ?', [id_alarme, id_usuario], (err, result) => {
        if (err) {
            console.log('Erro ao buscar permissão:', err.message);
            return res.status(500).json({ mensagem: 'Erro interno ao verificar permissão.' });
        }
        if (row) {
            return res.status(200).json({ permitido: true, status: status_alarme, permissao: row });
        } else {
            return res.status(200).json({ permitido: false });
        }
    });
});


// Inicia o servidor
const porta = 8090;
app.listen(porta, () => {
    console.log('Microserviço de alarmes rodando na porta: ' + porta);
});

async function procura_usuario(id_usuario) {
    try {
        const response = await axios.get(`http://localhost:8080/usuarios/${id_usuario}`)
        return response.data
    } catch (err) {
        console.log('Erro ao encontrar usuario:', err.message);
        return null;
    };
};