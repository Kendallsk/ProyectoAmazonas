import { FormEvent, useEffect, useMemo, useState } from 'react';
import FichaTecnica from './components/FichaTecnica/FichaTecnica';
import logo from './img/logo.png';
import './App.css';

type Section = 'inicio' | 'ficha' | 'pagos';
type PaymentMethod = 'efectivo' | 'transferencia';
type Cut = { id: string; date: string; operator: string; amount: number; paymentMethod: PaymentMethod; service: string; productDeduction: number | null };
type PayrollData = { operators: string[]; cuts: Cut[]; paidOperators: Record<string, string[]> };
const STORAGE_KEY = 'amazonas-payroll-v3';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const money = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
const sectionFromPath = (): Section => window.location.pathname === '/ficha' ? 'ficha' : window.location.pathname === '/pagos' ? 'pagos' : 'inicio';

function Brand({ onClick }: { onClick: () => void }) {
  return <button className="brand" onClick={onClick} aria-label="Peluquería Amazonas, ir al inicio"><img className="brand-logo" src={logo} alt="" onError={event => { event.currentTarget.hidden = true; }} /><span className="brand-mark">A</span><span>AMAZONAS <small>PELUQUERÍA</small></span></button>;
}

const readPayroll = (): PayrollData => {
  try {
    const latest = localStorage.getItem(STORAGE_KEY);
    const previous = localStorage.getItem('lumina-payroll-v2');
    const old = !latest && !previous;
    const value = JSON.parse(latest || previous || localStorage.getItem('lumina-payroll-v1') || '{}') as Partial<PayrollData>;
    return { operators: Array.isArray(value.operators) ? value.operators : [], cuts: Array.isArray(value.cuts) ? value.cuts.map(cut => ({ id: cut.id, date: cut.date, operator: cut.operator, amount: old ? cut.amount / 1000 : cut.amount, paymentMethod: cut.paymentMethod ?? 'efectivo', service: cut.service || 'Servicio', productDeduction: cut.productDeduction ?? null })) : [], paidOperators: value.paidOperators ?? {} };
  } catch { return { operators: [], cuts: [], paidOperators: {} }; }
};

function App() {
  const [section, setSection] = useState<Section>(sectionFromPath);
  const [payroll, setPayroll] = useState<PayrollData>(readPayroll);
  const [date, setDate] = useState(today);
  const [newOperator, setNewOperator] = useState('');
  const [addingOperator, setAddingOperator] = useState(false);
  const [cobroOperator, setCobroOperator] = useState<string | null>(null);
  const [historyOperator, setHistoryOperator] = useState<string | null>(null);
  const [editingCut, setEditingCut] = useState<Cut | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('efectivo');
  const [service, setService] = useState('');
  const [discountPending, setDiscountPending] = useState(false);
  const [productDiscount, setProductDiscount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(payroll)); }, [payroll]);
  useEffect(() => {
    const syncSection = () => setSection(sectionFromPath());
    window.addEventListener('popstate', syncSection);
    return () => window.removeEventListener('popstate', syncSection);
  }, []);
  const dailyCuts = useMemo(() => payroll.cuts.filter(cut => cut.date === date), [payroll.cuts, date]);
  const grandTotal = dailyCuts.reduce((sum, cut) => sum + cut.amount, 0);
  const cashTotal = dailyCuts.filter(cut => cut.paymentMethod === 'efectivo').reduce((sum, cut) => sum + cut.amount, 0);
  const transferTotal = grandTotal - cashTotal;
  const productTotal = dailyCuts.reduce((sum, cut) => sum + (cut.productDeduction ?? 0), 0);
  const pendingCuts = dailyCuts.filter(cut => cut.productDeduction === null);
  const pendingTotal = pendingCuts.reduce((sum, cut) => sum + cut.amount, 0);
  const settledTotal = dailyCuts.filter(cut => cut.productDeduction !== null).reduce((sum, cut) => sum + cut.amount - (cut.productDeduction ?? 0), 0);
  const paidToday = payroll.paidOperators[date] ?? [];
  const paidOutToday = paidToday.reduce((sum, name) => sum + dailyCuts.filter(cut => cut.operator === name && cut.productDeduction !== null).reduce((part, cut) => part + (cut.amount - (cut.productDeduction ?? 0)) / 2, 0), 0);
  const cashAfterPayout = cashTotal - paidOutToday;
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  const navigate = (next: Section) => {
    setSection(next);
    const path = next === 'inicio' ? '/' : `/${next}`;
    if (window.location.pathname !== path) window.history.pushState({ section: next }, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addOperator = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newOperator.trim();
    if (!name || payroll.operators.some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase())) return;
    setPayroll(current => ({ ...current, operators: [...current.operators, name] }));
    setNewOperator(''); setAddingOperator(false); setMessage(`${name} agregado al equipo.`);
    window.setTimeout(() => setMessage(''), 2500);
  };

  const addCut = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = Math.round(Number(amount.trim().replace(',', '.')) * 100) / 100;
    if (!cobroOperator || !Number.isFinite(value) || value <= 0) return;
    const cut: Cut = { id: crypto.randomUUID(), date, operator: cobroOperator, amount: value, paymentMethod, service: discountPending ? '' : 'Servicio', productDeduction: discountPending ? null : 0 };
    setPayroll(current => ({ ...current, cuts: [...current.cuts, cut], paidOperators: { ...current.paidOperators, [date]: (current.paidOperators[date] ?? []).filter(name => name !== cut.operator) } }));
    setAmount(''); setPaymentMethod('efectivo'); setService(''); setDiscountPending(false); setProductDiscount(''); setCobroOperator(null);
    setMessage(`Cobro de ${money(value)} registrado para ${cut.operator}.`);
    window.setTimeout(() => setMessage(''), 3000);
  };

  const removeCut = (id: string) => setPayroll(current => {
    const cut = current.cuts.find(item => item.id === id);
    const paidOperators = { ...current.paidOperators };
    if (cut) paidOperators[cut.date] = (paidOperators[cut.date] ?? []).filter(name => name !== cut.operator);
    return { ...current, cuts: current.cuts.filter(item => item.id !== id), paidOperators };
  });
  const saveEditedCut = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingCut) return;
    const value = Number(amount.trim().replace(',', '.'));
    const deduction = editingCut.productDeduction === null ? Math.round(Number(productDiscount.replace(',', '.')) * 100) / 100 : editingCut.productDeduction;
    const selectedService = service.trim();
    if (!Number.isFinite(value) || value <= 0 || (editingCut.productDeduction === null && !selectedService) || (deduction !== null && (!Number.isFinite(deduction) || deduction < 0 || deduction > value))) return;
    setPayroll(current => {
      const paidOperators = { ...current.paidOperators };
      paidOperators[editingCut.date] = (paidOperators[editingCut.date] ?? []).filter(name => name !== editingCut.operator);
      return { ...current, cuts: current.cuts.map(cut => cut.id === editingCut.id ? { ...cut, amount: Math.round(value * 100) / 100, paymentMethod, service: editingCut.productDeduction === null ? selectedService : cut.service, productDeduction: deduction } : cut), paidOperators };
    });
    setEditingCut(null); setAmount(''); setMessage('El cobro fue actualizado.');
    window.setTimeout(() => setMessage(''), 2500);
  };
  const deleteOperator = (name: string) => {
    const hasHistory = payroll.cuts.some(cut => cut.operator === name);
    const prompt = hasHistory ? `¿Eliminar a ${name} y todos sus cobros guardados?` : `¿Eliminar a ${name} del equipo?`;
    if (!window.confirm(prompt)) return;
    setPayroll(current => {
      const paidOperators = Object.fromEntries(Object.entries(current.paidOperators).map(([day, names]) => [day, names.filter(item => item !== name)]));
      return { ...current, operators: current.operators.filter(item => item !== name), cuts: current.cuts.filter(cut => cut.operator !== name), paidOperators };
    });
  };

  const operatorTotal = (name: string, source = dailyCuts) => source.filter(cut => cut.operator === name).reduce((sum, cut) => sum + cut.amount, 0);
  const operatorDeduction = (name: string) => dailyCuts.filter(cut => cut.operator === name && cut.productDeduction !== null).reduce((sum, cut) => sum + (cut.productDeduction ?? 0), 0);
  const operatorNetToSplit = (name: string) => dailyCuts.filter(cut => cut.operator === name && cut.productDeduction !== null).reduce((sum, cut) => sum + cut.amount - (cut.productDeduction ?? 0), 0);
  const toggleOperatorPaid = (name: string) => setPayroll(current => {
    const alreadyPaid = (current.paidOperators[date] ?? []).includes(name);
    const names = current.paidOperators[date] ?? [];
    return { ...current, paidOperators: { ...current.paidOperators, [date]: alreadyPaid ? names.filter(item => item !== name) : [...names, name] } };
  });
  const operatorCash = (name: string) => dailyCuts.filter(cut => cut.operator === name && cut.paymentMethod === 'efectivo').reduce((sum, cut) => sum + cut.amount, 0);
  const operatorTransfer = (name: string) => operatorTotal(name) - operatorCash(name);

  return <div className={`salon-app ${section === 'ficha' ? 'salon-app--ficha' : ''}`}>
    {section !== 'ficha' && <header className="topbar">
      <Brand onClick={() => navigate('inicio')} />
      <nav aria-label="Navegación principal">{([['inicio', 'Inicio'], ['ficha', 'Ficha técnica'], ['pagos', 'Pagos del equipo']] as const).map(([id, label]) => <button key={id} className={`nav-link ${section === id ? 'active' : ''}`} onClick={() => navigate(id)}>{label}</button>)}</nav>
    </header>}

    {section === 'inicio' && <main className="home-page">
      <section className="home-hero"><div className="home-hero-copy"><p className="eyebrow">PELUQUERÍA · AMAZONAS</p><h1>Tu belleza,<br />con identidad.</h1><p>Atención personalizada, un equipo con talento y cada detalle del salón en orden.</p><div className="hero-actions"><button className="primary-button" onClick={() => navigate('pagos')}>Abrir caja <span>→</span></button><button className="text-button" onClick={() => navigate('ficha')}>Nueva ficha de cliente</button></div></div><div className="home-hero-info"><span className="hero-info-label">PELUQUERÍA</span><strong>AMAZONAS</strong><span className="hero-info-rule"/><span className="hero-info-hours">BELLEZA · CUIDADO<br />ESTILO PROPIO</span></div></section>
      <section className="welcome-row"><div><p className="eyebrow">ACCESOS RÁPIDOS</p><h2>¿Qué necesitas hacer?</h2></div><p>Herramientas claras para el trabajo de cada día.</p></section>
      <section className="feature-grid"><button className="feature-card" onClick={() => navigate('ficha')}><span className="feature-index">01 / CLIENTES</span><h3>Ficha técnica</h3><p>Consulta el diagnóstico y plan de cuidado de cada cliente.</p><span className="feature-arrow">↗</span></button><button className="feature-card feature-card--blue" onClick={() => navigate('pagos')}><span className="feature-index">02 / EQUIPO</span><h3>Pagos del equipo</h3><p>Registra los cobros del día y calcula la parte de cada operador.</p><span className="feature-arrow">↗</span></button><div className="home-hours"><span className="feature-index">PELUQUERÍA AMAZONAS</span><strong>Un salón para sentirte bien.</strong><span>ESTILO · CUIDADO · BELLEZA</span></div></section>
      <footer className="home-footer"><span>PELUQUERÍA AMAZONAS © 2026</span><span>GESTIÓN DEL ESTUDIO</span></footer>
    </main>}

    {section === 'ficha' && <main className="ficha-only"><FichaTecnica onBack={() => navigate('inicio')} /></main>}

    {section === 'pagos' && <main className="subpage payment-page">
      <div className="payment-title-row"><div className="subpage-heading"><button className="back-link" onClick={() => navigate('inicio')}>← Inicio</button><p className="eyebrow">CAJA · LIQUIDACIÓN DIARIA</p><h1>Pagos del equipo</h1><p>Registra cada cobro. El efectivo y las transferencias se suman por separado.</p></div><label className="date-field">DÍA DE CAJA<input type="date" value={date} onChange={event => setDate(event.target.value)} /></label></div>
      <section className="cash-summary"><div className="cash-summary-main"><span>TRABAJO TOTAL · RECAUDADO</span><strong>{money(grandTotal)}</strong><small>{dailyCuts.length} {dailyCuts.length === 1 ? 'cobro' : 'cobros'} · {dateLabel}</small></div><div className="cash-summary-item"><span>EFECTIVO RECIBIDO</span><strong>{money(cashTotal)}</strong><small>Antes de pagar al equipo</small></div><div className="cash-summary-item"><span>TRANSFERENCIAS</span><strong>{money(transferTotal)}</strong><small>Pagos digitales recibidos</small></div><div className="cash-summary-item product-summary"><span>PRODUCTO DESCONTADO</span><strong>{money(productTotal)}</strong><small>{pendingCuts.length ? `${pendingCuts.length} cobros por liquidar` : 'Descuentos registrados'}</small></div><div className="cash-summary-item cash-after-summary"><span>EFECTIVO EN CAJA</span><strong>{money(cashAfterPayout)}</strong><small>Después de pagos al equipo</small></div></section>
      <div className="daily-split"><strong>Total a entregar a operadores {money(settledTotal / 2)}</strong><strong>Total que queda en peluquería {money(settledTotal / 2 + productTotal)}</strong></div>
      <section className="team-heading"><div><p className="eyebrow">LIQUIDACIÓN 50 / 50</p><h2>Operadores</h2></div><button className="secondary-button" onClick={() => setAddingOperator(value => !value)}>{addingOperator ? 'Cancelar' : '+ Nuevo operador'}</button></section>
      {addingOperator && <form className="add-operator-form" onSubmit={addOperator}><label>Nombre del operador<input autoFocus value={newOperator} onChange={event => setNewOperator(event.target.value)} placeholder="Escribe el nombre" required /></label><button type="submit" className="primary-button">Agregar operador</button></form>}
      {message && <p role="status" className="status-message">{message}</p>}
      {payroll.operators.length === 0 ? <div className="empty-team"><span>+</span><h3>Aún no hay operadores</h3><p>Agrega a tu equipo para empezar a registrar los cobros del día.</p><button className="primary-button" onClick={() => setAddingOperator(true)}>Agregar primer operador</button></div> : <section className="operator-cards" aria-label="Operadores">{payroll.operators.map((name, index) => {
        const todayTotal = operatorTotal(name);
        const deductionTotal = operatorDeduction(name);
        const pendingCount = dailyCuts.filter(cut => cut.operator === name && cut.productDeduction === null).length;
        const operatorPayout = operatorNetToSplit(name) / 2;
        const isPaid = paidToday.includes(name);
        const history = payroll.cuts.filter(cut => cut.operator === name).sort((a, b) => b.date.localeCompare(a.date));
        return <article className="operator-card" key={name}><div className="operator-card-top"><span className="operator-avatar">{name.charAt(0).toUpperCase()}</span><div className="operator-card-name"><span>OPERADOR {String(index + 1).padStart(2, '0')}</span><h3>{name}</h3></div><button className={`paid-check ${isPaid ? 'is-paid' : ''}`} aria-label={isPaid ? `Marcar pago de ${name} como pendiente` : `Marcar pago de ${name} como cancelado`} title={isPaid ? 'Pago cancelado' : 'Marcar como cancelado'} disabled={pendingCount > 0 || operatorPayout <= 0} onClick={() => toggleOperatorPaid(name)}>{isPaid ? '✓' : ''}</button><button className="icon-button delete-button" aria-label={`Eliminar a ${name}`} title="Eliminar operador" onClick={() => deleteOperator(name)}>×</button></div>
          <div className="operator-amount"><span>Total generado hoy</span><strong>{money(todayTotal)}</strong></div><div className="operator-breakdown"><span><i className="method-dot dot-cash"/>Efectivo <b>{money(operatorCash(name))}</b></span><span><i className="method-dot dot-transfer"/>Transferencia <b>{money(operatorTransfer(name))}</b></span></div>{deductionTotal > 0 && <div className="operator-deduction"><span>Descuento de producto</span><strong>− {money(deductionTotal)}</strong></div>}<div className="operator-payout"><span>Total a pagar</span><strong>{money(operatorPayout)}</strong></div>{isPaid && <p className="paid-status">Pago cancelado · {money(operatorPayout)} descontados de caja</p>}{pendingCount > 0 && <p className="pending-hint">{pendingCount} {pendingCount === 1 ? 'cobro pendiente' : 'cobros pendientes'} de descontar producto</p>}
          <div className="operator-actions"><button className="primary-button charge-button" onClick={() => { setCobroOperator(name); setAmount(''); setPaymentMethod('efectivo'); setService(''); setDiscountPending(false); setProductDiscount(''); }}>+ Cobro</button><button className="history-button" onClick={() => setHistoryOperator(name)}>Historial <span>{history.length}</span></button></div>
        </article>;
      })}</section>}
      <p className="cash-note">Las ventas, el efectivo y las transferencias muestran siempre el valor cobrado. Los descuentos pendientes no cambian la repartición hasta que los liquides desde el historial.</p>
    </main>}

    {cobroOperator && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setCobroOperator(null); }}><section className="charge-modal" role="dialog" aria-modal="true" aria-labelledby="charge-title"><button className="icon-button modal-close" aria-label="Cerrar" onClick={() => setCobroOperator(null)}>×</button><p className="eyebrow">NUEVO COBRO · {dateLabel.toUpperCase()}</p><h2 id="charge-title">Cobrar a {cobroOperator}</h2><p className="modal-description">Ingresa el monto y el método de pago.</p><form onSubmit={addCut}><label className="modal-field">Monto en dólares<input autoFocus type="text" inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value.replace(/[^\d.,]/g, ''))} placeholder="Ej. 2 o 2,50" required /><small>Puedes usar coma o punto para los centavos.</small></label><fieldset className="method-picker"><legend>Método de pago</legend><label className={paymentMethod === 'efectivo' ? 'method-option chosen' : 'method-option'}><input type="radio" name="method" checked={paymentMethod === 'efectivo'} onChange={() => setPaymentMethod('efectivo')} /><span>💵</span><span><strong>Efectivo</strong><small>Entra a la caja</small></span></label><label className={paymentMethod === 'transferencia' ? 'method-option chosen' : 'method-option'}><input type="radio" name="method" checked={paymentMethod === 'transferencia'} onChange={() => setPaymentMethod('transferencia')} /><span>↗</span><span><strong>Transferencia</strong><small>Pago digital</small></span></label></fieldset><label className="pending-toggle"><input type="checkbox" checked={discountPending} onChange={event => setDiscountPending(event.target.checked)} /><span><strong>Dejar descuento de producto pendiente</strong><small>La venta se suma ahora; la repartición se ajusta al liquidarla.</small></span></label><button type="submit" className="primary-button modal-submit">Guardar cobro</button></form></section></div>}
    {historyOperator && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setHistoryOperator(null); }}><section className="history-modal" role="dialog" aria-modal="true" aria-labelledby="history-title"><button className="icon-button modal-close" aria-label="Cerrar historial" onClick={() => setHistoryOperator(null)}>×</button><p className="eyebrow">REGISTRO DE PAGOS</p><h2 id="history-title">Historial · {historyOperator}</h2><p className="modal-description">Toca un monto para revisar o corregir el cobro.</p><div className="history-grid">{payroll.cuts.filter(cut => cut.operator === historyOperator).sort((a, b) => b.date.localeCompare(a.date)).map((cut, index) => <button type="button" className={`history-tile ${cut.productDeduction === null ? `history-pending ${cut.paymentMethod === 'transferencia' ? 'pending-transfer' : ''}` : cut.paymentMethod === 'transferencia' ? 'history-transfer' : ''}`} key={cut.id} aria-label={`Editar cobro ${money(cut.amount)}${cut.productDeduction === null ? ', descuento pendiente' : cut.paymentMethod === 'transferencia' ? ', transferencia' : ', efectivo'}`} onClick={() => { setEditingCut(cut); setAmount(String(cut.amount).replace('.', ',')); setPaymentMethod(cut.paymentMethod); setService(cut.service); setProductDiscount(cut.productDeduction === null ? '' : String(cut.productDeduction).replace('.', ',')); }}><span className="tile-number">{index + 1}</span><strong>{money(cut.amount)}</strong><span className="tile-status">{cut.productDeduction === null ? `Pendiente · ${cut.paymentMethod === 'transferencia' ? 'Transf.' : 'Efectivo'}` : cut.paymentMethod === 'transferencia' ? 'Transferencia' : 'Efectivo'}</span></button>)}</div>{payroll.cuts.filter(cut => cut.operator === historyOperator).length === 0 && <p className="no-history">Todavía no hay pagos registrados.</p>}</section></div>}
    {editingCut && <div className="modal-backdrop edit-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setEditingCut(null); }}><section className="charge-modal" role="dialog" aria-modal="true" aria-labelledby="edit-title"><button className="icon-button modal-close" aria-label="Cerrar edición" onClick={() => setEditingCut(null)}>×</button><p className="eyebrow">{editingCut.productDeduction === null ? 'LIQUIDAR PRODUCTO' : 'EDITAR COBRO'}</p><h2 id="edit-title">{editingCut.productDeduction === null ? 'Descontar producto' : 'Editar cobro'}</h2><form onSubmit={saveEditedCut}>{editingCut.productDeduction === null && <label className="modal-field">Servicio realizado<input autoFocus value={service} onChange={event => setService(event.target.value)} placeholder="Ej. Tinte, alisado, corte" required /></label>}<label className="modal-field">Monto del cobro en dólares<input autoFocus={editingCut.productDeduction !== null} type="text" inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value.replace(/[^\d.,]/g, ''))} required /></label><fieldset className="method-picker"><legend>Método de pago</legend><label className={paymentMethod === 'efectivo' ? 'method-option chosen' : 'method-option'}><input type="radio" name="edit-method" checked={paymentMethod === 'efectivo'} onChange={() => setPaymentMethod('efectivo')} /><span>💵</span><span><strong>Efectivo</strong><small>Entra a la caja</small></span></label><label className={paymentMethod === 'transferencia' ? 'method-option chosen' : 'method-option'}><input type="radio" name="edit-method" checked={paymentMethod === 'transferencia'} onChange={() => setPaymentMethod('transferencia')} /><span>↗</span><span><strong>Transferencia</strong><small>Pago digital</small></span></label></fieldset>{editingCut.productDeduction === null && <label className="modal-field">Valor del producto que se descuenta<input type="text" inputMode="decimal" value={productDiscount} onChange={event => setProductDiscount(event.target.value.replace(/[^\d.,]/g, ''))} placeholder="Ej. 1 o 2,50" required /><small>Se resta del cobro antes de dividir el saldo por mitades.</small></label>}<button type="submit" className="primary-button modal-submit">{editingCut.productDeduction === null ? 'Guardar descuento y liquidar' : 'Guardar cambios'}</button></form></section></div>}
  </div>;
}

export default App;
