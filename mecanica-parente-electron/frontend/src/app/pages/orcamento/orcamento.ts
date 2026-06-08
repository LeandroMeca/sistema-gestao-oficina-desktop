import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orcamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orcamento.html',
})
export class Orcamento implements OnInit {
  abaAtiva: 'dados' | 'itens' | 'total' = 'dados';

  // Seleção
  clientesEncontrados: any[] = [];
  veiculosDoCliente: any[] = [];
  clienteSelecionado: any = null;
  veiculoSelecionado: any = null;
  nomeBusca = '';
  kmAtual = '';

  // Banco de Dados (Para escolher o que adicionar)
  estoqueProdutos: any[] = [];
  tabelaServicos: any[] = [];

  // Carrinho do Orçamento
  itensAdicionados: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarDadosBase();
  }

  async carregarDadosBase() {
    // Busca as peças e serviços cadastrados para o usuário escolher
    const resProd = await (window as any).electronAPI.listarProdutos();
    const resServ = await (window as any).electronAPI.listarServicos();
    if (resProd.success) this.estoqueProdutos = resProd.produtos;
    if (resServ.success) this.tabelaServicos = resServ.servicos;
  }

  // --- ABA 1: CLIENTE E VEÍCULO ---
  // --- ABA 1: CLIENTE E VEÍCULO ---
  async buscarCliente() {
    // Limpa a lista se tiver menos de 3 letras
    if (this.nomeBusca.length < 3) {
      this.clientesEncontrados = [];
      return;
    }

    try {
      const res = await (window as any).electronAPI.buscarClientePorNome(this.nomeBusca);

      if (res.success && res.clientes.length > 0) {
        this.clientesEncontrados = res.clientes;

        // O BELISCÃO: Avisa o Angular para mostrar a lista na tela imediatamente!
        this.cdr.detectChanges();
      } else {
        this.clientesEncontrados = [];
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
  }

  async selecionarCliente(cli: any) {
    this.clienteSelecionado = cli;
    this.clientesEncontrados = [];
    this.nomeBusca = cli.nome;
    const res = await (window as any).electronAPI.listarVeiculos(cli.id);
    if (res.success) this.veiculosDoCliente = res.veiculos;
    this.cdr.detectChanges();
  }

  selecionarVeiculo(vei: any) {
    this.veiculoSelecionado = vei;
  }

  // --- ABA 2: PEÇAS E SERVIÇOS ---
  adicionarItem(item: any, tipo: 'PRODUTO' | 'SERVICO') {
    const preco = tipo === 'PRODUTO' ? item.precoVenda : item.preco;
    this.itensAdicionados.push({
      id: item.id,
      codigo: item.codigo || item.id,
      nome: item.nome,
      preco: parseFloat(preco.toString().replace(',', '.')),
      quantidade: 1,
      tipo: tipo,
    });

    // Notificação rápida e elegante no canto superior direito que some sozinha
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${item.nome} adicionado!`,
      showConfirmButton: false,
      timer: 1500,
    });
  }

  removerItem(index: number) {
    this.itensAdicionados.splice(index, 1);
  }

  // --- ABA 3: TOTAIS E PDF ---
  get totalPecas() {
    return this.itensAdicionados
      .filter((i) => i.tipo === 'PRODUTO')
      .reduce((sum, i) => sum + i.preco * i.quantidade, 0);
  }

  get totalServicos() {
    return this.itensAdicionados
      .filter((i) => i.tipo === 'SERVICO')
      .reduce((sum, i) => sum + i.preco * i.quantidade, 0);
  }

  get totalGeral() {
    return this.totalPecas + this.totalServicos;
  }

  async imprimirOrcamento() {
    if (!this.clienteSelecionado) {
      // Alerta de aviso (amarelo)
      Swal.fire({
        title: 'Atenção',
        text: 'Por favor, selecione um cliente antes de gerar o orçamento!',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    // Pega as datas e horas exatas do momento da emissão
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');

    const cli = this.clienteSelecionado;
    const vei = this.veiculoSelecionado || {};

    // Mapeia os produtos e serviços adicionados no carrinho para a tabela do PDF
    const linhasHtml = this.itensAdicionados
      .map(
        (item, index) => `
      <tr>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${item.id || index + 1}</td>
        <td style="border: 1px solid #000; padding: 6px;">${item.nome}</td>
        <td style="text-align: center; border: 1px solid #000; padding: 6px;">${item.quantidade}</td>
        <td style="text-align: right; border: 1px solid #000; padding: 6px;">${item.preco.toFixed(2)}</td>
        <td style="text-align: right; border: 1px solid #000; padding: 6px;">${(item.preco * item.quantidade).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    // Estrutura HTML espelhada no modelo oficial da oficina
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Orçamento - ${cli.nome}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #000; margin: 0; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .grid-2 { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .grid-3 { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .col { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; font-size: 13px; }
            .header-text { font-size: 12px; line-height: 1.4; }
            .header-title { font-size: 18px; font-weight: bold; margin: 5px 0; }
            .totals-box { text-align: right; margin-top: 20px; font-size: 14px; line-height: 1.6; }
            .total-geral { font-size: 18px; font-weight: bold; margin-top: 8px; border-top: 1px solid #000; padding-top: 5px; }
            .box-linha { border: 1px solid #000; padding: 5px; background: #f0f0f0; }
          </style>
        </head>
        <body>
          
          <div class="text-center header-text">
            <div>JACAREÍ-SP</div>
            <div class="header-title">MECÂNICA PARENTE</div>
            <div>AVENIDA MARIA AUGUSTA FAGUNDES GOMES 105 - (12)3956-1806</div>
            <div>CEP: 12322-300</div>
            <div style="margin-top: 3px; font-weight: bold;">ELÉTRICA - AUTO MECÂNICA - MECÂNICA DIESEL - INJEÇÃO ELETRÔNICA</div>
          </div>

          <div style="text-align: center; font-size: 16px; font-weight: bold; margin-top: 20px; text-transform: uppercase; letter-spacing: 1px;">Orçamento</div>
          
          <div class="grid-2" style="margin-top: -15px;">
            <div class="col">${dataAtual}</div>
            <div class="col text-right bold">N°: ${cli.id || '1'}</div>
          </div>

          <div class="grid-2" style="margin-top: 15px; border-bottom: 1px solid #000; padding-bottom: 5px;">
            <div class="col"><span class="bold">Data Entrada:</span> ${dataAtual}</div>
            <div class="col text-right"><span class="bold">Hora de Entrada:</span> ${horaAtual}</div>
          </div>

          <div style="margin-top: 10px; margin-bottom: 5px; font-size: 14px;" class="bold">Dados do Cliente:</div>
          
          <div class="grid-3">
            <div class="col" style="flex: 2;"><span class="bold">Nome:</span> ${cli.nome || ''}</div>
            <div class="col"><span class="bold">CPF/CNPJ:</span> ${cli.cpf || 'Não informado'}</div>
            <div class="col"><span class="bold">RG/Insc. Estadual:</span> ${cli.rg || 'Não informado'}</div>
          </div>
          
          <div class="grid-3">
            <div class="col" style="flex: 2;"><span class="bold">Endereço:</span> ${cli.endereco || 'Não informado'}</div>
            <div class="col"><span class="bold">Bairro:</span> ${cli.bairro || 'Não informado'}</div>
            <div class="col"><span class="bold">UF:</span> ${cli.uf || 'SP'}</div>
          </div>
          
          <div class="grid-3" style="border-bottom: 1px solid #000; padding-bottom: 10px;">
            <div class="col"><span class="bold">Cidade:</span> ${cli.cidade || 'Jacareí'}</div>
            <div class="col"><span class="bold">Celular:</span> ${cli.celular || 'Não informado'}</div>
            <div class="col"><span class="bold">Telef. Residencial:</span> ${cli.telefone || 'Não informado'}</div>
          </div>

          <div style="margin-top: 15px; margin-bottom: 5px; font-size: 14px;" class="bold">Observações do Veículo:</div>
          <div class="grid-2" style="margin-bottom: 8px;">
            <div class="col"><span class="bold">Veículo:</span> ${vei.modelo || 'Não selecionado'}</div>
            <div class="col text-right"><span class="bold">Marca:</span> ${vei.marca || 'Não informada'}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="border: 1px solid #000; padding: 6px; width: 25%;"><span class="bold">Cor:</span> ${vei.cor || 'Não informada'}</td>
              <td style="border: 1px solid #000; padding: 6px; width: 25%;"><span class="bold">Ano:</span> ${vei.ano || 'Não informado'}</td>
              <td style="border: 1px solid #000; padding: 6px; width: 25%; font-family: monospace;"><span class="bold">Placa:</span> ${(vei.placa || '').toUpperCase()}</td>
              <td style="border: 1px solid #000; padding: 6px; width: 25%;"><span class="bold">Quilometragem Atual:</span> ${this.kmAtual}</td>
            </tr>
          </table>

          <div style="margin-bottom: 20px;">
            <span class="bold">Descrição da Ocorrência pelo Cliente:</span> ${this.itensAdicionados.length > 0 ? 'Reparo e manutenção conforme itens listados abaixo.' : 'Análise técnica de componentes.'}
          </div>

          <div class="text-center bold box-linha" style="border: 1px solid #000; font-size: 13px;">
            Relação de Peças e Serviços
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: -1px;">
            <thead>
              <tr style="background-color: #f0f0f0;">
                <th style="border: 1px solid #000; padding: 6px; width: 8%;">Cod</th>
                <th style="border: 1px solid #000; padding: 6px; width: 52%; text-align: left;">Descrição</th>
                <th style="border: 1px solid #000; padding: 6px; width: 12%;">Q. Produto</th>
                <th style="border: 1px solid #000; padding: 6px; width: 14%; text-align: right;">Preço</th>
                <th style="border: 1px solid #000; padding: 6px; width: 14%; text-align: right;">P. Total</th>
              </tr>
            </thead>
            <tbody>
              ${linhasHtml}
            </tbody>
          </table>

          <div class="totals-box">
            <div style="text-align: left; float: left; margin-top: 5px;">
              <span class="bold">Garantia da Loja:</span> Conforme fabricante.
            </div>
            <div><span class="bold">Total Produto:</span> R$ ${this.totalPecas.toFixed(2)}</div>
            <div style="margin-top: 3px;"><span class="bold">Total Serviço:</span> R$ ${this.totalServicos.toFixed(2)}</div>
            <div class="total-geral">TOTAL GERAL: R$ ${this.totalGeral.toFixed(2)}</div>
          </div>

        </body>
      </html>
    `;

    try {
      const nomeArquivo = `Orcamento_${cli.nome.replace(/\s+/g, '_')}.pdf`;
      const result = await (window as any).electronAPI.printPDF({
        cliente: cli.nome,
        servico: 'Orcamento',
        nomeArquivo,
        html: html,
      });

      if (result?.success) {
        Swal.fire({
          title: 'Orçamento Gerado!',
          text: 'Salvo com sucesso em: ' + result.path,
          icon: 'success',
          confirmButtonColor: '#2563eb',
        });
      } else {
        Swal.fire({
          title: 'Ops!',
          text: 'Erro ao salvar PDF: ' + (result?.error || 'desconhecido'),
          icon: 'error',
          confirmButtonColor: '#ef4444',
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Erro',
        text: 'Falha crítica ao comunicar com o gerador de impressões.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }
}
