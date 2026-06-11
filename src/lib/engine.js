import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const COLORS_MAP = { NAVY: "#1e3a8a", GOLD: "#C5A059", SLATE_DARK: "#334155", SLATE_MID: "#64748b" };
export const OFFICE_NAME = "SETE Soluções Empresariais";

// ===== Valores anuais — ATUALIZAR a cada virada de exercício =====
export const SALARIO_MINIMO = 1621.00;   // 2026
export const TETO_INSS = 8475.55;        // 2026 — Portaria MPS/MF nº 13/2026
export const SUBLIMITE_SN = 3600000;     // sublimite do Simples: acima, ICMS/ISS fora do DAS
export const LIMITE_SN = 4800000;        // teto do Simples Nacional

export const parseNumBR = (v) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    return parseFloat(String(v).replace(/[^\d.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
};

export const formatCurrency = (val) => {
    const num = parseNumBR(val) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};
export const formatPercent = (val) => (parseNumBR(val) || 0).toFixed(2).replace('.', ',') + '%';

export const calculateTotalRevenue = (data) => {
    const isSimplesOuMei = data.regime === 'Simples Nacional' || data.regime === 'MEI';
    if (isSimplesOuMei) return parseNumBR(data.revenue);
    return parseNumBR(data.revenueRetained) + parseNumBR(data.revenueNonRetained);
};

export const formatCNPJ = (v) => {
    const d = String(v || '').replace(/\D/g, '').slice(0, 14);
    return d.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
};

// Estrutura Base dos Tributos
export const DEFAULT_TAXES_LP = [
    { id: 1, tax: "PIS", base: "", rate: "0,65", apurado: "", retido: "", value: "", dueDate: "", obs: "Regime cumulativo", retidoManual: false },
    { id: 2, tax: "COFINS", base: "", rate: "3,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Regime cumulativo", retidoManual: false },
    { id: 3, tax: "ISS", base: "", rate: "5,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Imposto municipal sobre serviços", retidoManual: false },
    { id: 4, tax: "IRPJ", base: "", rate: "15,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Provisão mensal (Venc. Real Trimestral)", retidoManual: false },
    { id: 5, tax: "CSLL", base: "", rate: "9,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Provisão mensal (Venc. Real Trimestral)", retidoManual: false },
    { id: 6, tax: "CPP (Patronal)", base: "", rate: "20,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Contribuição previdenciária", retidoManual: false },
    { id: 7, tax: "RAT", base: "", rate: "1,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Risco Ambiental do Trabalho", retidoManual: false },
    { id: 8, tax: "Terceiros", base: "", rate: "5,80", apurado: "", retido: "", value: "", dueDate: "", obs: "SESC, SENAC, SEBRAE, etc.", retidoManual: false },
];

// Comércio/Indústria no LP: ICMS por débito e crédito no lugar do ISS
export const DEFAULT_TAXES_LP_COMERCIO = [
    { id: 1, tax: "PIS", base: "", rate: "0,65", apurado: "", retido: "", value: "", dueDate: "", obs: "Regime cumulativo", retidoManual: false },
    { id: 2, tax: "COFINS", base: "", rate: "3,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Regime cumulativo", retidoManual: false },
    { id: 3, tax: "ICMS", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "Apuração por débito e crédito", retidoManual: false },
    { id: 4, tax: "IRPJ", base: "", rate: "15,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Provisão mensal (Venc. Real Trimestral)", retidoManual: false },
    { id: 5, tax: "CSLL", base: "", rate: "9,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Provisão mensal (Venc. Real Trimestral)", retidoManual: false },
    { id: 6, tax: "CPP (Patronal)", base: "", rate: "20,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Contribuição previdenciária", retidoManual: false },
    { id: 7, tax: "RAT", base: "", rate: "1,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Risco Ambiental do Trabalho", retidoManual: false },
    { id: 8, tax: "Terceiros", base: "", rate: "5,80", apurado: "", retido: "", value: "", dueDate: "", obs: "SESC, SENAC, SEBRAE, etc.", retidoManual: false },
];

export const lpDefaults = (atividade) => (atividade === 'Comércio' || atividade === 'Indústria') ? DEFAULT_TAXES_LP_COMERCIO : DEFAULT_TAXES_LP;

// Apuração estadual do comércio (LP/Real): ICMS débito/crédito, antecipação parcial,
// DIFAL e FUMACOP (adicional de 2% — Lei 8.205/2004, MA)
export const calcComercioLP = (data, totalRevenue) => {
    const entradas = parseNumBR(data.entradasCompras);
    const aliqInterna = parseNumBR(data.aliqIcmsSaida);
    const aliqERaw = parseNumBR(data.aliqIcmsEntrada);
    const aliqE = aliqERaw > 0 ? aliqERaw : aliqInterna;
    const saldoAnterior = parseNumBR(data.saldoCredorICMS);
    const comprasInter = parseNumBR(data.comprasInterestaduais);
    const aliqInter = parseNumBR(data.aliqInterestadual);
    const baseDifal = parseNumBR(data.baseDifal);
    const baseFumacop = parseNumBR(data.baseFumacop);

    let icms = null;
    if (totalRevenue > 0 && aliqInterna > 0) {
        const debito = totalRevenue * aliqInterna / 100;
        const credito = entradas * aliqE / 100 + saldoAnterior;
        icms = { debito, credito, aliqS: aliqInterna, aliqE, saldoAnterior, aPagar: Math.max(0, debito - credito), saldoCredor: Math.max(0, credito - debito) };
    }
    const difAliq = Math.max(0, aliqInterna - aliqInter);
    const antecipacao = (comprasInter > 0 && aliqInter > 0 && difAliq > 0) ? comprasInter * difAliq / 100 : 0;
    const difal = (baseDifal > 0 && aliqInter > 0 && difAliq > 0) ? baseDifal * difAliq / 100 : 0;
    const fumacop = baseFumacop > 0 ? baseFumacop * 0.02 : 0;
    return { icms, antecipacao, difal, fumacop, entradas, comprasInter, baseDifal, baseFumacop, aliqInterna, aliqInter, difAliq };
};

export const DEFAULT_TAXES_SN_SERVICOS = [
    { id: 1, tax: "DAS", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "Documento de Arrecadação do Simples", retidoManual: false },
    { id: 2, tax: "ISS (retido)", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "ISS retido na fonte, se aplicável", retidoManual: false },
    { id: 3, tax: "INSS (Sócio)", base: "", rate: "11,00", apurado: "", retido: "", value: "", dueDate: "", obs: "Retenção sobre Pró-labore", retidoManual: false },
];

export const DEFAULT_TAXES_SN_COMERCIO = [
    { id: 1, tax: "DAS", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "Documento de Arrecadação do Simples", retidoManual: false },
    { id: 2, tax: "ICMS (ST)", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "Substituição tributária, se aplicável", retidoManual: false },
    { id: 3, tax: "DIFAL", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "Diferencial de alíquota, se aplicável", retidoManual: false },
];

// DAS-MEI = 5% do salário-mínimo (INSS) + ICMS R$ 1,00 e/ou ISS R$ 5,00 (fixos por lei)
const INSS_MEI = SALARIO_MINIMO * 0.05;
const fmtMEI = (n) => n.toFixed(2).replace('.', ',');
export const DEFAULT_TAXES_MEI_COMERCIO = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: fmtMEI(INSS_MEI + 1), retido: "", value: fmtMEI(INSS_MEI + 1), dueDate: "", obs: `INSS R$ ${fmtMEI(INSS_MEI)} + ICMS R$ 1,00`, retidoManual: false } ];
export const DEFAULT_TAXES_MEI_SERVICOS = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: fmtMEI(INSS_MEI + 5), retido: "", value: fmtMEI(INSS_MEI + 5), dueDate: "", obs: `INSS R$ ${fmtMEI(INSS_MEI)} + ISS R$ 5,00`, retidoManual: false } ];
export const DEFAULT_TAXES_MEI_AMBOS = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: fmtMEI(INSS_MEI + 6), retido: "", value: fmtMEI(INSS_MEI + 6), dueDate: "", obs: `INSS R$ ${fmtMEI(INSS_MEI)} + ICMS R$ 1,00 + ISS R$ 5,00`, retidoManual: false } ];

export const DEFAULT_TAXES = DEFAULT_TAXES_LP;

export const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const GLOSSARY = [
    { acronym: "IRPJ", full: "Imposto de Renda Pessoa Jurídica", icon: "Landmark", matchTaxes: ["IRPJ", "Adicional IRPJ"], desc: "Imposto federal sobre o lucro da empresa. O vencimento oficial do DARF ocorre trimestralmente." },
    { acronym: "CSLL", full: "Contribuição Social sobre o Lucro Líquido", icon: "Building2", matchTaxes: ["CSLL"], desc: "Contribuição que financia a seguridade social. Vencimento oficial trimestral no Lucro Presumido/Real." },
    { acronym: "ISS", full: "Imposto Sobre Serviços", icon: "Receipt", matchTaxes: ["ISS", "ISS (retido)"], desc: "Imposto de competência municipal, cobrado sobre a prestação de serviços." },
    { acronym: "PIS/COFINS", full: "Programa de Integração Social / COFINS", icon: "BadgePercent", matchTaxes: ["PIS", "COFINS", "PIS/COFINS"], desc: "Contribuições federais incidentes sobre faturamento bruto." },
    { acronym: "CPP", full: "Contribuição Previdenciária Patronal", icon: "Scale", matchTaxes: ["CPP", "CPP (Patronal)"], desc: "Encargo patronal de 20% sobre o montante da folha de salários e do pró-labore." },
    { acronym: "RAT", full: "Riscos Ambientais do Trabalho", icon: "Scale", matchTaxes: ["RAT", "RAT (Ajustado)"], desc: "Contribuição previdenciária patronal para financiamento de aposentadoria especial e benefícios por acidentes." },
    { acronym: "Terceiros", full: "Outras Entidades e Fundos", icon: "Building2", matchTaxes: ["Terceiros"], desc: "Contribuição destinada a outras entidades e fundos (Sistema S: SESC, SENAC, SEBRAE, etc.)." },
    { acronym: "INSS (Sócio)", full: "Contribuição do Segurado", icon: "Scale", matchTaxes: ["INSS (Sócio)"], desc: "Retenção previdenciária de 11% obrigatória sobre a retirada de pró-labore do sócio." },
    { acronym: "INSS (Retenção)", full: "Retenção Previdenciária", icon: "Receipt", matchTaxes: ["INSS (retido)"], desc: "Retenção de INSS na fonte referente à prestação de serviços." },
    { acronym: "FGTS", full: "Fundo de Garantia do Tempo de Serviço", icon: "Landmark", matchTaxes: ["FGTS"], desc: "Depósito equivalente a 8% da remuneração de cada trabalhador na folha de salários." },
    { acronym: "DAS", full: "Documento de Arrecadação do Simples Nacional", icon: "Receipt", matchTaxes: ["DAS", "DAS-MEI"], desc: "Guia única de recolhimento do Simples Nacional que unifica diversos tributos em uma alíquota." },
    { acronym: "ICMS", full: "Imposto sobre Circulação de Mercadorias e Serviços", icon: "Receipt", matchTaxes: ["ICMS", "ICMS (ST)"], desc: "Imposto estadual sobre a circulação de mercadorias, apurado pelo confronto entre débitos (saídas) e créditos (entradas)." },
    { acronym: "Antecipação Parcial", full: "ICMS antecipado nas compras interestaduais", icon: "Receipt", matchTaxes: ["Antecipação Parcial"], desc: "Diferença entre a alíquota interna e a interestadual, recolhida antecipadamente sobre o valor das mercadorias compradas de outros estados para revenda." },
    { acronym: "DIFAL", full: "Diferencial de Alíquotas", icon: "Receipt", matchTaxes: ["DIFAL"], desc: "Diferença entre a alíquota interna e a interestadual sobre compras de outros estados destinadas a uso, consumo ou ativo imobilizado." },
    { acronym: "FUMACOP", full: "Fundo Maranhense de Combate à Pobreza", icon: "Landmark", matchTaxes: ["FUMACOP"], desc: "Adicional de 2 pontos percentuais de ICMS sobre produtos da Lei 8.205/2004 (MA), recolhido em guia própria." },
];

export const SN_TABLES = {
    'Anexo I': [ { limit: 180000, rate: 4.00, deduction: 0 }, { limit: 360000, rate: 7.30, deduction: 5940 }, { limit: 720000, rate: 9.50, deduction: 13860 }, { limit: 1800000, rate: 10.70, deduction: 22500 }, { limit: 3600000, rate: 14.30, deduction: 87300 }, { limit: 4800000, rate: 19.00, deduction: 378000 } ],
    'Anexo II': [ { limit: 180000, rate: 4.50, deduction: 0 }, { limit: 360000, rate: 7.80, deduction: 5940 }, { limit: 720000, rate: 10.00, deduction: 13860 }, { limit: 1800000, rate: 11.20, deduction: 22500 }, { limit: 3600000, rate: 14.70, deduction: 85500 }, { limit: 4800000, rate: 30.00, deduction: 720000 } ],
    'Anexo III': [ { limit: 180000, rate: 6.00, deduction: 0 }, { limit: 360000, rate: 11.20, deduction: 9360 }, { limit: 720000, rate: 13.50, deduction: 17640 }, { limit: 1800000, rate: 16.00, deduction: 35640 }, { limit: 3600000, rate: 21.00, deduction: 125640 }, { limit: 4800000, rate: 33.00, deduction: 648000 } ],
    'Anexo IV': [ { limit: 180000, rate: 4.50, deduction: 0 }, { limit: 360000, rate: 9.00, deduction: 8100 }, { limit: 720000, rate: 10.20, deduction: 12420 }, { limit: 1800000, rate: 14.00, deduction: 39780 }, { limit: 3600000, rate: 22.00, deduction: 183780 }, { limit: 4800000, rate: 33.00, deduction: 828000 } ],
    'Anexo V': [ { limit: 180000, rate: 15.50, deduction: 0 }, { limit: 360000, rate: 18.00, deduction: 4500 }, { limit: 720000, rate: 19.50, deduction: 9900 }, { limit: 1800000, rate: 20.50, deduction: 17100 }, { limit: 3600000, rate: 23.00, deduction: 62100 }, { limit: 4800000, rate: 30.50, deduction: 540000 } ],
};

export const calcAliquotaEfetivaSN = (rbt12, anexo) => {
    const table = SN_TABLES[anexo];
    if (!table || rbt12 <= 0) return { rate: 0, nominal: 0, deduction: 0, faixa: 0 };
    const faixa = table.find(f => rbt12 <= f.limit) || table[table.length - 1];
    const faixaIdx = table.indexOf(faixa) + 1;
    const effective = ((rbt12 * (faixa.rate / 100)) - faixa.deduction) / rbt12 * 100;
    return { rate: Math.max(effective, 0), nominal: faixa.rate, deduction: faixa.deduction, faixa: faixaIdx };
};

export const calcFatorR = (folha12m, rbt12) => {
    if (!rbt12 || rbt12 <= 0) return 0;
    return (folha12m / rbt12) * 100;
};

// A migração Anexo III ↔ V pelo Fator R só vale para atividades sujeitas a ele (LC 123, art. 18, §5º-I/J).
// Atividades que são Anexo III por natureza (ex.: contabilidade, escolas) não migram.
export const getAnexoEfetivo = (anexo, fatorR, sujeitoFatorR = true) => {
    if (!sujeitoFatorR) return anexo;
    if (anexo === 'Anexo V' && fatorR >= 28) return 'Anexo III';
    if (anexo === 'Anexo III' && fatorR < 28) return 'Anexo V';
    return anexo;
};

// Sem flag explícita, deriva: Anexo V implica atividade de Fator R; Anexo III só se há folha informada
// (preserva o comportamento de rascunhos antigos, que não têm o campo sujeitoFatorR).
export const isSujeitoFatorR = (data, folha12m) =>
    data.sujeitoFatorR !== undefined ? !!data.sujeitoFatorR : (data.anexo === 'Anexo V' || (folha12m || 0) > 0);

export const FERIADOS_NACIONAIS = ['01/01', '21/04', '01/05', '07/09', '12/10', '02/11', '15/11', '20/11', '25/12']; // fixos; móveis (Carnaval/Corpus Christi) não inclusos
const pad2 = (n) => String(n).padStart(2, '0');
const isDiaUtil = (d) => d.getDay() !== 0 && d.getDay() !== 6 && !FERIADOS_NACIONAIS.includes(pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1));

export const lastBusinessDay = (month, year) => {
    const lastDay = new Date(year, month, 0).getDate();
    let d = new Date(year, month - 1, lastDay);
    while (!isDiaUtil(d)) d.setDate(d.getDate() - 1);
    return d.getDate();
};

export const getDueDate = (compMonth, compYear, taxName, irpjCsllMode) => {
    if (!compMonth || !compYear) return '';
    const m = parseInt(compMonth), y = parseInt(compYear);
    let nextM = m + 1, nextY = y;
    if (nextM > 12) { nextM = 1; nextY++; }
    const pad = pad2;
    const dueDateMap = {
        'PIS': 25, 'COFINS': 25, 'PIS/COFINS': 25, 'ISS': 15, 'ISS (retido)': 15,
        'CPP': 20, 'CPP (Patronal)': 20, 'RAT': 20, 'RAT (Ajustado)': 20, 'Terceiros': 20,
        'INSS': 20, 'INSS (retido)': 20, 'INSS (Sócio)': 20, 'FGTS': 20,
        'DAS': 20, 'DAS-MEI': 20, 'ICMS (ST)': 10, 'DIFAL': 10,
        'ICMS': 20, 'Antecipação Parcial': 20, 'FUMACOP': 20,
    };
    if (['IRPJ', 'CSLL', 'Adicional IRPJ'].includes(taxName)) {
        // Trimestral: a quota única vence no mês seguinte ao ENCERRAMENTO do trimestre (mar/jun/set/dez)
        if (irpjCsllMode === 'Trimestral (Apuração)' && ![3, 6, 9, 12].includes(m)) return '';
        return `${pad(lastBusinessDay(nextM, nextY))}/${pad(nextM)}/${nextY}`;
    }
    const dia = dueDateMap[taxName];
    if (!dia) return '';
    // Dia não útil: tributos federais de folha e PIS/COFINS ANTECIPAM; DAS, ISS e guias estaduais POSTERGAM
    const antecipa = ['PIS', 'COFINS', 'PIS/COFINS', 'CPP', 'CPP (Patronal)', 'RAT', 'RAT (Ajustado)', 'Terceiros', 'INSS', 'INSS (retido)', 'INSS (Sócio)', 'FGTS'].includes(taxName);
    const d = new Date(nextY, nextM - 1, dia);
    while (!isDiaUtil(d)) d.setDate(d.getDate() + (antecipa ? -1 : 1));
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

export const getBasePresumidaLP = (revenue, taxName, atividade, irpjCsllMode, equiparada) => {
    const isServ = (atividade || 'Serviços') === 'Serviços';
    const eq = isServ ? Math.min(Math.max(parseNumBR(equiparada) || 0, 0), revenue) : 0;
    const norm = revenue - eq;
    const baseIRPJ = isServ ? (eq * 0.08 + norm * 0.32) : (revenue * 0.08);
    const baseCSLL = isServ ? (eq * 0.12 + norm * 0.32) : (revenue * 0.12);
    if (taxName === 'Adicional IRPJ') {
        const limit = (irpjCsllMode === 'Trimestral (Apuração)') ? 60000 : 20000;
        return Math.max(0, baseIRPJ - limit);
    }
    if (taxName === 'IRPJ') return baseIRPJ;
    if (taxName === 'CSLL') return baseCSLL;
    return revenue;
};

export const formatBRLDisplay = (num) => {
    if (!num && num !== 0) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ===== Importação de PGDAS-D (PDF) =====
export const pgNum = parseNumBR;

export async function extractPdfText(file) {
    if (!pdfjsLib) throw new Error('Leitor de PDF (pdf.js) não carregou. Verifique a conexão.');
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join('\n') + '\n';
    }
    return text;
}

export function parsePGDASD(T) {
    const res = { ok: false };
    if (!/Simples\s+Nacional|Per[ií]odo\s+de\s+Apura|PGDAS|Documento\s+de\s+Arrecada/i.test(T)) { res.error = 'O arquivo não parece ser um PGDAS-D.'; return res; }
    const g = (re) => { const m = T.match(re); return m; };
    const cnpj = g(/CNPJ\s+Matriz:\s*([\d.]+\/\d{4}-\d{2})/i);
    const nome = g(/Nome\s+empresarial:\s*([\s\S]*?)\s*Data\s+de\s+abertura/i);
    const comp = g(/Per[ií]odo\s+de\s+Apura[çc][ãa]o:\s*\d{2}\/(\d{2})\/(\d{4})/i);
    const rpa = g(/RPA\)[\s\S]*?Compet[êe]ncia\s*([\d.]+,\d{2})/i);
    const rbt12 = g(/\(RBT12\)[^\d]*?([\d.]+,\d{2})/);
    const folha = g(/Total\s+de\s+Folhas\s+de\s+Sal[áa]rios\s+Anteriores[\s\S]*?R\$\s*([\d.]+,\d{2})/i);
    const fator = g(/Fator\s+r\s*=\s*([\d,]+)\s*[-–—]\s*(Anexo\s+[IVX]+)/i);
    const das = g(/Valor\s+Total\s+do\s+D[ée]bito\s+Declarado[^\d]*([\d.]+,\d{2})(?:\D{0,40}([\d.]+,\d{2}))?/i);
    const mun = g(/Munic[íi]pio:\s*([A-Za-zÀ-ú][A-Za-zÀ-ú .]*?)\s*UF:\s*([A-Z]{2})/i);

    if (cnpj) res.cnpj = cnpj[1];
    if (nome) res.nome = nome[1].replace(/\s+/g, ' ').trim();
    if (comp) { res.compMonth = String(parseInt(comp[1])); res.compYear = comp[2]; res.competenceShort = comp[1] + '/' + comp[2]; }
    if (rpa) res.rpa = rpa[1];
    if (rbt12) res.rbt12 = rbt12[1];
    if (folha) res.folha12m = folha[1];
    if (fator) { res.fatorR = fator[1]; res.anexo = fator[2].replace(/\s+/, ' '); }
    if (das) res.das = das[2] || das[1];
    if (mun) res.municipio = mun[1].trim() + '/' + mun[2];
    res.atividade = /Presta[çc][ãa]o\s+de\s+Servi[çc]os/i.test(T) ? 'Serviços' : (/Com[ée]rcio/i.test(T) ? 'Comércio' : 'Serviços');
    // Mais de um estabelecimento: os valores capturados podem ser só da matriz — avisar o usuário
    if ((T.match(/Estabelecimento/gi) || []).length > 1) res.multiEstab = true;

    // Evolução do faturamento — seção 2.2.1 (Mercado Interno); fallback se 2.2.2 não existir no layout
    const block = T.match(/2\.2\.1\)[^]*?(?:2\.2\.2\)|2\.3\)|$)/);
    const ev = {};
    if (block) {
        const re = /(\d{2}\/\d{4})\s+([\d.]+,\d{2})/g; let m;
        while ((m = re.exec(block[0]))) ev[m[1]] = pgNum(m[2]);
    }
    if (res.compMonth && res.compYear) {
        const series = []; const mo = parseInt(res.compMonth), yr = parseInt(res.compYear);
        for (let k = 11; k >= 0; k--) {
            let mm = mo - k, yy = yr; while (mm <= 0) { mm += 12; yy--; }
            const key = String(mm).padStart(2, '0') + '/' + yy;
            let val = ev[key] || 0;
            if (mm === mo && yy === yr) val = pgNum(res.rpa);
            series.push({ ym: key, receita: val });
        }
        res.evolucao = series;
    }
    res.ok = !!(res.cnpj || res.rpa || res.das);
    return res;
}

export const autoFillTaxes = (data, currentTaxes) => {
    const totalRevenue = calculateTotalRevenue(data);
    const revComRetencao = (data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real') ? parseNumBR(data.revenueRetained) : 0;
    
    const proLabore = parseNumBR(data.proLabore);
    const rbt12 = parseNumBR(data.rbt12);
    const folha12m = parseNumBR(data.folha12m !== undefined ? data.folha12m : data.folha);
    const folhaMensal = parseNumBR(data.folhaMensal !== undefined ? data.folhaMensal : data.folha);
    const atividade = data.atividade || 'Serviços';
    const sujeitoFatorR = isSujeitoFatorR(data, folha12m);
    const isComercioInd = atividade === 'Comércio' || atividade === 'Indústria';
    const isLPouReal = data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real';
    const mov = (isLPouReal && isComercioInd) ? calcComercioLP(data, totalRevenue) : null;
    const fmtPct = (n) => n.toFixed(2).replace('.', ',');

    return currentTaxes.map(t => {
        const updated = { ...t };
        const isRegimeNormal = data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real';
        const isAnexoIV = data.regime === 'Simples Nacional' && data.anexo === 'Anexo IV';

        if (isRegimeNormal || isAnexoIV) {
            const baseFat = ['PIS', 'COFINS', 'PIS/COFINS', 'ISS'];
            const basePres = ['IRPJ', 'CSLL', 'Adicional IRPJ'];
            // CPP (20%) incide sobre folha + pró-labore; RAT, Terceiros e FGTS só sobre a folha de empregados
            const baseCPP = ['CPP', 'CPP (Patronal)'];
            const baseFolhaEmp = ['RAT', 'RAT (Ajustado)', 'Terceiros', 'FGTS'];

            if (baseFat.includes(t.tax)) {
                updated.base = totalRevenue > 0 ? formatBRLDisplay(totalRevenue) : "";
            } else if (basePres.includes(t.tax) && isRegimeNormal) {
                const baseRevenueToUse = (data.irpjCsllMode === 'Trimestral (Apuração)' || data.irpjCsllMode === 'Estimativa (Anual)') && parseNumBR(data.periodRevenue) > 0
                    ? parseNumBR(data.periodRevenue)
                    : totalRevenue;
                updated.base = baseRevenueToUse > 0 ? formatBRLDisplay(getBasePresumidaLP(baseRevenueToUse, t.tax, atividade, data.irpjCsllMode, data.equiparacaoHospitalar ? data.receitaEquiparacao : 0)) : "";
            } else if (baseCPP.includes(t.tax)) {
                const totalFolhaEProLabore = proLabore + folhaMensal;
                updated.base = totalFolhaEProLabore > 0 ? formatBRLDisplay(totalFolhaEProLabore) : "";
            } else if (baseFolhaEmp.includes(t.tax)) {
                updated.base = folhaMensal > 0 ? formatBRLDisplay(folhaMensal) : "";
            }
            
            const b = parseNumBR(updated.base);
            const r = parseNumBR(updated.rate);
            
            if (b > 0 && r > 0) {
                updated.apurado = formatBRLDisplay(b * r / 100);
            } else {
                updated.apurado = "";
            }

            if (['IRPJ', 'CSLL', 'Adicional IRPJ'].includes(t.tax) && isRegimeNormal) {
                if (data.irpjCsllMode === 'Trimestral (Apuração)') {
                    updated.obs = "Apuração definitiva do trimestre";
                } else if (data.irpjCsllMode === 'Estimativa (Anual)') {
                    updated.obs = "Estimativa mensal (Lucro Real Anual)";
                } else {
                    updated.obs = "Provisão mensal (Venc. Real Trimestral)";
                }
            }

            if (isRegimeNormal && atividade === 'Serviços' && revComRetencao > 0) {
                if (!t.retidoManual) {
                    if (t.tax === 'PIS') updated.retido = formatBRLDisplay(revComRetencao * 0.0065);
                    else if (t.tax === 'COFINS') updated.retido = formatBRLDisplay(revComRetencao * 0.03);
                    else if (t.tax === 'CSLL') updated.retido = formatBRLDisplay(revComRetencao * 0.01);
                    else if (t.tax === 'IRPJ') updated.retido = formatBRLDisplay(revComRetencao * 0.015);
                    else if (t.tax === 'ISS') updated.retido = formatBRLDisplay(revComRetencao * (parseNumBR(t.rate) / 100));
                }
            } else if (isRegimeNormal && atividade === 'Serviços' && revComRetencao === 0) {
                if (!t.retidoManual) {
                    updated.retido = "";
                }
            }
        }

        // ===== Estaduais do comércio (LP/Real): ICMS débito/crédito, antecipação, DIFAL, FUMACOP =====
        if (mov) {
            if (t.tax === 'ICMS') {
                if (mov.icms) {
                    updated.base = formatBRLDisplay(totalRevenue);
                    updated.rate = fmtPct(mov.icms.aliqS);
                    if (mov.icms.aPagar > 0) {
                        updated.apurado = formatBRLDisplay(mov.icms.aPagar);
                        updated.obs = `Débito ${formatBRLDisplay(mov.icms.debito)} − créditos ${formatBRLDisplay(mov.icms.credito)}`;
                    } else {
                        updated.apurado = "";
                        updated.obs = mov.icms.saldoCredor > 0 ? `Saldo credor de R$ ${formatBRLDisplay(mov.icms.saldoCredor)} p/ a próxima competência` : '';
                    }
                } else {
                    updated.base = ""; updated.apurado = ""; updated.obs = "Apuração por débito e crédito";
                }
            } else if (t.tax === 'Antecipação Parcial') {
                updated.base = formatBRLDisplay(mov.comprasInter);
                updated.rate = fmtPct(mov.difAliq);
                updated.apurado = mov.antecipacao > 0 ? formatBRLDisplay(mov.antecipacao) : "";
                updated.obs = `Compras interestaduais · ${fmtPct(mov.aliqInterna)}% − ${fmtPct(mov.aliqInter)}%`;
            } else if (t.tax === 'DIFAL') {
                updated.base = formatBRLDisplay(mov.baseDifal);
                updated.rate = fmtPct(mov.difAliq);
                updated.apurado = mov.difal > 0 ? formatBRLDisplay(mov.difal) : "";
                updated.obs = `Uso/consumo/ativo · ${fmtPct(mov.aliqInterna)}% − ${fmtPct(mov.aliqInter)}%`;
            } else if (t.tax === 'FUMACOP') {
                updated.base = formatBRLDisplay(mov.baseFumacop);
                updated.rate = "2,00";
                updated.apurado = mov.fumacop > 0 ? formatBRLDisplay(mov.fumacop) : "";
                updated.obs = "Adicional de 2% — Lei 8.205/2004 (MA)";
            }
        }

        if (data.regime === 'Simples Nacional') {
            if (t.tax === 'DAS') {
                if (totalRevenue > 0 && rbt12 > 0 && data.anexo) {
                    const fR = calcFatorR(folha12m, rbt12);
                    const anexoEf = getAnexoEfetivo(data.anexo, fR, sujeitoFatorR);
                    const res = calcAliquotaEfetivaSN(rbt12, anexoEf);

                    updated.base = formatBRLDisplay(totalRevenue);
                    updated.rate = res.rate.toFixed(4).replace('.', ',');

                    const apuradoDAS = totalRevenue * res.rate / 100;
                    updated.apurado = formatBRLDisplay(apuradoDAS);
                    let obsDAS = `${anexoEf} (Faixa ${res.faixa}) — Alíq. Nom. ${res.nominal.toFixed(2).replace('.', ',')}%`;
                    if (rbt12 > LIMITE_SN) obsDAS += ' · ATENÇÃO: RBT12 acima do limite do Simples (R$ 4,8 mi)';
                    else if (rbt12 > SUBLIMITE_SN) obsDAS += ' · RBT12 acima do sublimite: ICMS/ISS fora do DAS';
                    updated.obs = obsDAS;
                } else {
                    updated.base = ""; updated.apurado = ""; updated.obs = "";
                }
            }
        }

        if (t.tax === 'INSS' || t.tax === 'INSS (Sócio)') {
            if (proLabore > 0) {
                // Contribuição do sócio: 11% sobre o pró-labore LIMITADO ao teto previdenciário
                const baseINSS = Math.min(proLabore, TETO_INSS);
                updated.base = formatBRLDisplay(baseINSS);
                let r = parseNumBR(updated.rate);
                if (!(r > 0)) { updated.rate = "11,00"; r = 11; }
                updated.apurado = formatBRLDisplay(baseINSS * r / 100);
                if (proLabore > TETO_INSS) updated.obs = 'Retenção sobre Pró-labore · base limitada ao teto do INSS (R$ ' + formatBRLDisplay(TETO_INSS) + ')';
            } else {
                updated.base = ""; updated.apurado = "";
            }
        }

        const apurado = parseNumBR(updated.apurado);
        const retido = parseNumBR(updated.retido);
        // Tributos gerenciados pelo motor têm o valor recalculado/limpo; linhas customizadas
        // (nome livre, só "Valor" digitado) preservam o que o usuário digitou
        const MANAGED = ['PIS', 'COFINS', 'PIS/COFINS', 'ISS', 'IRPJ', 'CSLL', 'Adicional IRPJ', 'CPP', 'CPP (Patronal)', 'RAT', 'RAT (Ajustado)', 'Terceiros', 'FGTS', 'DAS', 'INSS', 'INSS (Sócio)', 'ICMS', 'Antecipação Parcial', 'FUMACOP'];
        if (apurado > 0 || retido > 0) {
            updated.value = formatBRLDisplay(Math.max(0, apurado - retido));
        } else if (MANAGED.includes(t.tax)) {
            updated.value = "";
        }

        if (data.compMonth && data.compYear && t.tax) {
            const due = getDueDate(data.compMonth, data.compYear, t.tax, data.irpjCsllMode);
            if (due) updated.dueDate = due;
            else if (['IRPJ', 'CSLL', 'Adicional IRPJ'].includes(t.tax) && data.irpjCsllMode === 'Trimestral (Apuração)') updated.dueDate = '';
        }

        return updated;
    });
};

export const STORAGE_KEY = 'sete-apuracao-draft';
