import { Routes } from '@angular/router';
import { CadastroOs } from './pages/cadastro-os/cadastro-os';
import { Clientes } from './pages/clientes/clientes';
import { Funcionarios } from './pages/funcionarios/funcionarios';
import { OficinaPage } from './pages/oficina/oficina';
import { Produtos } from './pages/produtos/produtos';
import { Servicos } from './pages/servicos/servicos';
import { Avaliacao } from './pages/avaliacao/avaliacao';
import { Orcamento } from './pages/orcamento/orcamento';
import { DocumentosComponent } from './pages/documentos/documentos';

export const routes: Routes = [
  { path: '', redirectTo: 'os', pathMatch: 'full' }, // Inicia o app direto na tela de OS
  { path: 'produtos', component: Produtos },
  { path: 'os', component: CadastroOs },
  { path: 'servicos', component: Servicos },
  { path: 'clientes', component: Clientes },
  { path: 'avaliacao', component: Avaliacao },
  { path: 'orcamento', component: Orcamento },
  { path: 'oficina', component: OficinaPage },
  { path: 'funcionarios', component: Funcionarios },
  { path: 'documentos', component: DocumentosComponent },
];
