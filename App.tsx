
import React, { useState, useCallback, useRef } from 'react';
import { INITIAL_STATE } from './constants';
import { AppState, CategoryExpense, MaritalStatus, DisabilityLevel, SubItem } from './types';
import { formatCurrency, calculateIRPF, SOCIAL_SECURITY_EMPLOYEE_RATE, SOCIAL_SECURITY_EMPLOYER_RATE, calculateIVABreakdown, RATES_SS_EMPLOYEE, RATES_SS_EMPLOYER } from './utils/calculations';
import { exportTicketToPDF } from './utils/export';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const updateState = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleExportPDF = async () => {
    setExportMessage(null);
    if (!ticketRef.current) {
      setExportMessage({ type: 'error', text: 'No se encontró el ticket para exportar.' });
      setTimeout(() => setExportMessage(null), 3500);
      return;
    }

    setIsExporting(true);
    try {
      const filename = `ticket-contribucion-${state.viewMode.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
      await exportTicketToPDF(ticketRef.current, filename);
      setExportMessage({ type: 'success', text: 'PDF generado correctamente.' });
    } catch (error) {
      console.error('Error generando PDF', error);
      setExportMessage({ type: 'error', text: 'Hubo un problema al generar el PDF.' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportMessage(null), 3500);
    }
  };

  const updateExpense = (id: string, patch: Partial<CategoryExpense>) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => exp.id === id ? { ...exp, ...patch } : exp)
    }));
  };

  const handleSubItemChange = (catId: string, subId: string, patch: Partial<SubItem>) => {
    setState(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp => {
        if (exp.id === catId && exp.subItems) {
          const newSubItems = exp.subItems.map(sub => sub.id === subId ? { ...sub, ...patch } : sub);
          const newTotal = newSubItems.reduce((sum, sub) => sum + sub.amount, 0);
          return { ...exp, subItems: newSubItems, total: newTotal };
        }
        return exp;
      })
    }));
  };

  const handleIVAChange = (id: string, type: 'iva4' | 'iva10' | 'iva21', value: number) => {
    updateExpense(id, { [type]: value });
  };

  // Calculations
  const annualGross = state.grossSalary;
  const employerCostAnnual = annualGross * (1 + SOCIAL_SECURITY_EMPLOYER_RATE);
  const employerSSAnnual = annualGross * SOCIAL_SECURITY_EMPLOYER_RATE;
  
  const irpfRate = calculateIRPF(annualGross, state);
  const irpfAnnual = annualGross * irpfRate;
  const employeeSSAnnual = annualGross * SOCIAL_SECURITY_EMPLOYEE_RATE;
  const netAnnual = annualGross - irpfAnnual - employeeSSAnnual;

  const indirectTaxes = calculateIVABreakdown(state);
  const totalExpensesMonthly = state.expenses.reduce((acc, cat) => acc + cat.total, 0);
  const totalIndirectAnnual = indirectTaxes.totalIndirect * 12;

  const stateShareAnnual = employerSSAnnual + irpfAnnual + employeeSSAnnual + totalIndirectAnnual;
  const userShareAnnual = netAnnual - totalIndirectAnnual;

  const isAnnual = state.viewMode === 'Anual';
  const displayFactor = isAnnual ? 1 : (1 / (state.numPayments || 12));
  const displayFactorExpenses = isAnnual ? 12 : 1;

  // Specific Employee SS breakdown
  const ccAnnual = annualGross * RATES_SS_EMPLOYEE.CONTINGENCIAS_COMUNES;
  const desempAnnual = annualGross * RATES_SS_EMPLOYEE.DESEMPLEO;
  const formAnnual = annualGross * RATES_SS_EMPLOYEE.FORMACION;
  const meiAnnual = annualGross * RATES_SS_EMPLOYEE.MEI;

  // Specific Employer SS breakdown
  const ccEmployerAnnual = annualGross * RATES_SS_EMPLOYER.CONTINGENCIAS_COMUNES;
  const desempEmployerAnnual = annualGross * RATES_SS_EMPLOYER.DESEMPLEO;
  const fogasaEmployerAnnual = annualGross * RATES_SS_EMPLOYER.FOGASA;
  const formEmployerAnnual = annualGross * RATES_SS_EMPLOYER.FORMACION;
  const atepEmployerAnnual = annualGross * RATES_SS_EMPLOYER.AT_EP;
  const meiEmployerAnnual = annualGross * RATES_SS_EMPLOYER.MEI;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col font-display">
      <div className="relative flex flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 gap-8 flex-col lg:flex-row">
        
        {/* Left Panel: Inputs */}
        <div className="flex-1 flex flex-col gap-6">
          <header className="flex flex-col gap-2 pb-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Datos económicos y personales</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm max-w-2xl">
              Calcula el impacto fiscal de tu nómina y consumo en tiempo real.
            </p>
          </header>

          <div className="flex flex-col gap-4">
            <details className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden" open>
              <summary className="flex items-center justify-between p-4 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">payments</span>
                  </div>
                  <span className="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">Datos Económicos</span>
                </div>
                <span className="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Salario bruto anual</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                    <input 
                      className="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number" 
                      value={state.grossSalary}
                      onChange={(e) => updateState({ grossSalary: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Número de pagas</label>
                    <div className="relative">
                      <select 
                        className="w-full pl-4 pr-10 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm text-stone-900 dark:text-white appearance-none font-mono"
                        value={state.numPayments}
                        onChange={(e) => updateState({ numPayments: Number(e.target.value) as 12 | 14 })}
                      >
                        <option value={12}>12 pagas</option>
                        <option value={14}>14 pagas</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                        <span className="material-symbols-outlined text-lg">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Edad del trabajador</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number"
                      placeholder="Edad"
                      value={state.age}
                      onChange={(e) => updateState({ age: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </details>

            <details className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <span className="material-symbols-outlined">family_restroom</span>
                  </div>
                  <span className="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">Situación Personal</span>
                </div>
                <span className="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Número de hijos</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number"
                      min="0"
                      value={state.numChildren}
                      onChange={(e) => updateState({ numChildren: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Hijos menores de 3 años</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                      type="number"
                      min="0"
                      value={state.numChildrenUnder3}
                      onChange={(e) => updateState({ numChildrenUnder3: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="h-4 border-b border-dashed border-stone-200 dark:border-stone-800"></div>

          <header className="flex flex-col gap-2 pb-4 border-b border-stone-200 dark:border-stone-800">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-white">Gasto y Consumo Mensual</h2>
            <p className="text-stone-500 dark:text-stone-400 text-sm max-w-2xl">
              Desglosa tus gastos para ver cuánto IVA e impuestos especiales aportas al Estado.
            </p>
          </header>

          <div className="flex flex-col gap-4 pb-12">
            {state.expenses.map((cat) => (
              <details key={cat.id} className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
                <summary className="flex items-center justify-between py-1 px-3 cursor-pointer bg-stone-50 dark:bg-slate-800 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors select-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${cat.color}-100 dark:bg-${cat.color}-900/30 text-${cat.color}-600 dark:text-${cat.color}-400 flex items-center justify-center`}>
                      <span className="material-symbols-outlined">{cat.icon}</span>
                    </div>
                    <span className="font-semibold text-stone-700 dark:text-stone-200 uppercase tracking-tight text-sm">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-stone-500">{formatCurrency(cat.total)}</span>
                    <span className="material-symbols-outlined text-stone-400 transition-transform duration-200 group-open:rotate-180">expand_more</span>
                  </div>
                </summary>
                <div className="p-5 border-t border-stone-100 dark:border-slate-700 flex flex-col gap-6 bg-white dark:bg-slate-800">
                  
                  {cat.subItems ? (
                    <div className="flex flex-col gap-4">
                      {cat.subItems.map(sub => (
                        <div key={sub.id} className="flex flex-col gap-1.5 p-3 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-slate-700/50">
                          <div className="flex justify-between items-start text-xs font-bold text-stone-500 uppercase mb-1">
                            <label className="pt-1">{sub.name}</label>
                            <span className="text-[10px] text-stone-400 text-right">
                              {sub.id === 'fuel' ? (
                                <>
                                  IEH (€0,4007/L) + IVA 21% <br/> 
                                  <span className="normal-case font-normal italic">se calcula al precio medio de la gasolina</span>
                                </>
                              ) : sub.note ? sub.note : (sub.ivaRate > 0 ? `IVA ${sub.ivaRate}%` : 'Exento')}
                            </span>
                          </div>
                          
                          {(sub.id === 'fuel' || sub.id === 'electricity') ? (
                            <div className="grid grid-cols-2 gap-4 mt-1">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Importe Total</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                                  <input 
                                    className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                                    type="number"
                                    value={sub.amount}
                                    onChange={(e) => handleSubItemChange(cat.id, sub.id, { amount: Number(e.target.value) })}
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                                  {sub.id === 'fuel' ? 'Precio medio €/L' : 'Impuestos Inc.'}
                                </label>
                                <div className="relative">
                                  {sub.id === 'fuel' ? (
                                    <input 
                                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm text-stone-900 dark:text-white"
                                      type="number"
                                      step="0.01"
                                      value={sub.pricePerUnit}
                                      onChange={(e) => handleSubItemChange(cat.id, sub.id, { pricePerUnit: Number(e.target.value) })}
                                    />
                                  ) : (
                                    <div className="w-full px-3 py-2 bg-stone-100 dark:bg-slate-800 text-stone-500 rounded-lg text-xs flex items-center h-[38px]">
                                      IVA 21% + IEE
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                              <input 
                                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                                type="number"
                                value={sub.amount}
                                onChange={(e) => handleSubItemChange(cat.id, sub.id, { amount: Number(e.target.value) })}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Gasto Mensual Total</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono">€</span>
                          <input 
                            className="w-full pl-8 pr-4 py-2.5 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-stone-900 dark:text-white"
                            type="number"
                            value={cat.total}
                            onChange={(e) => updateExpense(cat.id, { total: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-5 p-4 bg-stone-50 dark:bg-slate-900/50 rounded-lg border border-stone-100 dark:border-stone-700/50">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Distribución estimada de IVA</label>
                        {[
                          { key: 'iva4', label: 'Superreducido (4%)', color: 'emerald' },
                          { key: 'iva10', label: 'Reducido (10%)', color: 'amber' },
                          { key: 'iva21', label: 'General (21%)', color: 'primary' }
                        ].map(iva => (
                          <div key={iva.key} className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-medium">
                              <span className="text-stone-600 dark:text-stone-300">{iva.label}</span>
                              <span className="font-mono text-stone-500">{(cat as any)[iva.key]}%</span>
                            </div>
                            <input 
                              className={`w-full text-${iva.color}-500`}
                              type="range"
                              min="0"
                              max="100"
                              value={(cat as any)[iva.key]}
                              onChange={(e) => handleIVAChange(cat.id, iva.key as any, Number(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Right Panel: Receipt */}
        <div className="w-full lg:w-[420px] flex-shrink-0 relative z-10">
          {exportMessage && (
            <div
              className={`absolute right-4 -top-2 z-20 flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold shadow-md ${exportMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
              role="status"
              aria-live="polite"
            >
              <span className="material-symbols-outlined text-base">
                {exportMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              {exportMessage.text}
            </div>
          )}
          <div className="sticky top-6">
            <div ref={ticketRef} className="relative flex flex-col bg-ticket-bg w-full shadow-ticket rounded-t-md border-t-4 border-t-stone-800">
              
              <div className="flex flex-col gap-3 pt-8 pb-4 px-6 border-b border-dashed border-stone-300">
                <div className="flex w-full items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-3xl">account_balance</span>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-stone-900 text-2xl font-black tracking-tight uppercase leading-none">Ticket de Contribución</h1>
                      <p className="text-stone-500 text-[10px] font-medium tracking-[0.2em] uppercase mt-1">Versión Fiscal 2024</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className={`inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 ${isExporting ? 'cursor-wait' : ''}`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {isExporting ? 'hourglass_top' : 'download'}
                    </span>
                    {isExporting ? 'Generando...' : 'Guardar PDF'}
                    {isExporting && (
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    )}
                  </button>
                </div>
                <div className="w-full">
                  <div className="flex h-10 w-full items-center justify-center rounded-lg bg-stone-200/50 p-1">
                    <button 
                      onClick={() => updateState({ viewMode: 'Mensual' })}
                      className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all ${state.viewMode === 'Mensual' ? 'bg-white shadow-sm text-primary' : 'text-stone-500'}`}
                    >
                      Mensual
                    </button>
                    <button 
                      onClick={() => updateState({ viewMode: 'Anual' })}
                      className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all ${state.viewMode === 'Anual' ? 'bg-white shadow-sm text-primary' : 'text-stone-500'}`}
                    >
                      Anual
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 flex flex-col gap-4 border-b border-dashed border-stone-300">
                <div className="flex justify-between items-baseline text-sm font-black text-stone-900 uppercase">
                  <span>COSTE TOTAL EMPRESA</span>
                  <span className="font-mono">{formatCurrency(employerCostAnnual * displayFactor)}</span>
                </div>

                <div className="h-px bg-stone-200 w-full my-0.5"></div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-baseline text-sm text-stone-700 font-medium">
                    <span>Seguridad Social Empresa</span>
                    <span className="font-mono text-stone-800">-{formatCurrency(employerSSAnnual * displayFactor)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5 text-[10px] text-stone-400 pl-4 uppercase font-mono italic">
                    <div className="flex justify-between"><span>Conting. Comunes (23,60%)</span><span>{formatCurrency(ccEmployerAnnual * displayFactor)}</span></div>
                    <div className="flex justify-between"><span>Desempleo Emp. (5,50%)</span><span>{formatCurrency(desempEmployerAnnual * displayFactor)}</span></div>
                    <div className="flex justify-between"><span>FOGASA (0,20%)</span><span>{formatCurrency(fogasaEmployerAnnual * displayFactor)}</span></div>
                    <div className="flex justify-between"><span>Formación Prof. (0,60%)</span><span>{formatCurrency(formEmployerAnnual * displayFactor)}</span></div>
                    <div className="flex justify-between"><span>AT y EP (~1,50%)</span><span>{formatCurrency(atepEmployerAnnual * displayFactor)}</span></div>
                    <div className="flex justify-between"><span>MEI Empresa (0,58%)</span><span>{formatCurrency(meiEmployerAnnual * displayFactor)}</span></div>
                  </div>
                </div>

                <div className="h-px bg-stone-200 w-full my-0.5"></div>
                
                <div className="flex justify-between items-baseline text-sm font-bold text-stone-800 uppercase">
                  <span>Tu Salario Bruto</span>
                  <span className="font-mono">{formatCurrency(annualGross * displayFactor)}</span>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-1">
                  <div className="flex justify-between items-baseline text-[13px] text-stone-700">
                    <div className="flex flex-col">
                      <span className="font-medium">IRPF (retención)</span>
                      <span className="text-[9px] text-stone-400 uppercase">TIPO: {(irpfRate * 100).toFixed(2)}%</span>
                    </div>
                    <span className="font-mono">-{formatCurrency(irpfAnnual * displayFactor)}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex justify-between items-baseline text-[13px] text-stone-700 font-medium">
                      <span>S.S. Trabajador</span>
                      <span className="font-mono">-{formatCurrency(employeeSSAnnual * displayFactor)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-[10px] text-stone-400 pl-4 uppercase font-mono italic">
                      <div className="flex justify-between"><span>Conting. Comunes (4,70%)</span><span>{formatCurrency(ccAnnual * displayFactor)}</span></div>
                      <div className="flex justify-between"><span>Desempleo (1,55%)</span><span>{formatCurrency(desempAnnual * displayFactor)}</span></div>
                      <div className="flex justify-between"><span>Formación Prof. (0,10%)</span><span>{formatCurrency(formAnnual * displayFactor)}</span></div>
                      <div className="flex justify-between"><span>MEI (0,12%)</span><span>{formatCurrency(meiAnnual * displayFactor)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20 flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Neto a tu Cuenta</span>
                    <span className="material-symbols-outlined text-primary text-sm">account_balance_wallet</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-stone-500">Transferencia Real</span>
                    <span className="font-mono text-xl font-bold text-primary">{formatCurrency(netAnnual * displayFactor)}</span>
                  </div>
                </div>
              </div>

              {/* Consumption Section */}
              <div className="px-6 py-5 flex flex-col gap-3 border-b-2 border-stone-800">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-stone-800 text-sm font-bold uppercase tracking-wider">2. Consumo Est.</h3>
                  <div className="flex h-7 items-center rounded-md bg-stone-200/50 p-0.5 border border-stone-300">
                    <button 
                      onClick={() => updateState({ consumptionDetailMode: 'Sencillo' })}
                      className={`h-full px-2 text-[10px] font-bold uppercase rounded transition-all ${state.consumptionDetailMode === 'Sencillo' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
                    >
                      Simple
                    </button>
                    <button 
                      onClick={() => updateState({ consumptionDetailMode: 'Detallado' })}
                      className={`h-full px-2 text-[10px] font-bold uppercase rounded transition-all ${state.consumptionDetailMode === 'Detallado' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
                    >
                      Detalle
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-baseline text-sm text-stone-600">
                  <span>Gasto Disponible</span>
                  <span className="font-mono">{formatCurrency(totalExpensesMonthly * displayFactorExpenses)}</span>
                </div>

                <div className="pl-3 border-l-2 border-dashed border-stone-300 flex flex-col gap-2 py-1">
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-stone-800 font-medium">Impuestos Indirectos</span>
                    <span className="font-mono font-medium text-stone-800">{formatCurrency(indirectTaxes.totalIndirect * displayFactorExpenses)}</span>
                  </div>
                  
                  {state.consumptionDetailMode === 'Sencillo' ? (
                    <div className="flex flex-col gap-1 text-[10px] text-stone-500 font-mono uppercase italic">
                      <div className="flex justify-between"><span>IVA General (21%)</span><span>{formatCurrency(indirectTaxes.iva21 * displayFactorExpenses)}</span></div>
                      <div className="flex justify-between"><span>IVA Reducido (10%)</span><span>{formatCurrency(indirectTaxes.iva10 * displayFactorExpenses)}</span></div>
                      <div className="flex justify-between"><span>Imp. Especiales (IEH/IEE/IPS/Alc/Tab)</span><span>{formatCurrency((indirectTaxes.ieh + indirectTaxes.ips + indirectTaxes.iee + (indirectTaxes as any).specialOthers) * displayFactorExpenses)}</span></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 pt-1">
                      {indirectTaxes.detailedItems.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-0.5 text-[10px] text-stone-400 font-mono uppercase italic border-b border-stone-100/50 pb-1 last:border-0">
                          <div className="flex justify-between text-stone-500 font-bold">
                            <span>{item.name}</span>
                          </div>
                          {item.iva > 0 && (
                            <div className="flex justify-between pl-2">
                              <span>IVA Aplicado</span>
                              <span>{formatCurrency(item.iva * displayFactorExpenses)}</span>
                            </div>
                          )}
                          {item.special > 0 && (
                            <div className="flex justify-between pl-2 text-primary font-bold">
                              <span>{item.type} Especial</span>
                              <span>{formatCurrency(item.special * displayFactorExpenses)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-6 bg-stone-100/50 flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Contribución Total</span>
                    <span className="text-[10px] text-stone-400">Estado S.L. se queda</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-stone-800">{formatCurrency(stateShareAnnual * (isAnnual ? 1 : 1/(state.numPayments || 12)))}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Tu Libertad Fiscal</span>
                    <span className="text-[10px] text-stone-400">Tú te quedas</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-primary">{formatCurrency(userShareAnnual * (isAnnual ? 1 : 1/(state.numPayments || 12)))}</span>
                </div>
                
                <div className="mt-2 w-full h-2 bg-stone-200 rounded-full overflow-hidden flex">
                  <div className="h-full bg-stone-800 transition-all duration-500" style={{ width: `${(stateShareAnnual / (employerCostAnnual || 1)) * 100}%` }} />
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(userShareAnnual / (employerCostAnnual || 1)) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-stone-500 uppercase">
                  <span>{Math.round((stateShareAnnual / (employerCostAnnual || 1)) * 100)}% Estado</span>
                  <span>{Math.round((userShareAnnual / (employerCostAnnual || 1)) * 100)}% Tú</span>
                </div>
              </div>

              <div className="px-6 pb-8 pt-4 text-center border-t border-dashed border-stone-300">
                <p className="font-mono text-[10px] text-stone-400 mb-2 tracking-widest">***********************************</p>
                <p className="text-xs text-stone-500 font-medium italic">"Gracias por su contribución obligatoria."</p>
                <div className="mt-6 flex justify-center opacity-50">
                  <div className="h-8 flex items-end gap-[2px]">
                    {[2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 4, 2, 1, 3, 2, 1, 4].map((w, i) => (
                      <div key={i} className="bg-stone-800" style={{ width: `${w}px`, height: `${(i % 5 === 0 ? 32 : (i % 3 === 0 ? 24 : 16))}px` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="ticket-bottom"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
