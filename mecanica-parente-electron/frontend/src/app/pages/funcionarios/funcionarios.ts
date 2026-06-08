import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // 🌟 IMPORT DO SWEETALERT ADICIONADO AQUI

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funcionarios.html',
})
export class Funcionarios implements OnInit {
  listaFuncionarios: any[] = [];
  mostrarFormulario = false;

  funcionarioForm = {
    nome: '',
    cargo: '',
    status: 'ATIVO',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarFuncionarios();
  }

  alternarFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  async carregarFuncionarios() {
    try {
      const resultado = await (window as any).electronAPI.listarFuncionarios();
      if (resultado.success) {
        this.listaFuncionarios = resultado.funcionarios;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários', error);
    }
  }

  // ==========================================
  // SALVAR COM SWEETALERT
  // ==========================================
  async salvarFuncionario() {
    if (!this.funcionarioForm.nome) {
      Swal.fire({
        title: 'Atenção',
        text: 'O nome do funcionário é obrigatório!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b', // Amarelo
      });
      return;
    }

    try {
      const resultado = await (window as any).electronAPI.salvarFuncionario(this.funcionarioForm);

      if (resultado.success) {
        Swal.fire({
          title: 'Sucesso!',
          text: 'Funcionário salvo com sucesso!',
          icon: 'success',
          confirmButtonColor: '#10b981', // Verde
        });

        this.funcionarioForm = { nome: '', cargo: '', status: 'ATIVO' };
        this.mostrarFormulario = false; // Fecha o form depois de salvar
        this.carregarFuncionarios(); // Atualiza a tabela
      } else {
        Swal.fire({
          title: 'Erro ao Salvar',
          text: resultado.error,
          icon: 'error',
          confirmButtonColor: '#ef4444', // Vermelho
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Falha na comunicação com o banco de dados.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }

  // ==========================================
  // EXCLUIR COM PERGUNTA DE CONFIRMAÇÃO
  // ==========================================
  async excluirFuncionario(id: number) {
    const confirm = await Swal.fire({
      title: 'Demitir / Excluir?',
      text: 'Deseja remover este funcionário do sistema?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await (window as any).electronAPI.excluirFuncionario(id);
        if (res.success) {
          Swal.fire({
            title: 'Removido!',
            text: 'Funcionário excluído do sistema.',
            icon: 'success',
            confirmButtonColor: '#10b981',
          });
          this.carregarFuncionarios();
        } else {
          Swal.fire({
            title: 'Erro',
            text: res.error,
            icon: 'error',
            confirmButtonColor: '#ef4444',
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Erro Crítico',
          text: 'Falha ao excluir funcionário.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  }
}
