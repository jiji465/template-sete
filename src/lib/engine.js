import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const COLORS_MAP = { NAVY: "#1e3a8a", GOLD: "#C5A059", SLATE_DARK: "#334155", SLATE_MID: "#64748b" };
export const OFFICE_NAME = "SETE Soluções Empresariais";

export const parseNumBR = (v) => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    return parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0;
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
    const d = v.replace(/\D/g, '').slice(0, 14);
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

export const DEFAULT_TAXES_MEI_COMERCIO = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: "76,90", retido: "", value: "76,90", dueDate: "", obs: "INSS R$ 75,90 + ICMS R$ 1,00", retidoManual: false } ];
export const DEFAULT_TAXES_MEI_SERVICOS = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: "80,90", retido: "", value: "80,90", dueDate: "", obs: "INSS R$ 75,90 + ISS R$ 5,00", retidoManual: false } ];
export const DEFAULT_TAXES_MEI_AMBOS = [ { id: 1, tax: "DAS-MEI", base: "", rate: "", apurado: "81,90", retido: "", value: "81,90", dueDate: "", obs: "INSS R$ 75,90 + ICMS R$ 1,00 + ISS R$ 5,00", retidoManual: false } ];

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
    { acronym: "ICMS", full: "Imposto sobre Circulação de Mercadorias e Serviços", icon: "Receipt", matchTaxes: ["ICMS", "ICMS (ST)", "DIFAL"], desc: "Imposto estadual sobre a circulação de mercadorias e prestação de serviços de transporte e comunicação." },
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

export const getAnexoEfetivo = (anexo, fatorR) => {
    if (anexo === 'Anexo V' && fatorR >= 28) return 'Anexo III';
    if (anexo === 'Anexo III' && fatorR > 0 && fatorR < 28) return 'Anexo V';
    return anexo;
};

export const lastBusinessDay = (month, year) => {
    const lastDay = new Date(year, month, 0).getDate();
    let d = new Date(year, month - 1, lastDay);
    while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() - 1);
    return d.getDate();
};

export const getDueDate = (compMonth, compYear, taxName) => {
    if (!compMonth || !compYear) return '';
    const m = parseInt(compMonth), y = parseInt(compYear);
    let nextM = m + 1, nextY = y;
    if (nextM > 12) { nextM = 1; nextY++; }
    const pad = (n) => String(n).padStart(2, '0');
    const dueDateMap = {
        'PIS': 25, 'COFINS': 25, 'PIS/COFINS': 25, 'ISS': 15, 'ISS (retido)': 15,
        'CPP': 20, 'CPP (Patronal)': 20, 'RAT': 20, 'RAT (Ajustado)': 20, 'Terceiros': 20,
        'INSS': 20, 'INSS (retido)': 20, 'INSS (Sócio)': 20, 'FGTS': 20, 
        'DAS': 20, 'DAS-MEI': 20, 'ICMS (ST)': 10, 'DIFAL': 10,
    };
    if (['IRPJ', 'CSLL', 'Adicional IRPJ'].includes(taxName)) {
        // Se for trimestral, o vencimento é no final do mês subsequente ao trimestre.
        return `${pad(lastBusinessDay(nextM, nextY))}/${pad(nextM)}/${nextY}`;
    }
    const dia = dueDateMap[taxName];
    return dia ? `${pad(dia)}/${pad(nextM)}/${nextY}` : '';
};

export const getBasePresumidaLP = (revenue, taxName, atividade, irpjCsllMode, equiparacao) => {
    const presIRPJ = { 'Serviços': equiparacao ? 0.08 : 0.32, 'Comércio': 0.08, 'Indústria': 0.08 };
    const presCSLL = { 'Serviços': equiparacao ? 0.12 : 0.32, 'Comércio': 0.12, 'Indústria': 0.12 };
    if (taxName === 'Adicional IRPJ') {
        const baseCalculo = revenue * (presIRPJ[atividade] || 0.32);
        const limit = (irpjCsllMode === 'Trimestral (Apuração)') ? 60000 : 20000;
        return Math.max(0, baseCalculo - limit); 
    }
    if (taxName === 'IRPJ') return revenue * (presIRPJ[atividade] || 0.32);
    if (taxName === 'CSLL') return revenue * (presCSLL[atividade] || 0.32);
    return revenue;
};

export const formatBRLDisplay = (num) => {
    if (!num && num !== 0) return '';
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// ===== Importação de PGDAS-D (PDF) =====
export const pgNum = (s) => s ? (parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0) : 0;

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
    const rbt12 = g(/\(RBT12\)\s*([\d.]+,\d{2})/);
    const folha = g(/Total\s+de\s+Folhas\s+de\s+Sal[áa]rios\s+Anteriores[\s\S]*?R\$\s*([\d.]+,\d{2})/i);
    const fator = g(/Fator\s+r\s*=\s*([\d,]+)\s*-\s*(Anexo\s+[IVX]+)/i);
    const das = g(/Valor\s+Total\s+do\s+D[ée]bito\s+Declarado[^\d]*([\d.]+,\d{2})\D*([\d.]+,\d{2})/i);
    const mun = g(/Munic[íi]pio:\s*([A-Za-zÀ-ú][A-Za-zÀ-ú .]*?)\s*UF:\s*([A-Z]{2})/i);

    if (cnpj) res.cnpj = cnpj[1];
    if (nome) res.nome = nome[1].replace(/\s+/g, ' ').trim();
    if (comp) { res.compMonth = String(parseInt(comp[1])); res.compYear = comp[2]; res.competenceShort = comp[1] + '/' + comp[2]; }
    if (rpa) res.rpa = rpa[1];
    if (rbt12) res.rbt12 = rbt12[1];
    if (folha) res.folha12m = folha[1];
    if (fator) { res.fatorR = fator[1]; res.anexo = fator[2].replace(/\s+/, ' '); }
    if (das) res.das = das[2];
    if (mun) res.municipio = mun[1].trim() + '/' + mun[2];
    res.atividade = /Presta[çc][ãa]o\s+de\s+Servi[çc]os/i.test(T) ? 'Serviços' : (/Com[ée]rcio/i.test(T) ? 'Comércio' : 'Serviços');

    // Evolução do faturamento — seção 2.2.1 (Mercado Interno)
    const block = T.match(/2\.2\.1\)[^]*?2\.2\.2\)/);
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

    return currentTaxes.map(t => {
        const updated = { ...t };
        const isRegimeNormal = data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real';
        const isAnexoIV = data.regime === 'Simples Nacional' && data.anexo === 'Anexo IV';

        if (isRegimeNormal || isAnexoIV) {
            const baseFat = ['PIS', 'COFINS', 'PIS/COFINS', 'ISS'];
            const basePres = ['IRPJ', 'CSLL', 'Adicional IRPJ'];
            const baseFolha = ['CPP', 'CPP (Patronal)', 'RAT', 'RAT (Ajustado)', 'Terceiros', 'FGTS'];

            if (baseFat.includes(t.tax)) {
                updated.base = totalRevenue > 0 ? formatBRLDisplay(totalRevenue) : "";
            } else if (basePres.includes(t.tax) && isRegimeNormal) {
                const baseRevenueToUse = (data.irpjCsllMode === 'Trimestral (Apuração)' || data.irpjCsllMode === 'Estimativa (Anual)') && parseNumBR(data.periodRevenue) > 0 
                    ? parseNumBR(data.periodRevenue) 
                    : totalRevenue;
                updated.base = baseRevenueToUse > 0 ? formatBRLDisplay(getBasePresumidaLP(baseRevenueToUse, t.tax, atividade, data.irpjCsllMode, data.equiparacaoHospitalar)) : "";
            } else if (baseFolha.includes(t.tax)) {
                const totalFolhaEProLabore = proLabore + folhaMensal;
                updated.base = totalFolhaEProLabore > 0 ? formatBRLDisplay(totalFolhaEProLabore) : "";
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

        if (data.regime === 'Simples Nacional') {
            if (t.tax === 'DAS') {
                if (totalRevenue > 0 && rbt12 > 0 && data.anexo) {
                    const fR = calcFatorR(folha12m, rbt12); 
                    const anexoEf = getAnexoEfetivo(data.anexo, fR);
                    const res = calcAliquotaEfetivaSN(rbt12, anexoEf);
                    
                    updated.base = formatBRLDisplay(totalRevenue);
                    updated.rate = res.rate.toFixed(2).replace('.', ',');
                    
                    const apuradoDAS = totalRevenue * res.rate / 100;
                    updated.apurado = formatBRLDisplay(apuradoDAS);
                    updated.obs = `${anexoEf} (Faixa ${res.faixa}) — Alíq. Nom. ${res.nominal.toFixed(2).replace('.', ',')}%`;
                } else {
                    updated.base = ""; updated.apurado = ""; updated.obs = "";
                }
            }
        }

        if (t.tax === 'INSS' || t.tax === 'INSS (Sócio)') {
            if (proLabore > 0) {
                updated.base = formatBRLDisplay(proLabore);
                const r = parseNumBR(updated.rate); 
                if (r > 0) {
                    updated.apurado = formatBRLDisplay(proLabore * r / 100);
                } else if (!updated.rate || updated.rate.trim() === '') {
                    updated.rate = "11,00";
                    updated.apurado = formatBRLDisplay(proLabore * 0.11);
                }
            } else {
                updated.base = ""; updated.apurado = "";
            }
        }

        const apurado = parseNumBR(updated.apurado);
        const retido = parseNumBR(updated.retido);
        if (apurado > 0 || retido > 0) {
            updated.value = formatBRLDisplay(Math.max(0, apurado - retido));
        } else {
            updated.value = "";
        }

        if (data.compMonth && data.compYear && t.tax) {
            const due = getDueDate(data.compMonth, data.compYear, t.tax);
            if (due) updated.dueDate = due;
        }

        return updated;
    });
};

export const STORAGE_KEY = 'sete-apuracao-draft';
