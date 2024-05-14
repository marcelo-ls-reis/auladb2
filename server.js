const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3002; 

app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'estoque',
  password: '252300',
  port: 5432, // Porta padrão do PostgreSQL
});

app.post('/produto', async (req, res) => {
  try {
    
    const { descricao, categoria, valor, criado_por } = req.body;
 
    const insertQuery = `
      INSERT INTO produto (descricao, categoria, valor, criado_por)
      VALUES ($1, $2, $3, $4)
      RETURNING *;`;

    const { rows } = await pool.query(insertQuery, [descricao, categoria, valor, criado_por]);

    res.status(201).json(rows[0]); // Retorna o produto inserido
  } catch (error) {
    console.error('Erro ao inserir produto:', error);
    res.status(500).send('Erro ao inserir produto');
  }
});


app.get('/produto', async (req, res) => {
    try {

      const selectQuery = 'SELECT * FROM produto;';
  
   
      const { rows } = await pool.query(selectQuery);
  
      res.status(200).json(rows); // Retorna todos os produtos
    } catch (error) {
      console.error('Erro ao obter produtos:', error);
      res.status(500).send('Erro ao obter produtos');
    }
  });

  //A cada insert deverá printar no console os dados persistidos com o id gerado;

async function insertProduto(descricao, categoria, valor, criadoPor) {
  try {
    // Inserindo um novo produto
    const insertQuery = `
      INSERT INTO produto (descricao, categoria, valor, criado_por)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (descricao, criado_por) DO NOTHING
      RETURNING id;
    `;
    const insertValues = [descricao, categoria, valor, criadoPor];

    const { rows } = await pool.query(insertQuery, insertValues);

    if (rows.length === 0) {
      // Nenhum produto foi inserido
      console.log(`Produto com descricao "${descricao}" Criado por "${criadoPor}" já existe. Saido sem inserir.`);
    } else {
      const insertedId = rows[0].id;
      console.log(`Inserido produto com ID: ${insertedId}`);

      // Buscando os 10 produtos anteriores ao inserido
      for (let i = 1; i <= 10; i++) {
        const previousId = insertedId - i;
        if (previousId <= 0) break; // Não há mais produtos anteriores

        const selectQuery = `
          SELECT * FROM produto WHERE id = $1;
        `;
        const selectValues = [previousId];

        const { rows: selectRows } = await pool.query(selectQuery, selectValues);

        if (selectRows.length === 0) {
          console.log(`Não existe produto com esse ID: ${previousId}`);
        } else {
          console.log(`Produto com ID ${previousId}:`, selectRows[0]);
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao inserie produto: ${error}`);
  }
}



app.listen(port, () => {
  console.log(`Servidor está ouvindo na porta ${port}`);
});

insertProduto('Cafeteira', 'Eletr', '256.00', 'Armazen de ideias');
