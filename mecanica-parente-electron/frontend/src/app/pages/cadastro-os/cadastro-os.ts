import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cadastro-os',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-os.html',
})
export class CadastroOs implements OnInit {
  abaAtiva: 'abertura' | 'complementos' | 'itens' | 'finalizacao' = 'abertura';

  // Buscas
  nomeBusca = '';
  clientesEncontrados: any[] = [];
  veiculosDoCliente: any[] = [];
  clienteSelecionado: any = null;
  veiculoSelecionado: any = null;

  // Catálogos do Banco de Dados
  estoqueProdutos: any[] = [];
  tabelaServicos: any[] = [];
  listaFuncionarios: any[] = []; // <-- ADICIONADO: Lista de mecânicos
  itensAdicionados: any[] = [];

  // Dados do Formulário
  osDados = {
    numeroOS: Math.floor(Math.random() * 10000) + 1000,
    telefone: '',
    celular: '',
    defeitoRelatado: '',
    laudoTecnico: '',
    kmAtual: '',
    dataChegada: new Date().toLocaleDateString('pt-BR'),
    dataEntrega: '',
    horaEntrega: '',
    garantia: '1',
    tecnico: '', // <-- ALTERADO: Começa vazio para obrigar a seleção
    tipoPagamento: 'Débito',
    parcelas: '1',
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregarDadosBase();
  }

  setAba(aba: 'abertura' | 'complementos' | 'itens' | 'finalizacao') {
    this.abaAtiva = aba;
  }

  async carregarDadosBase() {
    const resProd = await (window as any).electronAPI.listarProdutos();
    const resServ = await (window as any).electronAPI.listarServicos();
    const resFunc = await (window as any).electronAPI.listarFuncionarios(); // <-- ADICIONADO: Busca os mecânicos

    if (resProd.success) this.estoqueProdutos = resProd.produtos;
    if (resServ.success) this.tabelaServicos = resServ.servicos;
    if (resFunc.success) this.listaFuncionarios = resFunc.funcionarios; // <-- ADICIONADO: Salva a lista de mecânicos
  }

  // ==========================================
  // ABA 1: AUTO-COMPLETAR CLIENTE E VEÍCULO
  // ==========================================
  async buscarCliente() {
    if (this.nomeBusca.length < 3) {
      this.clientesEncontrados = [];
      return;
    }
    const res = await (window as any).electronAPI.buscarClientePorNome(this.nomeBusca);
    if (res.success && res.clientes.length > 0) {
      this.clientesEncontrados = res.clientes;
      this.cdr.detectChanges();
    } else {
      this.clientesEncontrados = [];
      this.cdr.detectChanges();
    }
  }

  async selecionarCliente(cli: any) {
    this.clienteSelecionado = cli;
    this.nomeBusca = cli.nome;
    this.osDados.telefone = cli.telefone || '';
    this.osDados.celular = cli.celular || '';
    this.clientesEncontrados = [];

    const res = await (window as any).electronAPI.listarVeiculos(cli.id);
    if (res.success) this.veiculosDoCliente = res.veiculos;
    this.cdr.detectChanges();
  }

  selecionarVeiculo(vei: any) {
    this.veiculoSelecionado = vei;
  }

  // ==========================================
  // ABA 3: ADICIONAR ITENS (PEÇAS/SERVIÇOS)
  // ==========================================
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
  }

  removerItem(index: number) {
    this.itensAdicionados.splice(index, 1);
  }

  // ==========================================
  // ABA 4: TOTAIS E PDF
  // ==========================================
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

  async gerarPDF() {
    if (!this.clienteSelecionado || !this.veiculoSelecionado) {
      alert('Selecione um cliente e um veículo na aba de Abertura.');
      return;
    }

    const cli = this.clienteSelecionado;
    const vei = this.veiculoSelecionado;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');

    const linhasHtml = this.itensAdicionados
      .map(
        (item) => `
      <tr>
        <td>${item.codigo}</td>
        <td>${item.nome}</td>
        <td class="text-center-col">${item.quantidade}</td>
        <td class="text-right">${item.preco.toFixed(2)}</td>
        <td class="text-right">${(item.preco * item.quantidade).toFixed(2)}</td>
      </tr>
    `,
      )
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ordem de Serviço - ${cli.nome}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            html, body { height: 100%; font-family: Arial, sans-serif; color: #000; font-size: 13px; -webkit-print-color-adjust: exact; margin: 0;}
            .text-center { text-align: center; } .bold { font-weight: bold; }
            .header-text { font-size: 12px; line-height: 1.3; } .title-parente { font-size: 18px; font-weight: bold; margin: 4px 0; }
            .flex-row { display: flex; justify-content: space-between; margin-bottom: 6px; width: 100%; }
            .flex-start { display: flex; justify-content: flex-start; gap: 40px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 13px; }
            th, td { padding: 5px 2px; text-align: left; border-bottom: 1px solid #ccc; }
            th { border-top: 1px solid #000; border-bottom: 1px solid #000; }
            .text-right { text-align: right; } .text-center-col { text-align: center; }
            .assinaturas { margin-top: 60px; display: flex; justify-content: space-between; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center header-text">
            <div>JACAREÍ-SP</div>
            <div class="title-parente">MECÂNICA PARENTE</div>
            <div>AVENIDA MARIA AUGUSTA FAGUNDES GOMES 105 (12)3956-1806</div>
            <div>CEP: 12322-300</div>
            <div>ELÉTRICA-AUTO MECÂNICA-MECÂNICA DIESEL-INJEÇÃO ELETRÔNICA</div>
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 16px; font-weight: bold; text-decoration: underline;">
            Ordem de Serviço
          </div>
          <div style="text-align: right; font-weight: bold; margin-top: -18px;">N°: ${this.osDados.numeroOS}</div>

          <div style="margin-top: 25px;">
            <div class="flex-row">
              <div><span class="bold">Data Entrada:</span> ${dataAtual}</div>
              <div>${dataAtual}</div>
            </div>
            <div class="flex-row"><div><span class="bold">Hora de Entrada:</span> ${horaAtual}</div></div>
          </div>

          <div style="margin-top: 15px;">
            <div class="flex-row"><div><span class="bold">Dados do Cliente:</span> ${cli.nome}</div></div>
            <div class="flex-row"><div><span class="bold">CPF/CNPJ:</span> ${cli.cpf || ''}</div></div>
            <div class="flex-row">
              <div><span class="bold">Endereço:</span> ${cli.endereco || ''}</div>
              <div><span class="bold">Cidade:</span> ${cli.cidade || ''}</div>
              <div><span class="bold">RG/insc. Estadual:</span> ${cli.rg || ''}</div>
            </div>
            <div class="flex-row">
              <div><span class="bold">Bairro:</span> ${cli.bairro || ''} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <span class="bold">UF:</span> ${cli.uf || 'SP'}</div>
            </div>
            <div class="flex-row">
              <div><span class="bold">Celular:</span> ${this.osDados.celular}</div>
              <div><span class="bold">Telef. Residencial:</span> ${this.osDados.telefone}</div>
            </div>
          </div>

          <div style="margin-top: 15px;">
            <div class="bold mb-1">Observações do Veículo:</div>
            <div class="flex-row" style="margin-top: 5px;">
              <div><span class="bold">Veículo:</span> ${vei.modelo}</div>
              <div><span class="bold">Marca:</span> ${vei.marca}</div>
              <div><span class="bold">Cor:</span> ${vei.cor || ''}</div>
              <div><span class="bold">Ano:</span> ${vei.ano || ''}</div>
            </div>
            <div class="flex-start">
              <div><span class="bold">Placa:</span> ${(vei.placa || '').toUpperCase()}</div>
              <div><span class="bold">Quilometragem Atual:</span> ${this.osDados.kmAtual}</div>
            </div>
            
            <div style="margin-top: 15px;"><span class="bold">Ocorrência relatada:</span> ${this.osDados.defeitoRelatado}</div>
            <div style="margin-top: 15px;">
              <div class="bold">Observações Técnicas: (Laudo Técnico)</div>
              <div style="margin-top: 3px;">${this.osDados.laudoTecnico}</div>
            </div>
            <div style="margin-top: 15px;"><span class="bold">Técnico Responsável:</span> ${this.osDados.tecnico}</div>
          </div>

          <div style="margin-top: 25px;">
            <div class="bold">TROCA DE PEÇAS RELACIONADAS ABAIXO:</div>
            <div class="flex-start" style="margin-top: 5px;">
              <div><span class="bold">Previsão de Entrega:</span> ${this.osDados.dataEntrega}</div>
              <div><span class="bold">Hora de Entrega:</span> ${this.osDados.horaEntrega}</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Cod</th>
                  <th>Descrição</th>
                  <th class="text-center-col">Q.Produto</th>
                  <th class="text-right">Preco</th>
                  <th class="text-right">P.Total</th>
                </tr>
              </thead>
              <tbody>
                ${linhasHtml}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 15px;">
            <div style="margin-bottom: 3px;"><span class="bold">Garantia da Loja:</span> ${this.osDados.garantia} Meses</div>
            <div style="margin-bottom: 3px;"><span class="bold">Total Produto:</span> R$ ${this.totalPecas.toFixed(2)}</div>
            <div style="margin-bottom: 3px;"><span class="bold">Total Serviço:</span> R$ ${this.totalServicos.toFixed(2)}</div>
            <div class="bold" style="margin-top: 10px; font-size: 14px;">TOTAL GERAL: R$ ${this.totalGeral.toFixed(2)}</div>
          </div>

          <div style="margin-top: 25px;">
            <div class="bold">Condições de Pagamento</div>
            <div style="margin-top: 3px;"><span class="bold">Tipo:</span> ${this.osDados.tipoPagamento} - ${this.osDados.parcelas} Parcela(s)</div>
          </div>

          <div class="assinaturas">
            <div>__________________________<br/>Cliente:</div>
            <div>__________________________<br/>Empresa:</div>
            <div>__________________________<br/>Supervisor:</div>
          </div>
        </body>
      </html>
    `;

    try {
      const nomeArquivo = `os_${this.osDados.numeroOS}_${cli.nome.replace(/\s+/g, '_')}.pdf`;
      const result = await (window as any).electronAPI.printPDF({
        cliente: cli.nome,
        servico: 'os',
        nomeArquivo,
        html,
      });

      if (result?.success) {
        // ✨ ALERTA DE SUCESSO DO SWEETALERT ✨
        Swal.fire({
          title: 'OS Gerada!',
          text: 'Salva em: ' + result.path,
          icon: 'success',
          confirmButtonColor: '#2563eb', // Azul do Tailwind para combinar com seu botão
          confirmButtonText: 'Maravilha!',
        });
      } else {
        // ✨ ALERTA DE ERRO DO SWEETALERT ✨
        Swal.fire({
          title: 'Ops! Algo deu errado.',
          text: 'Erro ao salvar PDF: ' + (result?.error || 'Erro desconhecido'),
          icon: 'error',
          confirmButtonColor: '#ef4444', // Vermelho do Tailwind
        });
      }
    } catch (err) {
      Swal.fire({
        title: 'Erro Crítico',
        text: 'Não foi possível gerar o PDF da OS.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }
}
