import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Necessário para os inputs
import Swal from 'sweetalert2'; // 🌟 IMPORT DO SWEETALERT ADICIONADO AQUI

@Component({
  selector: 'app-produtos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produtos.html',
  styleUrl: './produtos.scss',
})
export class Produtos implements OnInit {
  listaProdutos: any[] = [];

  produtoForm = {
    codigo: '',
    nome: '',
    fornecedor: '',
    precoCusto: '',
    precoVenda: '',
    fabricante: '',
    garantia: '',
    vidaUtil: '',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarProdutos();
  }

  async carregarProdutos() {
    try {
      const resultado = await (window as any).electronAPI.listarProdutos();
      if (resultado.success) {
        this.listaProdutos = resultado.produtos;
        this.cdr.detectChanges(); // Atualiza a tela
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }

  // ==========================================
  // SALVAR COM SWEETALERT (TIPO TOAST)
  // ==========================================
  async salvarProduto() {
    if (!this.produtoForm.nome || !this.produtoForm.precoVenda) {
      Swal.fire({
        title: 'Campos Obrigatórios',
        text: 'O Nome da peça e o Preço de Venda são obrigatórios!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b', // Amarelo
      });
      return;
    }

    try {
      const resultado = await (window as any).electronAPI.salvarProduto(this.produtoForm);

      if (resultado.success) {
        // 🌟 TOAST: Notificação rápida no canto da tela 🌟
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Peça cadastrada no estoque!',
          showConfirmButton: false,
          timer: 2000,
        });

        this.limparFormulario();
        this.carregarProdutos();
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
    this.produtoForm = {
      codigo: '',
      nome: '',
      fornecedor: '',
      precoCusto: '',
      precoVenda: '',
      fabricante: '',
      garantia: '',
      vidaUtil: '',
    };
  }

  // ==========================================
  // EXCLUIR COM PERGUNTA DE CONFIRMAÇÃO
  // ==========================================
  async excluirProduto(id: number) {
    const confirm = await Swal.fire({
      title: 'Excluir Peça?',
      text: 'Deseja remover este item do estoque? Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Vermelho para apagar
      cancelButtonColor: '#6b7280', // Cinza para cancelar
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await (window as any).electronAPI.excluirProduto(id);
        if (res.success) {
          Swal.fire({
            title: 'Excluída!',
            text: 'Peça removida do estoque com sucesso.',
            icon: 'success',
            confirmButtonColor: '#10b981', // Verde
          });
          this.carregarProdutos();
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
          text: 'Falha ao excluir a peça.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    }
  }
}
