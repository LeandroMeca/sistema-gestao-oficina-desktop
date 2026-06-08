import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'; // 🌟 IMPORT DO SWEETALERT ADICIONADO AQUI

@Component({
  selector: 'app-servicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicos.html',
  styleUrl: './servicos.scss',
})
export class Servicos implements OnInit {
  listaServicos: any[] = [];

  servicoForm = {
    codigo: '',
    nome: '',
    preco: '',
    retornoKm: '',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarServicos();
  }

  async carregarServicos() {
    try {
      const resultado = await (window as any).electronAPI.listarServicos();
      if (resultado.success) {
        this.listaServicos = resultado.servicos;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    }
  }

  // ==========================================
  // SALVAR COM SWEETALERT (TIPO TOAST)
  // ==========================================
  async salvarServico() {
    if (!this.servicoForm.nome || !this.servicoForm.preco) {
      Swal.fire({
        title: 'Campos Obrigatórios',
        text: 'O Nome do serviço e o Preço são obrigatórios!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b', // Amarelo
      });
      return;
    }

    try {
      const resultado = await (window as any).electronAPI.salvarServico(this.servicoForm);

      if (resultado.success) {
        // 🌟 TOAST: Notificação rápida no canto da tela 🌟
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Serviço cadastrado com sucesso!',
          showConfirmButton: false,
          timer: 2000,
        });

        this.limparFormulario();
        this.carregarServicos();
      } else {
        Swal.fire({
          title: 'Erro ao Salvar',
          text: resultado.error,
          icon: 'error',
          confirmButtonColor: '#ef4444', // Vermelho
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Falha na comunicação com o banco de dados.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }

  limparFormulario() {
    this.servicoForm = {
      codigo: '',
      nome: '',
      preco: '',
      retornoKm: '',
    };
  }

  // ==========================================
  // EXCLUIR COM PERGUNTA DE CONFIRMAÇÃO
  // ==========================================
  async excluirServico(id: number) {
    const confirm = await Swal.fire({
      title: 'Excluir Serviço?',
      text: 'Deseja remover este serviço da tabela? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Vermelho para apagar
      cancelButtonColor: '#6b7280', // Cinza para cancelar
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await (window as any).electronAPI.excluirServico(id);
        if (res.success) {
          Swal.fire({
            title: 'Excluído!',
            text: 'Serviço removido com sucesso.',
            icon: 'success',
            confirmButtonColor: '#10b981', // Verde
          });
          this.carregarServicos();
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
          text: 'Falha ao excluir o serviço.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  }
}
