const express = require('express');
const pg = require('pg');

// Replace with your connection details
const connectionString = 'postgres://postgres:252300@localhost:5432/estoque';

const app = express();
const port = 3001;

const client = new pg.Client({ connectionString });

async function connect() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
  }
}

async function disconnect() {
  try {
    await client.end();
    console.log('Disconnected from PostgreSQL database');
  } catch (error) {
    console.error('Error disconnecting from PostgreSQL database:', error);
  }
}

async function insertProduto(descricao, categoria, valor, criadoPor) {
  try {
    const query =`
    INSERT INTO produto (descricao, categoria, valor, criado_por)
    VALUES ($1, $2, $3, $4)
    RETURNING *;`;
    const values = [descricao, categoria, valor, criadoPor];

    const { rows } = await client.query(query, values);
    const insertedId = rows[0].id;
    console.log(`Inserted product with ID: ${insertedId}`);

    // Perform 10 SELECTs for previous product IDs
    for (let i = insertedId - 10; i < insertedId; i++) {
      const selectQuery = `SELECT * FROM produto WHERE id = $1`;
      const selectValues = [i];

      const { rows: selectResult } = await client.query(selectQuery, selectValues);
      if (selectResult.length > 0) {
        console.log(`Selected product with ID: ${i}: ${JSON.stringify(selectResult[0])}`);
      } else {
        console.log(`Product with ID: ${i} not found`);
      }
    }
  } catch (error) {
    console.error(`Error inserting product: ${error}`);
  }
}

const groupName = "Armazen de ideias";
const delay = 0.5 * 1000; // Delay in milliseconds (0.5 seconds)

async function start() {
  await connect();

  while (true) {
    const descricao = "Geladeira"; // Replace with dynamic generation
    const categoria = "Elet"; // Replace with dynamic generation
    const valor = "100.00"; // Replace with dynamic generation

    await insertProduto(descricao, categoria, valor, groupName);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  start();
});
