# Projeto para disciplina de Dispositivos Móveis e Embargados - UFSC/25.1

## Escopo:
Sistema de uma central de alarmes simples. 
Com cadastro de alarmes e usuarios, controle de permissôes de acesso, logs de atividade e disparo do alarme.

## Implementação:
A estrutura foi divida em microserviços, que tem seus endpoints integrados a uma API-gateway para centralizar as requisições.
A linguagem utilizada foi **JavaScript** com ***Express*** para servidor.
Os dados são persistidos por meio do banco de dados **SQL lite**.
Para testes de requisição foi usado o ***Postman***.
