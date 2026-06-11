import React, { useState, useCallback } from 'react';
import {
    Printer, Plus, Trash2, FileCheck, Eye, Edit3,
    DollarSign, Calculator, TrendingUp, BookOpen, Info,
    Landmark, Building2, Receipt, BadgePercent, Scale, Save,
    Calendar, FileText, Phone, Mail, AlertTriangle, ArrowRight, CheckCircle2, XCircle,
    MessageSquare
} from 'lucide-react';
import iconeUrl from './assets/icone.png';
import {
    DEFAULT_TAXES, DEFAULT_TAXES_LP, DEFAULT_TAXES_MEI_AMBOS, DEFAULT_TAXES_MEI_COMERCIO, DEFAULT_TAXES_MEI_SERVICOS, DEFAULT_TAXES_SN_COMERCIO, DEFAULT_TAXES_SN_SERVICOS, GLOSSARY, MONTHS, OFFICE_NAME, STORAGE_KEY, autoFillTaxes, calcAliquotaEfetivaSN, calcComercioLP, calcFatorR, calculateTotalRevenue, extractPdfText, formatBRLDisplay, formatCNPJ, formatCurrency, formatPercent, getAnexoEfetivo, getDueDate, isSujeitoFatorR, lpDefaults, parseNumBR, parsePGDASD, pgNum
} from './lib/engine.js';

const BRAND_ICON = iconeUrl;

const FatorRDashboard = ({ clientData, isPrint = false }) => {
    const rbt12 = parseNumBR(clientData.rbt12);
    const revenue = parseNumBR(clientData.revenue) + parseNumBR(clientData.revenueRetained) + parseNumBR(clientData.revenueNonRetained);
    const folha12m = parseNumBR(clientData.folha12m !== undefined ? clientData.folha12m : clientData.folha);
    
    const fR = calcFatorR(folha12m, rbt12);
    const anexoEf = getAnexoEfetivo(clientData.anexo, fR, isSujeitoFatorR(clientData, folha12m));

    const rateIII = calcAliquotaEfetivaSN(rbt12, 'Anexo III').rate;
    const rateV = calcAliquotaEfetivaSN(rbt12, 'Anexo V').rate;
    
    const taxIII = revenue * (rateIII / 100);
    const taxV = revenue * (rateV / 100);
    const isFavorable = fR >= 28;
    const diff = Math.abs(taxV - taxIII);

    if (!isPrint) {
        return (
            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-5 mt-2 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                        <Scale className="w-4 h-4" /> Análise Inteligente: Fator R
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isFavorable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {isFavorable ? 'Fator R Atingido (Anexo III)' : 'Fator R Não Atingido (Anexo V)'}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Folha + Pró-labore (12m)</p>
                        <p className="text-sm font-bold text-slate-700">{formatCurrency(folha12m)}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Percentual Fator R</p>
                        <p className={`text-lg font-extrabold ${isFavorable ? 'text-emerald-600' : 'text-red-600'}`}>
                            {fR.toFixed(2).replace('.', ',')}%
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Alíquota Efetiva ({anexoEf})</p>
                        <p className="text-sm font-bold text-navy">
                            {(isFavorable ? rateIII : rateV).toFixed(2).replace('.', ',')}%
                        </p>
                    </div>
                </div>

                <div className="bg-slate-100/50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 mb-4 leading-relaxed">
                    <strong className="text-navy">Como funciona o Fator R?</strong> Para que sua atividade seja tributada no <strong>Anexo III</strong> (alíquotas menores), a soma da Folha de Pagamento + Pró-labore dos últimos 12 meses deve representar pelo menos <strong>28%</strong> do seu Faturamento (RBT12). Caso seja menor que 28%, a empresa é tributada no <strong>Anexo V</strong> (alíquotas maiores).
                </div>

                {revenue > 0 && (
                    <div className={`p-4 rounded-lg border ${isFavorable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} flex items-start gap-3`}>
                        {isFavorable ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <div>
                            <p className={`text-xs font-bold mb-1 ${isFavorable ? 'text-emerald-800' : 'text-red-800'}`}>
                                {isFavorable ? 'Economia Tributária Gerada' : 'Custo Adicional por desenquadramento'}
                            </p>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[11px] text-slate-600 line-through">Anexo V: {formatCurrency(taxV)}</p>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <p className={`text-sm font-bold ${isFavorable ? 'text-emerald-700' : 'text-red-700'}`}>Anexo III: {formatCurrency(taxIII)}</p>
                            </div>
                            <p className={`text-lg font-black ${isFavorable ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isFavorable ? '-' : '+'} {formatCurrency(diff)} <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">Neste mês</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="mb-5 avoid-break print-fator-r-box rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#1e3a8a]" />
                    <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wide print-navy">Análise Fator R</h3>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isFavorable ? 'print-bg-emerald text-emerald-800' : 'print-bg-red text-red-800'}`}>
                    {isFavorable ? 'Atingido (Anexo III)' : 'Não Atingido (Anexo V)'}
                </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Folha + PL (12m)</p><p className="text-xs font-bold text-slate-800">{formatCurrency(folha12m)}</p></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">RBT12</p><p className="text-xs font-bold text-slate-800">{formatCurrency(rbt12)}</p></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Percentual Atingido</p><p className={`text-sm font-extrabold ${isFavorable ? 'text-emerald-700' : 'text-red-700'}`}>{fR.toFixed(2).replace('.', ',')}%</p></div>
                <div><p className="text-[9px] text-slate-500 font-bold uppercase">Anexo Aplicado</p><p className="text-xs font-bold text-[#1e3a8a] print-navy">{anexoEf}</p></div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[9px] text-slate-500 leading-relaxed text-justify">
                    <strong className="text-slate-700">Entenda o Fator R:</strong> Para ser tributada no Anexo III (alíquotas menores), a proporção da Folha de Pagamento + Pró-labore em relação ao Faturamento (RBT12) dos últimos 12 meses deve ser igual ou superior a 28%. Se for inferior, aplica-se o Anexo V (alíquotas maiores).
                </p>
            </div>

            {revenue > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-[10px]">
                            <span className="text-slate-500">Simulação Anexo V:</span> <span className="font-semibold text-slate-700">{formatCurrency(taxV)}</span>
                        </div>
                        <div className="text-[10px]">
                            <span className="text-slate-500">Simulação Anexo III:</span> <span className="font-semibold text-slate-700">{formatCurrency(taxIII)}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold uppercase text-slate-500">{isFavorable ? 'Economia Gerada no Mês' : 'Custo Extra no Mês'}</p>
                        <p className={`text-sm font-black ${isFavorable ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(diff)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

const EditorPanel = ({ clientData, setClientData, taxes, setTaxes, validationErrors = {}, setValidationErrors = () => { } }) => {

    const [forceShowRetentions, setForceShowRetentions] = useState(false);
    const [importMsg, setImportMsg] = useState(null);
    const pdfInputRef = React.useRef(null);

    const updateClient = (field, val) => setClientData(prev => ({ ...prev, [field]: val }));

    const handleImportPGDASD = async (file) => {
        if (!file) return;
        setImportMsg({ type: 'load', text: 'Lendo PDF…' });
        try {
            const text = await Promise.race([
                extractPdfText(file),
                new Promise((_, rej) => setTimeout(() => rej(new Error('tempo esgotado ao ler o arquivo (30s)')), 30000))
            ]);
            const d = parsePGDASD(text);
            if (!d.ok) { setImportMsg({ type: 'err', text: d.error || 'Não consegui ler como PGDAS-D.' }); return; }

            const rpaNum = pgNum(d.rpa), dasNum = pgNum(d.das);
            const rate = rpaNum > 0 && dasNum > 0 ? (dasNum / rpaNum * 100) : 0;
            const newData = {
                ...clientData,
                clientName: d.nome || clientData.clientName,
                cnpj: d.cnpj || clientData.cnpj,
                regime: 'Simples Nacional',
                atividade: d.atividade || clientData.atividade || 'Serviços',
                anexo: d.anexo || clientData.anexo,
                compMonth: d.compMonth || clientData.compMonth,
                compYear: d.compYear || clientData.compYear,
                competenceShort: d.competenceShort || clientData.competenceShort,
                competence: d.compMonth ? (MONTHS[parseInt(d.compMonth) - 1] + '/' + d.compYear) : clientData.competence,
                revenue: d.rpa || clientData.revenue,
                rbt12: d.rbt12 || clientData.rbt12,
                folha12m: d.folha12m || clientData.folha12m,
                municipio: d.municipio || clientData.municipio,
                evolucao: d.evolucao || clientData.evolucao || null,
            };
            delete newData.revenueRetained; delete newData.revenueNonRetained;
            const dueDate = getDueDate(d.compMonth, d.compYear, 'DAS');
            const dasTax = { id: Date.now(), tax: 'DAS', base: d.rpa || '', rate: rate ? rate.toFixed(2).replace('.', ',') : '', apurado: d.das || '', retido: '', value: d.das || '', dueDate, obs: `${d.anexo || 'Simples Nacional'} · Fator R ${d.fatorR || '—'}`, retidoManual: false };

            setClientData(newData);
            setTaxes(autoFillTaxes(newData, [dasTax]));
            setValidationErrors({});
            if (d.multiEstab) {
                setImportMsg({ type: 'err', text: `Importado: ${d.competenceShort || ''} · DAS ${formatCurrency(dasNum)} — PDF com mais de um estabelecimento, confira os valores` });
            } else {
                setImportMsg({ type: 'ok', text: `Importado: ${d.competenceShort || ''} · DAS ${formatCurrency(dasNum)}` });
                setTimeout(() => setImportMsg(m => (m && m.type === 'ok') ? null : m), 8000);
            }
        } catch (e) {
            console.error(e);
            setImportMsg({ type: 'err', text: 'Erro ao ler o PDF: ' + e.message });
        }
    };

    const recalcular = (overrideData) => {
        const data = overrideData || clientData;
        setTaxes(prev => {
            let baseTaxes = [...prev];
            if (baseTaxes.length === 0) {
                if (data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real') {
                    baseTaxes = [...lpDefaults(data.atividade)];
                } else if (data.regime === 'Simples Nacional') {
                    baseTaxes = data.atividade === 'Comércio' ? [...DEFAULT_TAXES_SN_COMERCIO] : [...DEFAULT_TAXES_SN_SERVICOS];
                } else if (data.regime === 'MEI') {
                    const map = { 'Comércio': DEFAULT_TAXES_MEI_COMERCIO, 'Serviços': DEFAULT_TAXES_MEI_SERVICOS, 'Ambos': DEFAULT_TAXES_MEI_AMBOS };
                    baseTaxes = map[data.atividade || 'Serviços'] || [...DEFAULT_TAXES_MEI_SERVICOS];
                }
                baseTaxes = baseTaxes.map((t, i) => ({...t, id: Date.now() + i}));
            }

            // INSS do sócio entra/sai automaticamente conforme o pró-labore (exceto MEI, cujo INSS já está no DAS-MEI)
            const pl = parseNumBR(data.proLabore);
            const idxINSS = baseTaxes.findIndex(t => t.tax === 'INSS (Sócio)');
            if (data.regime !== 'MEI' && pl > 0 && idxINSS === -1) {
                baseTaxes = [...baseTaxes, { id: Date.now() + Math.floor(Math.random() * 1000), tax: 'INSS (Sócio)', base: '', rate: '11,00', apurado: '', retido: '', value: '', dueDate: '', obs: 'Retenção de 11% sobre o pró-labore', retidoManual: false }];
            } else if ((pl <= 0 || data.regime === 'MEI') && idxINSS !== -1) {
                baseTaxes = baseTaxes.filter(t => t.tax !== 'INSS (Sócio)');
            }

            // Guias estaduais do comércio (LP/Real) entram/saem conforme os campos de movimentação
            const isLPComercio = (data.regime === 'Lucro Presumido' || data.regime === 'Lucro Real') && (data.atividade === 'Comércio' || data.atividade === 'Indústria');
            const movC = isLPComercio ? calcComercioLP(data, calculateTotalRevenue(data)) : null;
            [['Antecipação Parcial', movC && movC.antecipacao > 0], ['DIFAL', movC && movC.difal > 0], ['FUMACOP', movC && movC.fumacop > 0]].forEach(([nome, deve], k) => {
                const idx = baseTaxes.findIndex(t => t.tax === nome);
                if (deve && idx === -1) {
                    baseTaxes = [...baseTaxes, { id: Date.now() + 100 + k, tax: nome, base: '', rate: '', apurado: '', retido: '', value: '', dueDate: '', obs: '', retidoManual: false }];
                } else if (!deve && idx !== -1 && isLPComercio) {
                    baseTaxes = baseTaxes.filter(t => t.tax !== nome);
                }
            });

            return autoFillTaxes(data, baseTaxes);
        });
    };

    React.useEffect(() => {
        recalcular();
    }, [
        clientData.revenue, 
        clientData.revenueRetained, 
        clientData.revenueNonRetained, 
        clientData.proLabore, 
        clientData.folhaMensal, 
        clientData.folha12m, 
        clientData.rbt12, 
        clientData.anexo,
        clientData.atividade,
        clientData.regime,
        clientData.equiparacaoHospitalar,
        clientData.receitaEquiparacao,
        clientData.irpjCsllMode,
        clientData.compMonth,
        clientData.compYear,
        clientData.periodRevenue,
        clientData.sujeitoFatorR,
        clientData.entradasCompras,
        clientData.aliqIcmsSaida,
        clientData.aliqIcmsEntrada,
        clientData.saldoCredorICMS,
        clientData.comprasInterestaduais,
        clientData.aliqInterestadual,
        clientData.baseDifal,
        clientData.baseFumacop
    ]);

    const updateTax = (id, field, val) => {
        setTaxes(prev => prev.map(t => {
            if (t.id !== id) return t;
            const updated = { ...t, [field]: val };
            
            if (field === 'base' || field === 'rate') {
                const b = parseNumBR(updated.base);
                const r = parseNumBR(updated.rate);
                if (b > 0 && r > 0) {
                    const ap = b * r / 100;
                    updated.apurado = formatBRLDisplay(ap);
                    updated.value = formatBRLDisplay(Math.max(0, ap - parseNumBR(updated.retido)));
                } else {
                    updated.apurado = ""; updated.value = "";
                }
            } else if (field === 'apurado' || field === 'retido') {
                if (field === 'retido') {
                    updated.retidoManual = (val.trim() !== '');
                }
                const a = parseNumBR(updated.apurado);
                const ret = parseNumBR(updated.retido);
                updated.value = formatBRLDisplay(Math.max(0, a - ret));
            }
            return updated;
        }));
    };

    const addTax = () => {
        setTaxes(prev => [...prev, { id: Date.now(), tax: "", base: "", rate: "", apurado: "", retido: "", value: "", dueDate: "", obs: "", retidoManual: false }]);
    };

    const removeTax = (id) => { setTaxes(prev => prev.filter(t => t.id !== id)); };

    const formatInputBRL = (raw) => {
        if (!raw && raw !== 0) return '';
        let digits = String(raw).replace(/\D/g, '');
        if (!digits) return '';
        let num = parseInt(digits, 10);
        return (num / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };
    const parseBRL = formatInputBRL;

    const showFatorR = clientData.regime === 'Simples Nacional' && (clientData.anexo === 'Anexo V' || clientData.anexo === 'Anexo III') && parseNumBR(clientData.rbt12) > 0;
    const totalRevenue = calculateTotalRevenue(clientData);

    // Controle inteligente da tabela
    const hasRetentionsData = parseNumBR(clientData.revenueRetained) > 0 || taxes.some(t => parseNumBR(t.retido) > 0 || t.retidoManual);
    const showRetentionsTable = forceShowRetentions || hasRetentionsData;

    return (
        <div className="max-w-[900px] mx-auto">
            {clientData.regime === 'Simples Nacional' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2 animate-fade-in-up">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        <strong>Retenções no Simples Nacional:</strong> Para impostos retidos na fonte (como ISS ou INSS), basta clicar em "Habilitar Retenções" abaixo e inserir o valor direto na coluna "Retido" da tabela, o sistema abaterá automaticamente do "A Pagar".
                    </p>
                </div>
            )}
            {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (clientData.atividade || 'Serviços') === 'Serviços' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2 animate-fade-in-up">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-xs text-blue-800 font-medium leading-relaxed">
                        <p><strong>Automação de Retenções (IRPJ/CSLL/PIS/COFINS/ISS):</strong> Preencha o "Faturamento COM Retenção". O sistema aplica as retenções padrões e gera as colunas automaticamente.</p>
                        <p className="mt-1"><strong>Dica de Controle:</strong> Se suas notas tiverem alíquotas de retenção diferentes, digite o valor exato na coluna <strong>"Retido"</strong> da tabela. O sistema travará seu valor manual e não o sobrescreverá ao recalcular.</p>
                    </div>
                </div>
            )}
            {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (clientData.atividade === 'Comércio' || clientData.atividade === 'Indústria') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2 animate-fade-in-up">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-xs text-blue-800 font-medium leading-relaxed">
                        <strong>Comércio no {clientData.regime}:</strong> informe Entradas e Saídas abaixo — o sistema apura o ICMS por débito × crédito (com saldo credor), a Antecipação Parcial das compras interestaduais, o DIFAL e o FUMACOP (2%, Lei 8.205/04-MA). IRPJ e CSLL usam presunção de 8% / 12% automaticamente.
                    </p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6 mb-6 animate-fade-in-up card-hover">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Dados do Cliente
                    </h2>
                    <div className="flex items-center gap-2">
                        {importMsg && (
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${importMsg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : importMsg.type === 'err' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-600'}`}>
                                {importMsg.type === 'ok' ? '✓ ' : importMsg.type === 'err' ? '✕ ' : ''}{importMsg.text}
                            </span>
                        )}
                        <input ref={pdfInputRef} type="file" accept="application/pdf,.pdf" className="hidden"
                            onChange={e => { handleImportPGDASD(e.target.files[0]); e.target.value = ''; }} />
                        <button onClick={() => pdfInputRef.current && pdfInputRef.current.click()}
                            className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <FileText className="w-4 h-4" /> Importar PGDAS-D (PDF)
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="field-label">Nome / Razão Social <span className="text-red-400">*</span></label>
                        <input className={`field-input ${validationErrors.clientName ? 'field-error' : ''}`} value={clientData.clientName}
                            onChange={e => { updateClient('clientName', e.target.value); setValidationErrors(prev => ({ ...prev, clientName: undefined })); }}
                            placeholder="Ex: Empresa Exemplo LTDA" />
                        {validationErrors.clientName && <p className="field-error-msg">{validationErrors.clientName}</p>}
                    </div>
                    <div>
                        <label className="field-label">CNPJ</label>
                        <input className="field-input" value={clientData.cnpj} onChange={e => updateClient('cnpj', formatCNPJ(e.target.value))} placeholder="00.000.000/0001-00" />
                    </div>
                    <div>
                        <label className="field-label">Competência <span className="text-red-400">*</span></label>
                        <div className="flex gap-2">
                            <select className={`field-input flex-1 ${validationErrors.competence ? 'field-error' : ''}`} value={clientData.compMonth || (clientData.competenceShort ? String(parseInt(clientData.competenceShort.split('/')[0], 10)) : '')}
                                onChange={e => {
                                    const m = e.target.value; updateClient('compMonth', m);
                                    const y = clientData.compYear || new Date().getFullYear().toString();
                                    if (m) {
                                        updateClient('competence', MONTHS[parseInt(m) - 1] + '/' + y);
                                        updateClient('competenceShort', m.padStart(2, '0') + '/' + y);
                                        setValidationErrors(prev => ({ ...prev, competence: undefined }));
                                    }
                                }}>
                                <option value="">Mês</option>
                                {MONTHS.map((name, i) => <option key={i} value={String(i + 1)}>{name}</option>)}
                            </select>
                            <select className="field-input w-28" value={clientData.compYear || (clientData.competenceShort ? clientData.competenceShort.split('/')[1] : '')}
                                onChange={e => {
                                    const y = e.target.value; updateClient('compYear', y);
                                    const m = clientData.compMonth;
                                    if (m && y) {
                                        updateClient('competence', MONTHS[parseInt(m) - 1] + '/' + y);
                                        updateClient('competenceShort', m.padStart(2, '0') + '/' + y);
                                    }
                                }}>
                                <option value="">Ano</option>
                                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={String(y)}>{y}</option>)}
                            </select>
                        </div>
                        {validationErrors.competence && <p className="field-error-msg">{validationErrors.competence}</p>}
                    </div>
                    <div>
                        <label className="field-label">Regime Tributário</label>
                        <select className="field-input" value={clientData.regime}
                            onChange={e => {
                                const nr = e.target.value;
                                const atv = clientData.atividade || 'Serviços';
                                
                                let updatedData = { ...clientData, regime: nr, atividade: atv };
                                let newTaxes = [];

                                if (nr === 'Lucro Presumido' || nr === 'Lucro Real') {
                                    newTaxes = [...lpDefaults(atv)];
                                    updatedData.anexo = '';
                                    updatedData.revenue = '';
                                    if ((atv === 'Comércio' || atv === 'Indústria')) {
                                        if (!updatedData.aliqIcmsSaida) updatedData.aliqIcmsSaida = '23,00';
                                        if (!updatedData.aliqInterestadual) updatedData.aliqInterestadual = '7,00';
                                    }
                                } else if (nr === 'Simples Nacional') {
                                    newTaxes = atv === 'Comércio' ? [...DEFAULT_TAXES_SN_COMERCIO] : [...DEFAULT_TAXES_SN_SERVICOS];
                                    updatedData.revenueRetained = '';
                                    updatedData.revenueNonRetained = '';
                                } else if (nr === 'MEI') {
                                    const map = { 'Comércio': DEFAULT_TAXES_MEI_COMERCIO, 'Serviços': DEFAULT_TAXES_MEI_SERVICOS, 'Ambos': DEFAULT_TAXES_MEI_AMBOS };
                                    newTaxes = map[atv] || [...DEFAULT_TAXES_MEI_SERVICOS];
                                    updatedData.anexo = '';
                                    updatedData.revenueRetained = '';
                                    updatedData.revenueNonRetained = '';
                                }

                                setClientData(updatedData);
                                setTaxes(autoFillTaxes(updatedData, newTaxes.map((t, i) => ({...t, id: Date.now() + i}))));
                            }}>
                            <option value="Lucro Presumido">Lucro Presumido</option>
                            <option value="Lucro Real">Lucro Real</option>
                            <option value="Simples Nacional">Simples Nacional</option>
                            <option value="MEI">MEI</option>
                        </select>
                    </div>
                    
                    {(clientData.regime === 'Simples Nacional' || clientData.regime === 'MEI' || clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (
                        <div>
                            <label className="field-label">Atividade</label>
                            <select className="field-input" value={clientData.atividade || 'Serviços'}
                                onChange={e => {
                                    const atv = e.target.value;
                                    if (clientData.regime === 'Simples Nacional') {
                                        updateClient('atividade', atv);
                                        const newTaxes = atv === 'Comércio' ? DEFAULT_TAXES_SN_COMERCIO : DEFAULT_TAXES_SN_SERVICOS;
                                        setTaxes(autoFillTaxes({ ...clientData, atividade: atv }, newTaxes));
                                    } else if (clientData.regime === 'MEI') {
                                        updateClient('atividade', atv);
                                        const map = { 'Comércio': DEFAULT_TAXES_MEI_COMERCIO, 'Serviços': DEFAULT_TAXES_MEI_SERVICOS, 'Ambos': DEFAULT_TAXES_MEI_AMBOS };
                                        setTaxes(map[atv] || DEFAULT_TAXES_MEI_SERVICOS);
                                    } else {
                                        // LP/Real: troca o conjunto padrão (ICMS no comércio, ISS nos serviços) e pré-preenche alíquotas
                                        const upd = { ...clientData, atividade: atv };
                                        if ((atv === 'Comércio' || atv === 'Indústria')) {
                                            if (!upd.aliqIcmsSaida) upd.aliqIcmsSaida = '23,00';
                                            if (!upd.aliqInterestadual) upd.aliqInterestadual = '7,00';
                                        }
                                        setClientData(upd);
                                        setTaxes(autoFillTaxes(upd, lpDefaults(atv).map((t, i) => ({ ...t, id: Date.now() + i }))));
                                    }
                                }}>
                                <option value="Serviços">Prestação de Serviços</option>
                                <option value="Comércio">Comércio</option>
                                <option value="Indústria">Indústria</option>
                                {clientData.regime === 'MEI' && <option value="Ambos">Comércio e Serviços</option>}
                            </select>
                        </div>
                    )}
                    
                    {clientData.regime === 'Simples Nacional' && (
                        <>
                            <div>
                                <label className="field-label">Anexo do Simples</label>
                                <select className="field-input" value={clientData.anexo || ''} onChange={e => updateClient('anexo', e.target.value)}>
                                    <option value="">Selecione o Anexo</option>
                                    <option value="Anexo I">Anexo I — Comércio</option>
                                    <option value="Anexo II">Anexo II — Indústria</option>
                                    <option value="Anexo III">Anexo III — Serviços (geral)</option>
                                    <option value="Anexo IV">Anexo IV — Serviços (c/ CPP à parte)</option>
                                    <option value="Anexo V">Anexo V — Serviços (fator R)</option>
                                </select>
                            </div>
                            <div>
                                <label className="field-label">Receita Bruta 12 meses — RBT12 (R$)</label>
                                <input className="field-input" type="text" value={clientData.rbt12 || ''}
                                    onChange={e => updateClient('rbt12', parseBRL(e.target.value))} placeholder="0,00" />
                            </div>
                            
                            {(clientData.anexo === 'Anexo V' || clientData.anexo === 'Anexo III') && (
                                <div>
                                    <label className="field-label">Folha + Pró-labore (12 meses) — p/ Fator R</label>
                                    <input className="field-input" type="text" value={clientData.folha12m !== undefined ? clientData.folha12m : (clientData.folha || '')}
                                        onChange={e => { updateClient('folha12m', parseBRL(e.target.value)); updateClient('folha', undefined); }} placeholder="0,00" />
                                </div>
                            )}

                            {(clientData.anexo === 'Anexo V' || clientData.anexo === 'Anexo III') && (
                                <label className="col-span-2 flex items-start gap-2 cursor-pointer select-none bg-white p-3 rounded-lg border border-blue-200">
                                    <input type="checkbox" className="w-4 h-4 mt-0.5 accent-blue-700"
                                        checked={isSujeitoFatorR(clientData, parseNumBR(clientData.folha12m !== undefined ? clientData.folha12m : clientData.folha))}
                                        onChange={e => updateClient('sujeitoFatorR', e.target.checked)} />
                                    <span className="text-xs font-bold text-navy leading-relaxed">Atividade sujeita ao Fator R
                                        <span className="font-medium text-slate-500"> — aplica a migração Anexo III ↔ V conforme a folha atinja ou não 28% do RBT12 (LC 123, §5º-I/J: fisioterapia, medicina, engenharia etc.). Desmarque para atividades que são Anexo III por natureza (ex.: contabilidade, escolas), que não migram para o Anexo V.</span>
                                    </span>
                                </label>
                            )}

                            {clientData.anexo === 'Anexo IV' && (
                                <div>
                                    <label className="field-label">Folha de Salários Mensal (R$)</label>
                                    <input className="field-input" type="text" value={clientData.folhaMensal !== undefined ? clientData.folhaMensal : (clientData.folha || '')}
                                        onChange={e => { updateClient('folhaMensal', parseBRL(e.target.value)); updateClient('folha', undefined); }} placeholder="0,00" />
                                </div>
                            )}
                            
                            <div>
                                <label className="field-label">Faturamento Bruto (R$) <span className="text-red-400">*</span></label>
                                <input className={`field-input ${validationErrors.revenue ? 'field-error' : ''}`} type="text" value={clientData.revenue || ''}
                                    onChange={e => { updateClient('revenue', parseBRL(e.target.value)); setValidationErrors(prev => ({ ...prev, revenue: undefined })); }}
                                    placeholder="0,00" />
                                {validationErrors.revenue && <p className="field-error-msg">{validationErrors.revenue}</p>}
                            </div>
                        </>
                    )}
                    
                    {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (
                        <div>
                            <label className="field-label">Folha de Salários Mensal (R$)</label>
                            <input className="field-input" type="text" value={clientData.folhaMensal !== undefined ? clientData.folhaMensal : (clientData.folha || '')}
                                onChange={e => { updateClient('folhaMensal', parseBRL(e.target.value)); updateClient('folha', undefined); }} placeholder="0,00" />
                        </div>
                    )}
                    
                    <div>
                        <label className="field-label">Pro-labore do Mês (R$)</label>
                        <input className="field-input" type="text" value={clientData.proLabore || ''}
                            onChange={e => updateClient('proLabore', parseBRL(e.target.value))} placeholder="0,00" />
                    </div>
                    
                    {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (clientData.atividade || 'Serviços') === 'Serviços' && (
                        <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                            <p className="text-xs font-bold text-navy mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Receitas do Período</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Faturamento COM Retenção de Impostos (R$)</label>
                                    <input className="field-input border-emerald-200 focus:border-emerald-500" type="text" value={clientData.revenueRetained || ''}
                                        onChange={e => { updateClient('revenueRetained', parseBRL(e.target.value)); setValidationErrors(prev => ({ ...prev, revenue: undefined })); }}
                                        placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Faturamento SEM Retenção de Impostos (R$)</label>
                                    <input className="field-input" type="text" value={clientData.revenueNonRetained || ''}
                                        onChange={e => { updateClient('revenueNonRetained', parseBRL(e.target.value)); setValidationErrors(prev => ({ ...prev, revenue: undefined })); }}
                                        placeholder="0,00" />
                                </div>
                            </div>
                            <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase">Faturamento Bruto Total do Mês:</span>
                                <span className="text-lg font-extrabold text-navy">{formatCurrency(totalRevenue)}</span>
                            </div>
                            {validationErrors.revenue && <p className="field-error-msg mt-1 text-center">{validationErrors.revenue}</p>}
                        </div>
                    )}

                    {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (clientData.atividade === 'Comércio' || clientData.atividade === 'Indústria') && (
                        <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                            <p className="text-xs font-bold text-navy mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Movimentação do Período — Entradas × Saídas</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="field-label">Total de Saídas — Vendas (R$) <span className="text-red-400">*</span></label>
                                    <input className={`field-input border-amber-200 focus:border-amber-500 ${validationErrors.revenue ? 'field-error' : ''}`} type="text" value={clientData.revenueNonRetained || ''}
                                        onChange={e => { updateClient('revenueNonRetained', parseBRL(e.target.value)); setValidationErrors(prev => ({ ...prev, revenue: undefined })); }}
                                        placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Total de Entradas — Compras (R$)</label>
                                    <input className="field-input" type="text" value={clientData.entradasCompras || ''}
                                        onChange={e => updateClient('entradasCompras', parseBRL(e.target.value))} placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Alíq. interna ICMS (%) — MA: 23%</label>
                                    <input className="field-input" type="text" value={clientData.aliqIcmsSaida || ''}
                                        onChange={e => updateClient('aliqIcmsSaida', e.target.value.replace(/\./g, ',').replace(/[^\d,]/g, ''))} placeholder="23,00" />
                                </div>
                                <div>
                                    <label className="field-label">Alíq. média do crédito de entradas (%)</label>
                                    <input className="field-input" type="text" value={clientData.aliqIcmsEntrada || ''}
                                        onChange={e => updateClient('aliqIcmsEntrada', e.target.value.replace(/\./g, ',').replace(/[^\d,]/g, ''))} placeholder="= alíq. interna" />
                                </div>
                                <div>
                                    <label className="field-label">Saldo credor ICMS do mês anterior (R$)</label>
                                    <input className="field-input" type="text" value={clientData.saldoCredorICMS || ''}
                                        onChange={e => updateClient('saldoCredorICMS', parseBRL(e.target.value))} placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Vendas c/ FUMACOP — Lei 8.205/04 (R$)</label>
                                    <input className="field-input" type="text" value={clientData.baseFumacop || ''}
                                        onChange={e => updateClient('baseFumacop', parseBRL(e.target.value))} placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Compras interestaduais — p/ Antecipação Parcial (R$)</label>
                                    <input className="field-input" type="text" value={clientData.comprasInterestaduais || ''}
                                        onChange={e => updateClient('comprasInterestaduais', parseBRL(e.target.value))} placeholder="0,00" />
                                </div>
                                <div>
                                    <label className="field-label">Alíq. interestadual (%) — 4, 7 ou 12</label>
                                    <input className="field-input" type="text" value={clientData.aliqInterestadual || ''}
                                        onChange={e => updateClient('aliqInterestadual', e.target.value.replace(/\./g, ',').replace(/[^\d,]/g, ''))} placeholder="7,00" />
                                </div>
                                <div className="col-span-2">
                                    <label className="field-label">Base DIFAL — uso, consumo ou ativo (R$)</label>
                                    <input className="field-input" type="text" value={clientData.baseDifal || ''}
                                        onChange={e => updateClient('baseDifal', parseBRL(e.target.value))} placeholder="0,00" />
                                </div>
                            </div>
                            {(() => {
                                const mov = calcComercioLP(clientData, totalRevenue);
                                const margem = totalRevenue - mov.entradas;
                                const margemPct = totalRevenue > 0 ? margem / totalRevenue * 100 : 0;
                                return (
                                    <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-4 gap-3 text-center">
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">ICMS Débito − Crédito</p>
                                            <p className="text-sm font-bold text-slate-700">{mov.icms ? `${formatCurrency(mov.icms.debito)} − ${formatCurrency(mov.icms.credito)}` : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{mov.icms && mov.icms.saldoCredor > 0 ? 'Saldo credor' : 'ICMS a recolher'}</p>
                                            <p className={`text-sm font-extrabold ${mov.icms && mov.icms.saldoCredor > 0 ? 'text-emerald-600' : 'text-navy'}`}>{mov.icms ? formatCurrency(mov.icms.saldoCredor > 0 ? mov.icms.saldoCredor : mov.icms.aPagar) : '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">Antecip. + DIFAL + FUMACOP</p>
                                            <p className="text-sm font-bold text-slate-700">{formatCurrency(mov.antecipacao + mov.difal + mov.fumacop)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">Margem bruta</p>
                                            <p className={`text-sm font-extrabold ${margem < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(margem)} · {margemPct.toFixed(1).replace('.', ',')}%</p>
                                        </div>
                                    </div>
                                );
                            })()}
                            {validationErrors.revenue && <p className="field-error-msg mt-1 text-center">{validationErrors.revenue}</p>}
                        </div>
                    )}

                    {(clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (
                        <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-navy flex items-center gap-2"><Landmark className="w-4 h-4"/> Configuração de IRPJ e CSLL</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div>
                                    <label className="field-label">Forma de Apuração</label>
                                    <select className="field-input border-blue-200 focus:border-blue-500" value={clientData.irpjCsllMode || 'Mensal (Provisão)'}
                                        onChange={e => updateClient('irpjCsllMode', e.target.value)}>
                                        <option value="Mensal (Provisão)">Provisão Mensal (Calculada no mês)</option>
                                        <option value="Trimestral (Apuração)">Apuração Trimestral (Definitiva)</option>
                                        {clientData.regime === 'Lucro Real' && <option value="Estimativa (Anual)">Estimativa Mensal (Anual)</option>}
                                    </select>
                                </div>
                                
                                {(clientData.irpjCsllMode === 'Trimestral (Apuração)' || clientData.irpjCsllMode === 'Estimativa (Anual)') && (
                                    <div className="animate-fade-in">
                                        <label className="field-label">Faturamento Acumulado no Período (R$)</label>
                                        <input className="field-input border-amber-200 focus:border-amber-500 bg-white" type="text" value={clientData.periodRevenue || ''}
                                            onChange={e => updateClient('periodRevenue', parseBRL(e.target.value))}
                                            placeholder="Acumulado do trimestre/ano" />
                                        <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold">Base para calcular IRPJ/CSLL</p>
                                    </div>
                                )}
                                
                                {clientData.irpjCsllMode === 'Mensal (Provisão)' && (
                                    <div className="flex items-center">
                                        <p className="text-[10px] text-slate-500 italic">IRPJ e CSLL serão calculados com base no Faturamento Bruto Total do Mês demonstrado acima.</p>
                                    </div>
                                )}
                                {(clientData.atividade || 'Serviços') === 'Serviços' && (
                                    <label className="col-span-2 flex items-start gap-2 mt-1 cursor-pointer select-none bg-white p-3 rounded-lg border border-emerald-200">
                                        <input type="checkbox" className="w-4 h-4 mt-0.5 accent-emerald-600" checked={!!clientData.equiparacaoHospitalar}
                                            onChange={e => updateClient('equiparacaoHospitalar', e.target.checked)} />
                                        <span className="text-xs font-bold text-navy leading-relaxed">Equiparação hospitalar
                                            <span className="font-medium text-slate-500"> — aplica presunção reduzida (IRPJ 8% · CSLL 12%) na parte da receita que se enquadra. Use para serviços de saúde que atendam aos requisitos legais (Lei 9.249/95).</span>
                                        </span>
                                    </label>
                                )}
                                {(clientData.atividade || 'Serviços') === 'Serviços' && clientData.equiparacaoHospitalar && (
                                    <div className="col-span-2 animate-fade-in">
                                        <label className="field-label">Receita COM equiparação hospitalar (R$) — presunção 8% / 12%</label>
                                        <input className="field-input border-emerald-200 focus:border-emerald-500" type="text" value={clientData.receitaEquiparacao || ''}
                                            onChange={e => updateClient('receitaEquiparacao', parseBRL(e.target.value))} placeholder="0,00" />
                                        <p className="text-[10px] text-slate-500 mt-1">Apenas esta parcela usa 8%/12%. O restante da receita é tributado na presunção padrão de 32%.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {showFatorR && <FatorRDashboard clientData={clientData} isPrint={false} />}

                    {showFatorR && (
                        <label className="col-span-2 flex items-start gap-2 cursor-pointer select-none bg-white p-3 rounded-lg border border-emerald-200">
                            <input type="checkbox" className="w-4 h-4 mt-0.5 accent-emerald-600" checked={!!clientData.mostrarEconomiaFatorR}
                                onChange={e => updateClient('mostrarEconomiaFatorR', e.target.checked)} />
                            <span className="text-xs font-bold text-navy leading-relaxed">Mostrar economia do Fator R no relatório
                                <span className="font-medium text-slate-500"> — exibe o comparativo Anexo III × Anexo V como "economia gerada". Marque só quando a atividade realmente depende do Fator R, e não para atividades que já são Anexo III por natureza (ex.: certos serviços de saúde).</span>
                            </span>
                        </label>
                    )}

                    {parseNumBR(clientData.rbt12) > 0 && clientData.anexo && !showFatorR && clientData.regime === 'Simples Nacional' && (
                        (() => {
                            const rbt12 = parseNumBR(clientData.rbt12);
                            const folha12m = parseNumBR(clientData.folha12m !== undefined ? clientData.folha12m : clientData.folha);
                            const fR = calcFatorR(folha12m, rbt12);
                            const anexoEf = getAnexoEfetivo(clientData.anexo, fR, isSujeitoFatorR(clientData, folha12m));
                            const res = calcAliquotaEfetivaSN(rbt12, anexoEf);
                            return (
                                <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                                    <p className="text-xs font-bold text-navy mb-2 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Alíquota Efetiva Calculada
                                    </p>
                                    <div className="grid grid-cols-4 gap-3 text-center">
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Anexo Efetivo</p>
                                            <p className="text-sm font-bold text-navy">{anexoEf}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Faixa</p>
                                            <p className="text-sm font-bold text-navy">{res.faixa}ª</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Alíq. Nominal</p>
                                            <p className="text-sm font-bold text-slate-700">{res.nominal.toFixed(2).replace('.', ',')}%</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Alíq. Efetiva</p>
                                            <p className="text-lg font-extrabold text-emerald-700">{res.rate.toFixed(2).replace('.', ',')}%</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2 text-center">Dedução da faixa: {formatCurrency(res.deduction)} • RBT12: {formatCurrency(rbt12)}</p>
                                </div>
                            );
                        })()
                    )}

                    {(() => {
                        const compM = parseInt(clientData.compMonth || (clientData.competenceShort ? clientData.competenceShort.split('/')[0] : ''), 10);
                        const compY = parseInt(clientData.compYear || (clientData.competenceShort ? clientData.competenceShort.split('/')[1] : ''), 10);
                        const hasComp = compM >= 1 && compM <= 12 && compY > 1900;
                        const ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                        const exist = {}; (Array.isArray(clientData.evolucao) ? clientData.evolucao : []).forEach(e => exist[e.ym] = parseNumBR(e.receita));
                        const win = [];
                        if (hasComp) { for (let k = 11; k >= 0; k--) { let mm = compM - k, yy = compY; while (mm <= 0) { mm += 12; yy--; } const key = String(mm).padStart(2, '0') + '/' + yy; win.push({ ym: key, mm, yy, receita: exist[key] || 0 }); } }
                        const soma = win.reduce((s, e) => s + e.receita, 0);
                        const setEv = (ym, raw) => { const val = parseNumBR(formatInputBRL(raw)); updateClient('evolucao', win.map(e => ({ ym: e.ym, receita: e.ym === ym ? val : e.receita }))); };
                        return (
                            <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
                                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                                    <p className="text-xs font-bold text-navy flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Faturamento dos últimos 12 meses</p>
                                    {hasComp && (
                                        <div className="flex items-center gap-2 text-[11px]">
                                            <span className="text-slate-500">Soma (RBT12): <strong className="text-navy">{formatCurrency(soma)}</strong></span>
                                            <button onClick={() => updateClient('rbt12', formatBRLDisplay(soma))} className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200 font-bold cursor-pointer hover:bg-emerald-100">usar como RBT12</button>
                                        </div>
                                    )}
                                </div>
                                {!hasComp ? (
                                    <p className="text-[11px] text-slate-500 italic">Selecione a Competência (mês/ano) acima para liberar os 12 meses.</p>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2">
                                        {win.map((e) => (
                                            <div key={e.ym}>
                                                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">{ABBR[e.mm - 1]}/{String(e.yy).slice(2)}</label>
                                                <input className="field-input !py-1.5 !px-2 !text-xs text-right" type="text" value={e.receita > 0 ? formatBRLDisplay(e.receita) : ''} onChange={ev => setEv(e.ym, ev.target.value)} placeholder="0,00" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[9px] text-slate-400 mt-2">Alimenta o gráfico de evolução do relatório. É preenchido automaticamente ao importar o PGDAS-D; aqui você pode digitar/editar manualmente.</p>
                            </div>
                        );
                    })()}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Informações Adicionais
                </h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="field-label">Telefone do Escritório</label>
                        <input className="field-input" value={clientData.officePhone || ''}
                            onChange={e => updateClient('officePhone', e.target.value)} placeholder="(00) 00000-0000" />
                    </div>
                    <div>
                        <label className="field-label">E-mail do Escritório</label>
                        <input className="field-input" value={clientData.officeEmail || ''}
                            onChange={e => updateClient('officeEmail', e.target.value)} placeholder="contato@escritorio.com" />
                    </div>
                </div>
                <div>
                    <label className="field-label">Observações Gerais</label>
                    <textarea className="field-input min-h-[80px] resize-y" value={clientData.observations || ''}
                        onChange={e => updateClient('observations', e.target.value)} placeholder="Notas adicionais para o cliente..." />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Tributos Apurados
                    </h2>
                    <div className="flex gap-2">
                        {!showRetentionsTable && (
                            <button onClick={() => setForceShowRetentions(true)} className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer">
                                + Habilitar Retenções
                            </button>
                        )}
                        <button onClick={() => { recalcular(); }}
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <TrendingUp className="w-4 h-4" /> Recalcular Tudo
                        </button>
                        <button onClick={addTax}
                            className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-900 transition-all cursor-pointer shadow-sm hover:shadow-md">
                            <Plus className="w-4 h-4" /> Adicionar Tributo
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-slate-200">
                                <th className="text-left py-2 px-1 text-[10px] uppercase text-slate-500 font-bold min-w-[100px]">Tributo</th>
                                <th className="text-left py-2 px-1 text-[10px] uppercase text-slate-500 font-bold w-24">Base</th>
                                <th className="text-center py-2 px-1 text-[10px] uppercase text-slate-500 font-bold w-16">Alíq(%)</th>
                                
                                {showRetentionsTable && (
                                    <>
                                        <th className="text-left py-2 px-1 text-[10px] uppercase text-slate-500 font-bold w-24">Apurado</th>
                                        <th className="text-left py-2 px-1 text-[10px] uppercase text-emerald-600 font-bold w-24" title="Você pode editar os valores de retenção.">Retido ✎</th>
                                    </>
                                )}
                                
                                <th className="text-left py-2 px-1 text-[10px] uppercase text-navy font-extrabold w-24">{showRetentionsTable ? 'A Pagar' : 'Valor (R$)'}</th>
                                <th className="text-center py-2 px-1 text-[10px] uppercase text-slate-500 font-bold w-24">Venc.</th>
                                <th className="text-left py-2 px-1 text-[10px] uppercase text-slate-500 font-bold min-w-[120px]">Obs</th>
                                <th className="w-8"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {taxes.map((row) => (
                                <tr key={row.id} className="border-b border-slate-100 tax-row group">
                                    <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-xs font-bold text-navy" value={row.tax} onChange={e => updateTax(row.id, 'tax', e.target.value)} placeholder="Nome" /></td>
                                    <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-xs text-right" value={row.base} onChange={e => updateTax(row.id, 'base', formatInputBRL(e.target.value))} placeholder="0,00" /></td>
                                    <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-xs text-center bg-slate-50" value={row.rate} onChange={e => updateTax(row.id, 'rate', e.target.value.replace(/\./g, ',').replace(/[^\d,]/g, ''))} placeholder="0,00" /></td>
                                    
                                    {showRetentionsTable && (
                                        <>
                                            <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-xs text-right font-medium" value={row.apurado} onChange={e => updateTax(row.id, 'apurado', formatInputBRL(e.target.value))} placeholder="0,00" /></td>
                                            <td className="py-2 px-1">
                                                <input 
                                                    className={`field-input !py-1.5 !px-2 !text-xs text-right text-emerald-700 bg-emerald-50 border-emerald-200 focus:border-emerald-500 ${row.retidoManual ? 'shadow-[inset_0_0_0_1px_rgba(52,211,153,0.3)]' : ''}`} 
                                                    value={row.retido} 
                                                    onChange={e => updateTax(row.id, 'retido', formatInputBRL(e.target.value))} 
                                                    placeholder="0,00" 
                                                    title={row.retidoManual ? "Valor editado manualmente (Travado)" : "Valor calculado automaticamente"}
                                                />
                                            </td>
                                        </>
                                    )}

                                    <td className="py-2 px-1"><input className={`field-input !py-1.5 !px-2 !text-xs text-right font-bold text-navy ${showRetentionsTable ? 'bg-blue-50 border-blue-200' : ''}`} value={row.value} onChange={e => updateTax(row.id, 'value', formatInputBRL(e.target.value))} placeholder="0,00" /></td>
                                    <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-xs text-center" value={row.dueDate} onChange={e => { const dg = e.target.value.replace(/\D/g, '').slice(0, 8); const fmt = dg.length > 4 ? dg.slice(0, 2) + '/' + dg.slice(2, 4) + '/' + dg.slice(4) : dg.length > 2 ? dg.slice(0, 2) + '/' + dg.slice(2) : dg; updateTax(row.id, 'dueDate', fmt); }} placeholder="dd/mm/aaaa" /></td>
                                    <td className="py-2 px-1"><input className="field-input !py-1.5 !px-2 !text-[11px]" value={row.obs} onChange={e => updateTax(row.id, 'obs', e.target.value)} placeholder="Observação" /></td>
                                    <td className="py-2 px-1 text-center"><button onClick={() => removeTax(row.id)} aria-label={'Remover ' + (row.tax || 'tributo')} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer p-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"><Trash2 className="w-4 h-4" /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {taxes.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                        <Calculator className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum tributo adicionado. Clique em "Recalcular Tudo" para restaurar os padrões.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

                const ReportPreview = ({ clientData, taxes }) => {
    const parseNum = parseNumBR;

    const revenue = calculateTotalRevenue(clientData);
    const totalTributos = taxes.reduce((s, r) => s + parseNum(r.value), 0);
    const totalApurado = taxes.reduce((s, r) => s + (parseNum(r.apurado) || parseNum(r.value)), 0);
    const totalRetido = taxes.reduce((s, r) => s + parseNum(r.retido), 0);
    const aliquotaEfetiva = revenue > 0 ? (totalApurado / revenue) * 100 : 0;

    const rbt12 = parseNum(clientData.rbt12);
    const folha12m = parseNum(clientData.folha12m !== undefined ? clientData.folha12m : clientData.folha);
    const fR = calcFatorR(folha12m, rbt12);
    const anexoEfetivo = clientData.regime === 'Simples Nacional' && clientData.anexo ? getAnexoEfetivo(clientData.anexo, fR, isSujeitoFatorR(clientData, folha12m)) : clientData.anexo;

    const hasRetentions = parseNum(clientData.revenueRetained) > 0 || taxes.some(t => parseNum(t.retido) > 0 || t.retidoManual);
    const isSN = clientData.regime === 'Simples Nacional' || clientData.regime === 'MEI';
    const liquido = revenue - totalApurado;
    const compLabel = clientData.competence || clientData.competenceShort || '—';

    // Função que totaliza uma lista de tributos
    const calcTotal = (list) => list.reduce((s, t) => s + parseNum(t.value), 0);

    // ===== Economia inteligente: Fator R (Simples) e Equiparação Hospitalar (Lucro Presumido) =====
    let economia = null;
    if (clientData.mostrarEconomiaFatorR && clientData.regime === 'Simples Nacional' && (clientData.anexo === 'Anexo III' || clientData.anexo === 'Anexo V') && rbt12 > 0 && fR >= 28) {
        const rateIII = calcAliquotaEfetivaSN(rbt12, 'Anexo III').rate;
        const rateV = calcAliquotaEfetivaSN(rbt12, 'Anexo V').rate;
        const taxIII = revenue * rateIII / 100;
        const taxV = revenue * rateV / 100;
        if (taxV - taxIII > 0) {
            economia = {
                tipo: 'Fator R',
                valor: taxV - taxIII,
                semLabel: 'Sem Fator R · Anexo V',
                comLabel: 'Com Fator R · Anexo III',
                semVal: taxV, comVal: taxIII,
                semExtra: `Alíquota efetiva ${rateV.toFixed(2).replace('.', ',')}%`,
                comExtra: `Alíquota efetiva ${rateIII.toFixed(2).replace('.', ',')}%`,
                explica: `A folha + pró-labore dos últimos 12 meses representa ${fR.toFixed(1).replace('.', ',')}% do RBT12 (≥ 28%), enquadrando a empresa no Anexo III — alíquotas menores. Sem atingir o Fator R, a tributação seria pelo Anexo V.`,
            };
        }
    } else if ((clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && clientData.equiparacaoHospitalar && (clientData.atividade || 'Serviços') === 'Serviços') {
        const periodMode = clientData.irpjCsllMode === 'Trimestral (Apuração)' || clientData.irpjCsllMode === 'Estimativa (Anual)';
        const baseRev = periodMode && parseNum(clientData.periodRevenue) > 0 ? parseNum(clientData.periodRevenue) : revenue;
        const eqRev = Math.min(Math.max(parseNum(clientData.receitaEquiparacao), 0), baseRev);
        const normRev = baseRev - eqRev;
        const adicLimit = clientData.irpjCsllMode === 'Trimestral (Apuração)' ? 60000 : 20000;
        const baseIrpjSem = baseRev * 0.32, baseCsllSem = baseRev * 0.32;
        const semVal = (baseIrpjSem * 0.15) + (baseCsllSem * 0.09) + (Math.max(0, baseIrpjSem - adicLimit) * 0.10);
        const baseIrpjCom = eqRev * 0.08 + normRev * 0.32, baseCsllCom = eqRev * 0.12 + normRev * 0.32;
        const comVal = (baseIrpjCom * 0.15) + (baseCsllCom * 0.09) + (Math.max(0, baseIrpjCom - adicLimit) * 0.10);
        if (eqRev > 0 && semVal - comVal > 0) {
            economia = {
                tipo: 'Equiparação Hospitalar',
                valor: semVal - comVal,
                semLabel: 'Sem equiparação · tudo a 32%',
                comLabel: 'Com equiparação · parcial',
                semVal, comVal,
                semExtra: `IRPJ e CSLL sobre 32% de ${formatCurrency(baseRev)}`,
                comExtra: `${formatCurrency(eqRev)} a 8%/12% + ${formatCurrency(normRev)} a 32%`,
                explica: `Apenas ${formatCurrency(eqRev)} da receita se enquadra na equiparação (presunção 8% IRPJ / 12% CSLL); o restante (${formatCurrency(normRev)}) segue a 32%. A economia é a diferença na base de IRPJ e CSLL sobre a parcela equiparada.`,
            };
        }
    }

    // Faturamento
    const isLPComercioRep = (clientData.regime === 'Lucro Presumido' || clientData.regime === 'Lucro Real') && (clientData.atividade === 'Comércio' || clientData.atividade === 'Indústria');
    const movRep = isLPComercioRep ? calcComercioLP(clientData, revenue) : null;
    const fatRows = isSN
        ? [{ label: 'Receita bruta do mês', val: revenue }]
        : isLPComercioRep
            ? [{ label: 'Receita de vendas (saídas)', val: revenue }]
            : [
                { label: 'Receita com retenção', val: parseNum(clientData.revenueRetained) },
                { label: 'Receita sem retenção', val: parseNum(clientData.revenueNonRetained) },
            ];

    // Impostos
    let taxRows = taxes.filter(t => t.tax && parseNum(t.value) > 0);
    if (taxRows.length === 0) taxRows = taxes.filter(t => t.tax);

    // Vencimentos — uma guia por linha (detalhado, sem agrupar)
    const MES_ABBR = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    // Só datas dd/mm/aaaa válidas entram no calendário (texto livre mal formatado não vai pro PDF)
    const validDue = (s) => { if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return false; const d = +s.slice(0, 2), m = +s.slice(3, 5); return d >= 1 && d <= 31 && m >= 1 && m <= 12; };
    const withDue = taxes.filter(t => t.tax && t.dueDate && validDue(t.dueDate) && parseNum(t.value) > 0)
        .sort((a, b) => {
            const pa = a.dueDate.split('/'), pb = b.dueDate.split('/');
            return new Date(pa[2], pa[1] - 1, pa[0]) - new Date(pb[2], pb[1] - 1, pb[0]);
        });
    const totalDue = calcTotal(withDue);
    // Agrupamento por mês — o 1º mês fica na página Vencimentos; meses extras viram páginas próprias
    const venciByMonth = {};
    withDue.forEach(t => {
        const pp = t.dueDate.split('/'); const d = +pp[0], m = +pp[1], y = +pp[2];
        const k = y + '-' + m;
        if (!venciByMonth[k]) venciByMonth[k] = { year: y, month: m, days: {} };
        (venciByMonth[k].days[d] = venciByMonth[k].days[d] || []).push(t);
    });
    const venciMonths = Object.values(venciByMonth).sort((a, b) => (a.year - b.year) || (a.month - b.month));

    // ===== Glossário inteligente =====
    const activeTaxNames = taxes.map(t => t.tax);
    let gloss = GLOSSARY.filter(item => item.matchTaxes.some(mt => activeTaxNames.includes(mt))).map(g => ({ acronym: g.acronym, full: g.full, desc: g.desc }));
    if (economia && economia.tipo === 'Fator R') gloss.unshift({ acronym: 'Fator R', full: 'Razão Folha ÷ Receita (RBT12)', desc: 'Proporção entre folha + pró-labore dos 12 meses e o RBT12. Igual ou acima de 28% enquadra a empresa no Anexo III (alíquotas menores) no lugar do Anexo V.' });
    if (economia && economia.tipo === 'Equiparação Hospitalar') gloss.unshift({ acronym: 'Equiparação Hospitalar', full: 'Presunção reduzida de serviços de saúde', desc: 'Permite presunção de 8% (IRPJ) e 12% (CSLL) no lugar dos 32% padrão de serviços, reduzindo a base de IRPJ e CSLL no Lucro Presumido.' });
    if (hasRetentions) gloss.push({ acronym: 'Retenção na Fonte', full: 'Antecipação de tributo', desc: 'Valor já retido e recolhido pelo tomador no pagamento da nota; é abatido do tributo apurado para chegar ao saldo líquido a pagar no mês.' });
    if (clientData.regime === 'Simples Nacional') gloss.push({ acronym: 'Anexo / Faixa', full: 'Tabela e faixa do Simples', desc: 'Definem a alíquota aplicada conforme a atividade e o faturamento acumulado dos últimos 12 meses (RBT12).' });
    gloss.push({ acronym: 'Carga tributária', full: 'Percentual sobre o faturamento', desc: 'Quanto o total de tributos do período representa sobre o faturamento.' });
    gloss.push({ acronym: 'Competência', full: 'Mês de referência', desc: 'Período a que se referem as operações e os tributos apurados neste relatório.' });
    // Glossário inteligente: qualquer tributo apurado (valor > 0) não coberto pelo glossário padrão ganha entrada automática
    const coveredNames = new Set();
    GLOSSARY.forEach(g => g.matchTaxes.forEach(mt => coveredNames.add(mt)));
    taxes.filter(t => t.tax && parseNum(t.value) > 0).forEach(t => {
        if (!coveredNames.has(t.tax) && !gloss.some(g => g.acronym.toLowerCase() === t.tax.toLowerCase())) {
            gloss.push({ acronym: t.tax, full: 'Tributo apurado', desc: (t.obs && t.obs.trim()) ? t.obs : `Tributo informado na apuração da competência${t.rate && parseNum(t.rate) > 0 ? ' · alíquota ' + String(t.rate).replace('.', ',') + '%' : ''}.` });
        }
    });
    const seenGloss = new Set();
    gloss = gloss.filter(g => { const k = g.acronym.toLowerCase(); if (seenGloss.has(k)) return false; seenGloss.add(k); return true; });

    const hasPage2 = !!economia || gloss.length > 0 || !!clientData.observations;

    const cellL = { padding: '6.5px 0', textAlign: 'left' };
    const cellR = { padding: '6.5px 0', textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
    const totL = { padding: '8px 0 0', borderTop: '2px solid #001D3D', fontWeight: 700 };
    const totR = { padding: '8px 0 0', borderTop: '2px solid #001D3D', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };
    const rowBorder = { borderBottom: '1px solid #e9e6dd' };
    const thL = { textAlign: 'left', fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: '.5px', color: '#9aa2af', fontWeight: 700, padding: '0 0 6px', borderBottom: '1px solid #e9e6dd' };
    const thR = { ...thL, textAlign: 'right' };

    const Lock = () => (
        <div className="flex items-center gap-3">
            <img src={BRAND_ICON} alt="SETE" style={{ height: 46 }} />
            <div>
                <div style={{ fontFamily: "'Wildest', serif", fontWeight: 400, fontSize: 32, letterSpacing: '1.5px', lineHeight: .9, background: 'linear-gradient(178deg,#ffe9a8,#F79C04 52%,#a8690a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>SETE</div>
                <div style={{ textTransform: 'uppercase', letterSpacing: '2.4px', fontSize: '8.5px', color: '#e6c884', fontWeight: 600, marginTop: 4 }}>Soluções Empresariais</div>
            </div>
        </div>
    );

    const Header = ({ kicker, title, sub }) => (
        <div className="rounded-2xl overflow-hidden avoid-break mb-4 relative" style={{ background: '#001D3D' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(115deg, #00132a 0%, #062c59 52%, #001a39 100%)' }}></div>
            <div className="relative flex justify-between items-center page-header-inner" style={{ padding: '18px 24px' }}>
                <Lock />
                <div className="text-right">
                    <div style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '9.5px', color: '#F79C04', fontWeight: 700 }}>{kicker}</div>
                    <div style={{ fontWeight: 700, fontSize: 20, marginTop: 2, color: '#fff' }}>{title}</div>
                    <div style={{ fontSize: '10.5px', color: '#b9c4d4', marginTop: 3 }}>{sub}</div>
                </div>
            </div>
        </div>
    );

    const Footer = ({ pageLabel }) => (
        <div className="page-footer w-full mt-auto" style={{ borderTop: '2px solid #001D3D', paddingTop: 10 }}>
            <div className="flex justify-between items-center" style={{ fontSize: '9px', color: '#646d7c' }}>
                <div>
                    <span style={{ fontWeight: 700, color: '#1a2230' }}>{OFFICE_NAME}</span>
                    {clientData.officeEmail && <span> · {clientData.officeEmail}</span>}
                    {clientData.officePhone && <span> · {clientData.officePhone}</span>}
                </div>
                <div className="text-right">Competência {clientData.competenceShort || '—'}{pageLabel ? ' · ' + pageLabel : ''}</div>
            </div>
        </div>
    );

    const SectionTitle = ({ children, right }) => (
        <div className="flex items-center gap-2 mb-3 sec-ttl" style={{ textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '10px', color: '#b06f06', fontWeight: 700 }}>
            <span style={{ width: 14, height: 2, background: '#F79C04', display: 'inline-block' }}></span>
            <span>{children}</span>
            {right && <span className="ml-auto" style={{ color: '#9aa2af', fontWeight: 500, letterSpacing: '.3px', textTransform: 'none', fontSize: '9.5px' }}>{right}</span>}
        </div>
    );

    const card = "bg-white rounded-2xl border border-slate-200 shadow-sm";
    const cardPad = { padding: 16 };

    // KPI 3 e 4 variam conforme exista economia
    const kpi3 = economia
        ? { cls: 'gold', label: 'Economia gerada', value: fmtKpi(economia.valor), foot: 'via ' + economia.tipo }
        : { cls: 'gold', label: 'Alíquota efetiva', value: formatPercent(aliquotaEfetiva), foot: 'carga sobre a receita' };
    const kpi4 = economia
        ? { cls: 'w', label: 'Alíquota efetiva', value: formatPercent(aliquotaEfetiva), foot: 'carga sobre a receita' }
        : { cls: 'w', label: 'Após tributos', value: fmtKpi(liquido), foot: 'faturamento − impostos' };

    function fmtKpi(v) { return formatCurrency(v); }

    const kpiStyle = (cls) => cls === 'navy' ? { background: '#001D3D', color: '#fff', boxShadow: '0 1px 2px rgba(0,29,61,.08), 0 4px 12px rgba(0,29,61,.10)' }
        : cls === 'gold' ? { background: 'linear-gradient(160deg,#F79C04,#d4830a)', color: '#fff', boxShadow: '0 1px 2px rgba(176,111,6,.12), 0 4px 12px rgba(176,111,6,.14)' }
            : { background: '#fff', border: '1px solid #e2e8f0', color: '#1a2230', boxShadow: '0 1px 2px rgba(0,29,61,.05), 0 4px 12px rgba(0,29,61,.05)' };
    const KpiCard = ({ cls, label, value, foot }) => (
        <div className="rounded-2xl" style={{ ...cardPad, ...kpiStyle(cls) }}>
            <div style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '9.5px', fontWeight: 600, opacity: cls === 'w' ? 1 : .9, color: cls === 'w' ? '#646d7c' : undefined }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '20px', marginTop: 8, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '9.5px', marginTop: 7, opacity: cls === 'w' ? 1 : .9, color: cls === 'w' ? '#646d7c' : undefined }}>{foot}</div>
        </div>
    );

    const CalMonthCard = ({ mo }) => {
        const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const first = new Date(mo.year, mo.month - 1, 1).getDay();
        const ndays = new Date(mo.year, mo.month, 0).getDate();
        const cells = [];
        for (let i = 0; i < first; i++) cells.push(null);
        for (let d = 1; d <= ndays; d++) cells.push(d);
        const flat = Object.values(mo.days).reduce((a, b) => a.concat(b), []);
        const mTotal = flat.reduce((s, t) => s + parseNum(t.value), 0);
        return (
            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                <SectionTitle right={`${MONTHS[mo.month - 1]}/${mo.year} · ${flat.length} guia${flat.length > 1 ? 's' : ''}`}>Calendário de vencimentos</SectionTitle>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5, marginBottom: 5 }}>
                    {WD.map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: '#9aa2af' }}>{w}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
                    {cells.map((d, i) => {
                        if (d === null) return <div key={i}></div>;
                        const items = mo.days[d];
                        if (!items) return <div key={i} className="cal-day" style={{ minHeight: 52, border: '1px solid #eef0f3', borderRadius: 8, padding: '5px 6px', background: '#fafbfc' }}><span style={{ fontSize: '11px', fontWeight: 700, color: '#9aa2af' }}>{d}</span></div>;
                        const sub = items.reduce((s, t) => s + parseNum(t.value), 0);
                        const due = new Date(mo.year, mo.month - 1, d); const diff = Math.ceil((due - hoje) / 86400000);
                        const alert = diff <= 5;
                        return (
                            <div key={i} className="avoid-break cal-day" style={{ minHeight: 52, border: '1px solid ' + (alert ? '#f3d6cb' : '#e2e8f0'), borderRadius: 8, padding: '5px 6px', background: alert ? '#fcf1ec' : '#fff', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1a2230' }}>{d}</span>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
                                    {items.map((t, j) => { const isDas = /^DAS/.test(t.tax); return <span key={j} style={{ fontSize: '7.5px', fontWeight: 700, padding: '1px 5px', borderRadius: 20, background: isDas ? '#fcefd7' : '#e7ecf3', color: isDas ? '#b06f06' : '#0a3160' }}>{t.tax}</span>; })}
                                </div>
                                <span style={{ marginTop: 'auto', textAlign: 'right', paddingTop: 3, fontSize: '9px', fontWeight: 800, color: alert ? '#b5402b' : '#001D3D', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(sub)}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center" style={{ gap: 16, marginTop: 14, paddingTop: 11, borderTop: '2px solid #001D3D' }}>
                    <span className="flex items-center" style={{ gap: 6, fontSize: '10px', color: '#646d7c' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#fcf1ec', border: '1px solid #f3d6cb', display: 'inline-block' }}></i> Vence em ≤5 dias</span>
                    <span className="flex items-center" style={{ gap: 6, fontSize: '10px', color: '#646d7c' }}><i style={{ width: 10, height: 10, borderRadius: 3, background: '#fff', border: '1px solid #e2e8f0', display: 'inline-block' }}></i> A vencer</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#646d7c', fontWeight: 600 }}>Total a recolher <b style={{ fontSize: '15px', color: '#001D3D', fontWeight: 800, marginLeft: 6 }}>{formatCurrency(mTotal)}</b></span>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-[210mm] mx-auto print-wrapper">
            {/* ===== PÁGINA 1 ===== */}
            <div className="report-preview mb-8">
                <div className="report-preview-body">
                    <Header kicker="Relatório Mensal" title="Resumo Fiscal" sub={`Competência ${compLabel}`} />

                    <div className={card + ' flex mb-4 avoid-break'} style={{ padding: '12px 18px' }}>
                        {[
                            { l: 'Cliente', v: clientData.clientName || 'NOME DA EMPRESA' },
                            { l: 'CNPJ', v: clientData.cnpj || '—' },
                            { l: 'Regime', v: clientData.regime || '—' },
                            { l: isSN ? 'Anexo / Faixa' : 'Atividade', v: (isSN ? anexoEfetivo : clientData.atividade) || '—' },
                        ].map((it, i) => (
                            <div key={i} className="flex-1" style={i ? { borderLeft: '1px solid #e9e6dd', paddingLeft: 18 } : {}}>
                                <div style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '9px', color: '#9aa2af', fontWeight: 700 }}>{it.l}</div>
                                <div style={{ fontSize: '12px', fontWeight: 600, marginTop: 3 }}>{it.v}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-4 avoid-break">
                        <KpiCard cls="navy" label="Faturamento" value={fmtKpi(revenue)} foot="Receita bruta do mês" />
                        <KpiCard cls="w" label="Total a pagar" value={fmtKpi(totalTributos)} foot={hasRetentions ? 'líquido após retenção' : `${formatPercent(aliquotaEfetiva)} do faturamento`} />
                        <KpiCard cls={kpi3.cls} label={kpi3.label} value={kpi3.value} foot={kpi3.foot} />
                        <KpiCard cls={kpi4.cls} label={kpi4.label} value={kpi4.value} foot={kpi4.foot} />
                    </div>

                    {(clientData.irpjCsllMode === 'Trimestral (Apuração)' || clientData.irpjCsllMode === 'Estimativa (Anual)') && parseNum(clientData.periodRevenue) > 0 && (
                        <div className="avoid-break flex items-center gap-2" style={{ fontSize: '10px', color: '#646d7c', margin: '-2px 2px 12px' }}>
                            <span style={{ width: 14, height: 2, background: '#F79C04', display: 'inline-block', flexShrink: 0 }}></span>
                            <span>IRPJ e CSLL apurados sobre o <b style={{ color: '#1a2230' }}>faturamento acumulado do período: {formatCurrency(clientData.periodRevenue)}</b> · {clientData.irpjCsllMode}</span>
                        </div>
                    )}

                    {!hasRetentions ? (
                        <div className="grid grid-cols-2 gap-3 mb-4 avoid-break">
                            <div className={card} style={cardPad}>
                                <SectionTitle>Faturamento</SectionTitle>
                                <table className="w-full" style={{ fontSize: '11.5px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {fatRows.map((r, i) => (
                                            <tr key={i}><td style={{ ...cellL, ...(i < fatRows.length - 1 ? rowBorder : {}) }}>{r.label}</td><td style={{ ...cellR, ...(i < fatRows.length - 1 ? rowBorder : {}) }}>{formatCurrency(r.val)}</td></tr>
                                        ))}
                                        <tr><td style={totL}>Faturamento bruto</td><td style={totR}>{formatCurrency(revenue)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={card} style={cardPad}>
                                <SectionTitle right={`${taxRows.length} tributo${taxRows.length > 1 ? 's' : ''}`}>Impostos apurados</SectionTitle>
                                <table className="w-full" style={{ fontSize: '11.5px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {taxRows.map((t, i) => (
                                            <tr key={i}>
                                                <td style={{ ...cellL, ...(i < taxRows.length - 1 ? rowBorder : {}) }}>
                                                    {t.tax}{t.rate && parseNum(t.rate) > 0 ? <span style={{ color: '#9aa2af', fontWeight: 500 }}> · {String(t.rate).replace('.', ',')}%</span> : null}
                                                </td>
                                                <td style={{ ...cellR, ...(i < taxRows.length - 1 ? rowBorder : {}) }}>{formatCurrency(parseNum(t.value))}</td>
                                            </tr>
                                        ))}
                                        <tr><td style={totL}>Total a recolher</td><td style={totR}>{formatCurrency(totalTributos)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                                <SectionTitle right="receita do período">Faturamento</SectionTitle>
                                <table className="w-full" style={{ fontSize: '11.5px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {fatRows.map((r, i) => (
                                            <tr key={i}><td style={{ ...cellL, ...(i < fatRows.length - 1 ? rowBorder : {}) }}>{r.label}</td><td style={{ ...cellR, ...(i < fatRows.length - 1 ? rowBorder : {}) }}>{formatCurrency(r.val)}</td></tr>
                                        ))}
                                        <tr><td style={totL}>Faturamento bruto</td><td style={totR}>{formatCurrency(revenue)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className={card + ' mb-4'} style={cardPad}>
                                <SectionTitle right={`${taxRows.length} tributos · retenção abatida`}>Impostos apurados</SectionTitle>
                                <table className="w-full" style={{ fontSize: '11px', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={thL}>Tributo</th>
                                            <th style={thR}>Apurado</th>
                                            <th style={thR}>Retido</th>
                                            <th style={thR}>A pagar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {taxRows.map((t, i) => {
                                            const ap = parseNum(t.apurado) || parseNum(t.value);
                                            const re = parseNum(t.retido);
                                            const bd = i < taxRows.length - 1 ? rowBorder : {};
                                            return (
                                                <tr key={i}>
                                                    <td style={{ ...cellL, ...bd }}>{t.tax}{t.rate && parseNum(t.rate) > 0 ? <span style={{ color: '#9aa2af', fontWeight: 500 }}> · {String(t.rate).replace('.', ',')}%</span> : null}</td>
                                                    <td style={{ ...cellR, ...bd }}>{formatCurrency(ap)}</td>
                                                    <td style={{ ...cellR, ...bd, color: re > 0 ? '#1f7a4d' : '#9aa2af' }}>{re > 0 ? '− ' + formatCurrency(re) : '—'}</td>
                                                    <td style={{ ...cellR, ...bd, fontWeight: 700 }}>{formatCurrency(parseNum(t.value))}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td style={totL}>Total</td>
                                            <td style={totR}>{formatCurrency(totalApurado)}</td>
                                            <td style={{ ...totR, color: '#1f7a4d' }}>{totalRetido > 0 ? '− ' + formatCurrency(totalRetido) : '—'}</td>
                                            <td style={totR}>{formatCurrency(totalTributos)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </>
                    )}

                    {movRep && (movRep.entradas > 0 || movRep.icms) && (() => {
                        const margem = revenue - movRep.entradas;
                        const margemPct = revenue > 0 ? margem / revenue * 100 : 0;
                        const mx = Math.max(revenue, movRep.entradas, 1);
                        const MovBar = ({ label, val, color }) => (
                            <div style={{ marginBottom: 7 }}>
                                <div className="flex justify-between items-baseline" style={{ fontSize: '10.5px', marginBottom: 3 }}><b style={{ fontWeight: 600 }}>{label}</b><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(val)}</span></div>
                                <div style={{ height: 16, borderRadius: 5, background: '#f0f2f5', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: Math.max(2, val / mx * 100) + '%', background: color }}></i></div>
                            </div>
                        );
                        return (
                            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                                <SectionTitle right="movimentação do mês">Entradas × Saídas</SectionTitle>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <MovBar label="Saídas (vendas)" val={revenue} color="linear-gradient(90deg,#F79C04,#d4830a)" />
                                        <MovBar label="Entradas (compras)" val={movRep.entradas} color="#001D3D" />
                                    </div>
                                    <div style={{ flex: '0 0 175px', borderLeft: '1px solid #e9e6dd', paddingLeft: 14, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '9px', color: '#9aa2af', fontWeight: 700 }}>Margem bruta</div>
                                        <div style={{ fontWeight: 800, fontSize: 20, lineHeight: 1.1, color: margem < 0 ? '#b5402b' : '#1f7a4d' }}>{margemPct.toFixed(1).replace('.', ',')}%</div>
                                        <div style={{ fontSize: '9.5px', color: '#646d7c', marginTop: 3 }}>{formatCurrency(margem)} {margem < 0 ? '· entradas acima das saídas' : 'de resultado bruto'}</div>
                                    </div>
                                </div>
                                {movRep.icms && (
                                    <div style={{ marginTop: 10, paddingTop: 9, borderTop: '1px dashed #e9e6dd', fontSize: '10.5px', color: '#646d7c', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>ICMS do período: débito {formatCurrency(movRep.icms.debito)} − créditos {formatCurrency(movRep.icms.credito)}</span>
                                        <b style={{ color: movRep.icms.saldoCredor > 0 ? '#1f7a4d' : '#001D3D' }}>{movRep.icms.saldoCredor > 0 ? 'saldo credor de ' + formatCurrency(movRep.icms.saldoCredor) : 'a recolher ' + formatCurrency(movRep.icms.aPagar)}</b>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {Array.isArray(clientData.evolucao) && clientData.evolucao.some(p => p.receita > 0) && (() => {
                        const ev = clientData.evolucao;
                        const fmtMil = (v) => v <= 0 ? '' : (v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : Math.round(v).toString());
                        const mx = Math.max(...ev.map(p => p.receita), 1);
                        const media = ev.reduce((s, p) => s + p.receita, 0) / ev.length;
                        const ult = ev[ev.length - 1].receita, pen = ev.length > 1 ? ev[ev.length - 2].receita : 0;
                        const varPct = pen > 0 ? ((ult - pen) / pen * 100) : null;
                        return (
                            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                                <SectionTitle right="notas emitidas · últimos 12 meses">Evolução do faturamento</SectionTitle>
                                <div className="evo-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 118, borderBottom: '1.5px solid #e9e6dd', paddingTop: 6 }}>
                                    {ev.map((p, i) => (
                                        <div key={i} title={`${p.ym}: ${formatCurrency(p.receita)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                            <div style={{ fontSize: 7, lineHeight: 1, color: i === ev.length - 1 ? '#b06f06' : '#646d7c', fontWeight: 700, marginBottom: 3, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{fmtMil(p.receita)}</div>
                                            <div style={{ width: '100%', maxWidth: 22, height: Math.max(p.receita / mx * 82, p.receita > 0 ? 2 : 0) + '%', background: i === ev.length - 1 ? '#F79C04' : '#001D3D', borderRadius: '3px 3px 0 0' }}></div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 5 }}>
                                    {ev.map((p, i) => (
                                        <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: i === ev.length - 1 ? '#b06f06' : '#646d7c', fontWeight: i === ev.length - 1 ? 700 : 500 }}>{MES_ABBR[(parseInt(p.ym.slice(0, 2)) || 1) - 1]}</div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 14, marginTop: 9, fontSize: 10, color: '#646d7c', alignItems: 'center' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: '#001D3D', display: 'inline-block' }}></i> Meses anteriores</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 2, background: '#F79C04', display: 'inline-block' }}></i> Competência</span>
                                    <span style={{ marginLeft: 'auto', color: '#b06f06', fontWeight: 600 }}>Média {formatCurrency(media)}{varPct !== null ? ` · ${varPct >= 0 ? '▲' : '▼'} ${Math.abs(varPct).toFixed(1).replace('.', ',')}% no mês` : ''}</span>
                                </div>
                            </div>
                        );
                    })()}

                    
                </div>
                <Footer />
            </div>

{/* ===== PAGINA - VENCIMENTOS ===== */}
            {withDue.length > 0 && (
                <div className="report-preview">
                    <div className="report-preview-body">
                        <Header kicker="Relatório Mensal" title="Vencimentos" sub={`${clientData.clientName || 'Empresa'} · ${compLabel}`} />
                        <CalMonthCard mo={venciMonths[0]} />
                        {(() => {
                            const parseDMY = s => { const p = s.split('/'); return new Date(+p[2], +p[1] - 1, +p[0]); };
                            const sortedG = [...withDue].sort((a, b) => parseDMY(a.dueDate) - parseDMY(b.dueDate));
                            const hojeG = new Date(); hojeG.setHours(0, 0, 0, 0);
                            const prox = sortedG.find(t => parseDMY(t.dueDate) >= hojeG) || sortedG[0];
                            const proxItens = sortedG.filter(t => t.dueDate === prox.dueDate);
                            const proxVal = proxItens.reduce((s, t) => s + parseNum(t.value), 0);
                            const datas = new Set(withDue.map(t => t.dueDate)).size;
                            const maior = sortedG.reduce((m, t) => parseNum(t.value) > parseNum(m.value) ? t : m, sortedG[0]);
                            const MA = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                            const fmtD = s => { const p = s.split('/'); return p[0] + ' ' + MA[(+p[1] || 1) - 1]; };
                            const diff = Math.ceil((parseDMY(prox.dueDate) - hojeG) / 86400000);
                            const prazo = diff < 0 ? 'vencido' : diff === 0 ? 'vence hoje' : 'vence em ' + diff + ' dia' + (diff > 1 ? 's' : '');
                            const kl = { textTransform: 'uppercase', letterSpacing: '1px', fontSize: '9.5px', fontWeight: 600 };
                            return (
                                <>
                                    <div className="grid grid-cols-3 gap-3 mb-4 avoid-break">
                                        <div className="rounded-2xl" style={{ padding: 15, background: '#001D3D', color: '#fff' }}>
                                            <div style={{ ...kl, opacity: .85 }}>Proximo vencimento</div>
                                            <div style={{ fontWeight: 800, fontSize: '18px', marginTop: 6 }}>{fmtD(prox.dueDate)}</div>
                                            <div style={{ fontSize: '9.5px', marginTop: 6, opacity: .85 }}>{proxItens.map(t => t.tax).join(', ')} - {formatCurrency(proxVal)} - {prazo}</div>
                                        </div>
                                        <div className="rounded-2xl" style={{ padding: 15, background: 'linear-gradient(160deg,#F79C04,#d4830a)', color: '#fff' }}>
                                            <div style={{ ...kl, opacity: .9 }}>Total a recolher</div>
                                            <div style={{ fontWeight: 800, fontSize: '18px', marginTop: 6 }}>{formatCurrency(totalDue)}</div>
                                            <div style={{ fontSize: '9.5px', marginTop: 6, opacity: .9 }}>{withDue.length} guia{withDue.length > 1 ? 's' : ''} em {datas} data{datas > 1 ? 's' : ''}</div>
                                        </div>
                                        <div className="rounded-2xl" style={{ padding: 15, background: '#fff', border: '1px solid #e2e8f0' }}>
                                            <div style={{ ...kl, color: '#646d7c' }}>Maior guia</div>
                                            <div style={{ fontWeight: 800, fontSize: '18px', marginTop: 6, color: '#1a2230' }}>{formatCurrency(parseNum(maior.value))}</div>
                                            <div style={{ fontSize: '9.5px', marginTop: 6, color: '#646d7c' }}>{maior.tax} - {fmtD(maior.dueDate)}</div>
                                        </div>
                                    </div>
                                    <div className={card} style={cardPad}>
                                        <SectionTitle right={`${withDue.length} guia${withDue.length > 1 ? 's' : ''}`}>Detalhamento das guias</SectionTitle>
                                        <table className="w-full" style={{ fontSize: '11px', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                {sortedG.map((t, i) => {
                                                    const bd = i < sortedG.length - 1 ? rowBorder : {};
                                                    return (
                                                        <tr key={i}>
                                                            <td style={{ ...cellL, ...bd, width: 64, fontWeight: 700 }}>{fmtD(t.dueDate)}</td>
                                                            <td style={{ ...cellL, ...bd, color: '#646d7c' }}>{t.tax}</td>
                                                            <td style={{ ...cellR, ...bd }}>{formatCurrency(parseNum(t.value))}</td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr><td style={totL} colSpan="2">Total a recolher</td><td style={totR}>{formatCurrency(totalDue)}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                    <Footer />
                </div>
            )}

            {/* Meses extras do calendário — cada um em página própria para não estourar a folha */}
            {venciMonths.slice(1).map((mo, i) => (
                <div className="report-preview" key={'vm' + i}>
                    <div className="report-preview-body">
                        <Header kicker="Relatório Mensal" title="Vencimentos — continuação" sub={`${clientData.clientName || 'Empresa'} · ${compLabel}`} />
                        <CalMonthCard mo={mo} />
                    </div>
                    <Footer />
                </div>
            ))}

                        {/* ===== PÁGINA 2 ===== */}
            {hasPage2 && (
                <div className="report-preview">
                    <div className="report-preview-body">
                        <Header kicker="Relatório Mensal" title={economia ? 'Economia & Glossário' : 'Glossário'} sub={`${clientData.clientName || 'Empresa'} · ${compLabel}`} />

                        {economia && (
                            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                                <SectionTitle right={economia.tipo}>Economia tributária — de onde vem</SectionTitle>
                                <div className="flex items-stretch gap-4">
                                    <div style={{ flex: '0 0 210px', background: 'linear-gradient(160deg,#fff,#fcefd7)', border: '1px solid #F79C04', borderRadius: 12, padding: '16px 17px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ textTransform: 'uppercase', letterSpacing: '1.2px', fontSize: '9.5px', color: '#b06f06', fontWeight: 700 }}>Economia no mês</div>
                                        <div style={{ fontWeight: 800, fontSize: 34, color: '#b06f06', lineHeight: 1, marginTop: 7 }}>{formatCurrency(economia.valor)}</div>
                                        <div style={{ fontSize: '10.5px', color: '#1a2230', marginTop: 9, lineHeight: 1.45 }}>gerada pelo enquadramento em <b style={{ color: '#b06f06' }}>{economia.tipo}</b>. Projeção de <b style={{ color: '#b06f06' }}>{formatCurrency(economia.valor * 12)}</b> em 12 meses mantida a condição.</div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center" style={{ gap: 13 }}>
                                        <div>
                                            <div className="flex justify-between items-baseline" style={{ fontSize: 11, marginBottom: 5 }}><b style={{ fontWeight: 600 }}>{economia.semLabel}</b><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{formatCurrency(economia.semVal)}</span></div>
                                            <div style={{ height: 22, borderRadius: 6, background: '#f0f2f5', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: '100%', background: '#001D3D' }}></i></div>
                                            <small style={{ fontSize: 9, color: '#9aa2af' }}>{economia.semExtra}</small>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-baseline" style={{ fontSize: 11, marginBottom: 5 }}><b style={{ fontWeight: 600 }}>{economia.comLabel}</b><span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{formatCurrency(economia.comVal)}</span></div>
                                            <div style={{ height: 22, borderRadius: 6, background: '#f0f2f5', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: (economia.semVal > 0 ? Math.max(6, economia.comVal / economia.semVal * 100) : 100) + '%', background: 'linear-gradient(90deg,#F79C04,#d4830a)' }}></i></div>
                                            <small style={{ fontSize: 9, color: '#9aa2af' }}>{economia.comExtra}</small>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: 13, fontSize: '10.5px', color: '#646d7c', lineHeight: 1.5, borderTop: '1px dashed #e9e6dd', paddingTop: 11 }}>
                                    <b style={{ color: '#1a2230' }}>Como calculamos.</b> {economia.explica} A diferença entre os dois cenários é a economia que o enquadramento atual gera, todo mês.
                                </div>
                            </div>
                        )}

                        {gloss.length > 0 && (
                            <div className={card + ' mb-4'} style={cardPad}>
                                <SectionTitle right="termos do seu relatório">Glossário inteligente</SectionTitle>
                                <div className="grid grid-cols-2" style={{ gap: '10px 26px' }}>
                                    {gloss.map((item, i) => (
                                        <div key={i} className="avoid-break" style={{ paddingBottom: 9, borderBottom: '1px solid #e9e6dd' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#001D3D' }}>
                                                <span style={{ color: '#b06f06', fontWeight: 700, marginRight: 5 }}>{item.acronym}</span>{item.full}
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#646d7c', lineHeight: 1.4, marginTop: 2 }}>{item.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {clientData.observations && (
                            <div className={card + ' mb-4 avoid-break'} style={cardPad}>
                                <SectionTitle>Observações da apuração</SectionTitle>
                                <p style={{ fontSize: '11px', color: '#1a2230', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{clientData.observations}</p>
                            </div>
                        )}

                        <div className={card + ' avoid-break'} style={cardPad}>
                            <SectionTitle>Informações importantes</SectionTitle>
                            <ul style={{ fontSize: '10.5px', color: '#646d7c', lineHeight: 1.6, listStyle: 'none', margin: 0, padding: 0 }}>
                                <li>• Os valores correspondem à apuração do período indicado.</li>
                                {hasRetentions && <li>• O total da competência considera o abatimento das retenções na fonte.</li>}
                                <li>• As alíquotas podem variar conforme atividade, município e regime tributário.</li>
                                <li>• Este demonstrativo não substitui as guias oficiais de recolhimento.</li>
                            </ul>
                        </div>
                    </div>
                    <Footer />
                </div>
            )}
        </div>
    );
};

const Toast = ({ message, type = 'success', onClose }) => {
    const [hiding, setHiding] = useState(false);
    const onCloseRef = React.useRef(onClose);
    onCloseRef.current = onClose;
    React.useEffect(() => {
        setHiding(false);
        const timer = setTimeout(() => {
            setHiding(true);
            setTimeout(() => onCloseRef.current(), 300);
        }, 2800);
        return () => clearTimeout(timer);
    }, [message, type]);
    const icons = {
        success: <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>,
        warning: <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>,
        error: <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✕</div>,
    };
    return (
        <div className={`toast toast-${type} ${hiding ? 'hiding' : ''}`}>
            {icons[type]}
            {message}
        </div>
    );
};

const LoadingOverlay = () => (
    <div className="pdf-loading-overlay no-print">
        <div className="pdf-loading-spinner"></div>
        <p className="text-sm font-bold text-navy uppercase tracking-wide">Preparando PDF...</p>
        <p className="text-xs text-slate-400">O diálogo de impressão abrirá em instantes</p>
    </div>
);


const App = () => {
    // ?view=preview abre direto na visualização (links e verificação automatizada)
    const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get('view') === 'preview' ? 'preview' : 'edit');
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});

    const loadDraft = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Rascunho com formato inesperado (drift de versão) não pode derrubar o app
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
                if (parsed.taxes !== undefined) {
                    if (!Array.isArray(parsed.taxes)) return null;
                    parsed.taxes = parsed.taxes.filter(t => t && typeof t === 'object').map((t, i) => ({ ...t, id: t.id !== undefined ? t.id : Date.now() + i }));
                }
                if (parsed.clientData !== undefined && (typeof parsed.clientData !== 'object' || parsed.clientData === null)) return null;
                return parsed;
            }
        } catch (e) { }
        return null;
    };

    const draft = loadDraft();

    const [clientData, setClientData] = useState(() => {
        const data = draft?.clientData || {
            clientName: "", cnpj: "", competence: "", competenceShort: "",
            regime: "Lucro Presumido", revenueRetained: "", revenueNonRetained: ""
        };
        
        if (data.accessibility !== undefined) {
            delete data.accessibility;
        }
        
        return data;
    });
    const [taxes, setTaxes] = useState(draft?.taxes || DEFAULT_TAXES);

    React.useEffect(() => {
        if (draft) {
            setTimeout(() => setToast({ message: 'Rascunho restaurado automaticamente', type: 'success' }), 500);
        }
    }, []);

    // Ref evita closure obsoleta: o atalho sempre usa a versão atual de handlePrint (dados atuais)
    const handlePrintRef = React.useRef(() => { });
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                handlePrintRef.current();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const saveDraft = () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientData, taxes }));
            setToast({ message: 'Rascunho salvo com sucesso!', type: 'success' });
        } catch (e) {
            setToast({ message: 'Erro ao salvar rascunho', type: 'error' });
        }
    };

    const clearDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
        setClientData({
            clientName: "", cnpj: "", competence: "", competenceShort: "",
            regime: "Lucro Presumido", revenueRetained: "", revenueNonRetained: "",
            inssPago: ""
        });
        setTaxes(DEFAULT_TAXES);
        setValidationErrors({});
        setToast({ message: 'Dados limpos com sucesso', type: 'warning' });
    };

    const validate = () => {
        const errors = {};
        if (!clientData.clientName?.trim()) errors.clientName = 'Nome é obrigatório';
        if (!clientData.competenceShort?.trim()) errors.competence = 'Competência é obrigatória';

        // MEI sem faturamento ainda deve o DAS fixo — o relatório de vencimentos continua útil
        const totalRev = parseNumBR(clientData.revenueRetained) + parseNumBR(clientData.revenueNonRetained) + parseNumBR(clientData.revenue);
        if (totalRev <= 0 && clientData.regime !== 'MEI') errors.revenue = 'O faturamento total (soma) deve ser maior que zero';

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePrint = () => {
        if (!validate()) {
            setTab('edit');
            setToast({ message: 'Preencha os campos obrigatórios destacados', type: 'error' });
            return;
        }
        setLoading(true);
        setTab('preview');
        setTimeout(() => {
            setLoading(false);
            const empresa = (clientData.clientName || '').trim();
            const mes = (clientData.competence || clientData.competenceShort || '').trim();
            const oldTitle = document.title;
            if (empresa) {
                document.title = `Apuração Fiscal ${mes}${mes ? ' - ' : ''}${empresa}`
                    .replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
            }
            const restore = () => { document.title = oldTitle; window.removeEventListener('afterprint', restore); };
            window.addEventListener('afterprint', restore);
            window.print();
            setTimeout(restore, 2000);
        }, 600);
    };
    handlePrintRef.current = handlePrint;

    const handleWhatsAppCopy = () => {
        const total = taxes.reduce((sum, r) => sum + parseNumBR(r.value), 0);
        if (total <= 0) {
            setToast({ message: 'Nenhum valor apurado para copiar.', type: 'warning' });
            return;
        }

        const list = taxes
            .filter(t => t.tax && parseNumBR(t.value) > 0)
            .map(t => `${t.tax}: ${t.dueDate || '—'} - ${formatCurrency(t.value)}`)
            .join('\n');

        const text = `Olá! Segue a apuração fiscal referente ao mês de *${clientData.competenceShort || '—'}*:\n\n${list}\n\nTOTAL A PAGAR: ${formatCurrency(total)}`;

        if (!navigator.clipboard) {
            setToast({ message: 'Navegador sem suporte a copiar — use HTTPS ou copie manualmente', type: 'warning' });
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            setToast({ message: 'Resumo copiado!', type: 'success' });
        }).catch(() => {
            setToast({ message: 'Erro ao copiar para área de transferência', type: 'error' });
        });
    };

    return (
        <div className="min-h-screen">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {loading && <LoadingOverlay />}

            <div className="no-print bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-navy rounded-lg flex items-center justify-center text-white">
                            <FileCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-navy uppercase tracking-wide">Sistema de Apuração Mensal</h1>
                            <p className="text-[10px] text-slate-400">{OFFICE_NAME}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={saveDraft}
                            className="bg-emerald-50 text-emerald-700 px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer border border-emerald-200"
                            title="Salvar rascunho (dados ficam salvos no navegador)">
                            <Save className="w-3.5 h-3.5" /> Salvar
                        </button>
                        <button onClick={clearDraft}
                            className="bg-slate-50 text-slate-500 px-3 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border border-slate-200 hover:border-red-200"
                            title="Limpar todos os dados">
                            <Trash2 className="w-3.5 h-3.5" /> Limpar
                        </button>

                        <div className="w-px h-8 bg-slate-200 mx-1"></div>

                        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                            <button onClick={() => setTab('edit')} className={`tab-btn ${tab === 'edit' ? 'active' : ''}`}>
                                <span className="flex items-center gap-2"><Edit3 className="w-4 h-4" /> Editar</span>
                            </button>
                            <button onClick={() => setTab('preview')} className={`tab-btn ${tab === 'preview' ? 'active' : ''}`}>
                                <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Visualizar</span>
                            </button>
                        </div>

                        <button onClick={handleWhatsAppCopy}
                            className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer text-xs uppercase tracking-wide"
                            title="Copiar resumo para WhatsApp">
                            <MessageSquare size={16} strokeWidth={2} /> WhatsApp
                        </button>

                        <button onClick={handlePrint}
                            className="bg-navy text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer text-sm uppercase tracking-wide"
                            title="Exportar PDF (Ctrl+P)">
                            <Printer size={16} strokeWidth={2} /> Exportar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Sem key={tab}: trocar de aba não pode remontar o editor (perderia estado digitado) */}
            <div className="py-6 px-4">
                <div className="tab-content">
                    {tab === 'edit' ? (
                        <EditorPanel
                            clientData={clientData}
                            setClientData={setClientData}
                            taxes={taxes}
                            setTaxes={setTaxes}
                            validationErrors={validationErrors}
                            setValidationErrors={setValidationErrors}
                        />
                    ) : (
                        <ReportPreview clientData={clientData} taxes={taxes} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
