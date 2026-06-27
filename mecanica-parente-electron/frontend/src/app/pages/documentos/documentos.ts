import { Component, ChangeDetectorRef } from '@angular/core'; // 1. Adicione o ChangeDetectorRef aqui
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos.html',
  styleUrl: './documentos.scss',
})
export class DocumentosComponent {
  termoBusca: string = '';
  clientesEncontrados: any[] = [];
  clienteSelecionado: any = null;
  documentos: any[] = [];

  // 2. Injete o ChangeDetectorRef no construtor
  constructor(private cdr: ChangeDetectorRef) {}

  async buscarCliente() {
    if (!this.termoBusca || this.termoBusca.length < 2) return;

    const resposta = await (window as any).electronAPI.buscarClientePorNome(this.termoBusca);
    if (resposta.success) {
      this.clientesEncontrados = resposta.clientes;
      if (this.clientesEncontrados.length === 0) {
        Swal.fire('Aviso', 'Nenhum cliente encontrado.', 'info');
      }
      this.cdr.detectChanges(); // Força a atualização
    }
  }

  async selecionarCliente(cliente: any) {
    this.clienteSelecionado = cliente;
    this.clientesEncontrados = [];
    this.termoBusca = cliente.nome;

    const resposta = await (window as any).electronAPI.listarDocumentosCliente(cliente.nome);
    if (resposta.success) {
      this.documentos = resposta.documentos;
      this.cdr.detectChanges(); // 3. Força o Angular a desenhar os 5 PDFs no ecrã!
    } else {
      Swal.fire('Erro', 'Erro ao ler documentos do cliente.', 'error');
    }
  }

  async abrirDocumento(caminho: string) {
    const resposta = await (window as any).electronAPI.abrirDocumento(caminho);
    if (!resposta.success) {
      Swal.fire('Erro', 'Não foi possível abrir o documento.', 'error');
    }
  }
}
