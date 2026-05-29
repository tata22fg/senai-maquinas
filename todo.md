# SENAI - Controle de Máquinas - TODO

## Backend / Schema
- [x] Tabela `machines` (id, code, name, type, location, status, createdAt, updatedAt)
- [x] Tabela `usage_records` (id, machineId, teacherName, className, startTime, endTime, notes, createdAt)
- [x] Tabela `fault_reports` (id, machineId, reportedBy, description, status, resolvedAt, createdAt)
- [x] Migrations geradas e aplicadas via webdev_execute_sql
- [x] Routers tRPC: machines (CRUD + status), usageRecords (criar, listar, encerrar), faultReports (criar, listar, resolver)
- [x] Dados de exemplo: 10+ máquinas típicas de laboratório de mecânica
- [x] Seed de dados de exemplo via script

## Autenticação e Perfis
- [x] Perfil admin (manutenção) via role = 'admin' na tabela users
- [x] Perfil docente via role = 'user'
- [x] Proteção de rotas admin no backend (adminProcedure)
- [x] Redirecionamento de rotas no frontend por perfil

## Frontend - Layout e Navegação
- [x] DashboardLayout com sidebar adaptado ao SENAI
- [x] Tema elegante: paleta de cores coesa, tipografia refinada (fonte Inter/Geist)
- [x] Indicadores de status: Verde (disponível), Amarelo (em uso), Vermelho (com defeito)
- [x] Responsividade mobile

## Frontend - Páginas
- [x] Página principal: painel visual com grid de máquinas e status coloridos
- [x] Página de cadastro de máquinas (admin)
- [x] Página de registro de uso de máquina (docente)
- [x] Página de relato de defeito
- [x] Página de histórico de uso e ocorrências por máquina (com filtros por data e status)
- [x] Painel exclusivo de manutenção: máquinas com defeito + histórico de ocorrências
- [x] Página de detalhes da máquina

## Testes
- [x] Vitest: testes para routers de machines
- [x] Vitest: testes para routers de usageRecords
- [x] Vitest: testes para routers de faultReports
