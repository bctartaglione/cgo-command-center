"use client";

import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Download,
  Edit3,
  Filter,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Truck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Priority = "Crítica" | "Alta" | "Média" | "Baixa";
type Status =
  | "Nova"
  | "Em análise"
  | "Agendada"
  | "Em execução"
  | "Aguardando fornecedor"
  | "Bloqueada"
  | "Concluída"
  | "Cancelada";

type Demand = {
  id: string;
  title: string;
  type: string;
  branch: string;
  supplier: string;
  fleet: string;
  priority: Priority;
  status: Status;
  owner: string;
  dueDate: string;
  nextAction: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type DemandForm = Omit<Demand, "id" | "createdAt" | "updatedAt">;

const STORAGE_KEY = "cgo-command-center-demands-v1";

const statusOptions: Status[] = [
  "Nova",
  "Em análise",
  "Agendada",
  "Em execução",
  "Aguardando fornecedor",
  "Bloqueada",
  "Concluída",
  "Cancelada",
];

const priorityOptions: Priority[] = ["Crítica", "Alta", "Média", "Baixa"];

const typeOptions = [
  "Instalação de rastreador",
  "Manutenção de rastreador",
  "Instalação de isca fixa",
  "Câmera / MDVR",
  "Agendamento de técnico",
  "Acionamento de socorro",
  "Checklist / inspeção",
  "Outro",
];

const branchOptions = ["Cubatão", "Manaus", "Belém", "Várzea Paulista", "Suzano", "Outra"];

const emptyForm: DemandForm = {
  title: "",
  type: "Instalação de rastreador",
  branch: "Cubatão",
  supplier: "",
  fleet: "",
  priority: "Média",
  status: "Nova",
  owner: "",
  dueDate: "",
  nextAction: "",
  description: "",
};

const demoDemands: Demand[] = [
  {
    id: "CGO-001",
    title: "Instalar rastreador no cavalo 2458",
    type: "Instalação de rastreador",
    branch: "Cubatão",
    supplier: "3S Tecnologia",
    fleet: "2458 · ABC1D23",
    priority: "Alta",
    status: "Agendada",
    owner: "Luciene",
    dueDate: "2026-07-29",
    nextAction: "Confirmar chegada do técnico e liberar veículo",
    description: "Instalação inicial para operação com produto químico.",
    createdAt: "2026-07-24T08:30:00.000Z",
    updatedAt: "2026-07-25T17:20:00.000Z",
  },
  {
    id: "CGO-002",
    title: "Restabelecer sinal da carreta 8812",
    type: "Manutenção de rastreador",
    branch: "Manaus",
    supplier: "Onixsat",
    fleet: "8812 · QZA4H88",
    priority: "Crítica",
    status: "Aguardando fornecedor",
    owner: "Cristian",
    dueDate: "2026-07-25",
    nextAction: "Cobrar diagnóstico remoto e previsão de atendimento",
    description: "Equipamento sem comunicação há mais de sete dias.",
    createdAt: "2026-07-22T11:00:00.000Z",
    updatedAt: "2026-07-25T14:10:00.000Z",
  },
  {
    id: "CGO-003",
    title: "Revisar câmera MDVR após alerta de fadiga",
    type: "Câmera / MDVR",
    branch: "Belém",
    supplier: "TrucksControl",
    fleet: "1731 · RTH9B21",
    priority: "Alta",
    status: "Em execução",
    owner: "Talita",
    dueDate: "2026-07-28",
    nextAction: "Validar gravação e teste de eventos em campo",
    description: "Câmera apresentou perda intermitente de eventos.",
    createdAt: "2026-07-23T13:45:00.000Z",
    updatedAt: "2026-07-25T15:40:00.000Z",
  },
  {
    id: "CGO-004",
    title: "Instalar duas iscas fixas em carretas tanque",
    type: "Instalação de isca fixa",
    branch: "Várzea Paulista",
    supplier: "Monisat",
    fleet: "Carretas 9104 e 9108",
    priority: "Média",
    status: "Em análise",
    owner: "Lucimar",
    dueDate: "2026-08-02",
    nextAction: "Confirmar disponibilidade dos equipamentos",
    description: "Teste operacional por 30 dias.",
    createdAt: "2026-07-25T09:15:00.000Z",
    updatedAt: "2026-07-25T09:15:00.000Z",
  },
  {
    id: "CGO-005",
    title: "Acionamento de socorro para pane elétrica",
    type: "Acionamento de socorro",
    branch: "Suzano",
    supplier: "Prestador regional",
    fleet: "3320 · FGH6J90",
    priority: "Crítica",
    status: "Concluída",
    owner: "Cesar",
    dueDate: "2026-07-24",
    nextAction: "Anexar comprovante e registrar causa da pane",
    description: "Veículo removido para base sem impacto à carga.",
    createdAt: "2026-07-24T16:10:00.000Z",
    updatedAt: "2026-07-24T19:55:00.000Z",
  },
];

const statusClass: Record<Status, string> = {
  Nova: "status-new",
  "Em análise": "status-analysis",
  Agendada: "status-scheduled",
  "Em execução": "status-progress",
  "Aguardando fornecedor": "status-waiting",
  Bloqueada: "status-blocked",
  Concluída: "status-done",
  Cancelada: "status-cancelled",
};

const priorityClass: Record<Priority, string> = {
  Crítica: "priority-critical",
  Alta: "priority-high",
  Média: "priority-medium",
  Baixa: "priority-low",
};

function isOpen(status: Status) {
  return status !== "Concluída" && status !== "Cancelada";
}

function isOverdue(demand: Demand) {
  if (!demand.dueDate || !isOpen(demand.status)) return false;
  const endOfDueDate = new Date(`${demand.dueDate}T23:59:59`);
  return endOfDueDate.getTime() < Date.now();
}

function formatDate(value: string) {
  if (!value) return "Sem prazo";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function createDemandId(demands: Demand[]) {
  const highest = demands.reduce((max, demand) => {
    const parsed = Number(demand.id.replace(/\D/g, ""));
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);
  return `CGO-${String(highest + 1).padStart(3, "0")}`;
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function Home() {
  const [demands, setDemands] = useState<Demand[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "demands">("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [branchFilter, setBranchFilter] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DemandForm>(emptyForm);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDemands(JSON.parse(stored) as Demand[]);
      } catch {
        setDemands(demoDemands);
      }
    } else {
      setDemands(demoDemands);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demands));
  }, [demands, hydrated]);

  const stats = useMemo(() => {
    const open = demands.filter((demand) => isOpen(demand.status));
    return {
      open: open.length,
      critical: open.filter((demand) => demand.priority === "Crítica").length,
      overdue: open.filter(isOverdue).length,
      waiting: open.filter((demand) => demand.status === "Aguardando fornecedor").length,
      done: demands.filter((demand) => demand.status === "Concluída").length,
    };
  }, [demands]);

  const filteredDemands = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return [...demands]
      .filter((demand) => {
        const matchesSearch =
          !term ||
          [
            demand.id,
            demand.title,
            demand.type,
            demand.branch,
            demand.supplier,
            demand.fleet,
            demand.owner,
            demand.nextAction,
          ]
            .join(" ")
            .toLocaleLowerCase("pt-BR")
            .includes(term);
        const matchesStatus = statusFilter === "Todos" || demand.status === statusFilter;
        const matchesPriority = priorityFilter === "Todas" || demand.priority === priorityFilter;
        const matchesBranch = branchFilter === "Todas" || demand.branch === branchFilter;
        return matchesSearch && matchesStatus && matchesPriority && matchesBranch;
      })
      .sort((a, b) => {
        const priorityWeight: Record<Priority, number> = { Crítica: 4, Alta: 3, Média: 2, Baixa: 1 };
        if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [demands, search, statusFilter, priorityFilter, branchFilter]);

  const statusDistribution = useMemo(
    () =>
      statusOptions
        .map((status) => ({ status, count: demands.filter((demand) => demand.status === status).length }))
        .filter((item) => item.count > 0),
    [demands],
  );

  const branchDistribution = useMemo(() => {
    const values = Array.from(new Set(demands.map((demand) => demand.branch)));
    return values
      .map((branch) => ({ branch, count: demands.filter((demand) => demand.branch === branch).length }))
      .sort((a, b) => b.count - a.count);
  }, [demands]);

  const openNewDemand = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditDemand = (demand: Demand) => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...editable } = demand;
    setEditingId(demand.id);
    setForm(editable);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const submitDemand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const now = new Date().toISOString();
    if (editingId) {
      setDemands((current) =>
        current.map((demand) => (demand.id === editingId ? { ...demand, ...form, updatedAt: now } : demand)),
      );
    } else {
      setDemands((current) => [
        { ...form, id: createDemandId(current), createdAt: now, updatedAt: now },
        ...current,
      ]);
    }
    closeModal();
  };

  const deleteDemand = (id: string) => {
    if (window.confirm(`Excluir definitivamente a demanda ${id}?`)) {
      setDemands((current) => current.filter((demand) => demand.id !== id));
    }
  };

  const resetDemo = () => {
    if (window.confirm("Restaurar os dados de demonstração? As alterações atuais serão apagadas.")) {
      setDemands(demoDemands);
      setSearch("");
      setStatusFilter("Todos");
      setPriorityFilter("Todas");
      setBranchFilter("Todas");
    }
  };

  const exportCsv = () => {
    const headers = [
      "ID",
      "Demanda",
      "Tipo",
      "Filial",
      "Fornecedor",
      "Frota / Placa",
      "Prioridade",
      "Status",
      "Responsável",
      "Prazo",
      "Próxima ação",
      "Descrição",
      "Atualizado em",
    ];
    const rows = filteredDemands.map((demand) => [
      demand.id,
      demand.title,
      demand.type,
      demand.branch,
      demand.supplier,
      demand.fleet,
      demand.priority,
      demand.status,
      demand.owner,
      demand.dueDate,
      demand.nextAction,
      demand.description,
      demand.updatedAt,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => csvEscape(value)).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `demandas-cgo-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("Todos");
    setPriorityFilter("Todas");
    setBranchFilter("Todas");
  };

  if (!hydrated) {
    return <div className="loading-screen">Carregando CGO Command Center…</div>;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><ShieldCheck size={24} /></div>
          <div>
            <strong>CGO</strong>
            <span>Command Center</span>
          </div>
        </div>

        <nav className="nav-list">
          <button
            className={activeView === "dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => { setActiveView("dashboard"); setMobileMenuOpen(false); }}
          >
            <LayoutDashboard size={19} /> Visão geral
          </button>
          <button
            className={activeView === "demands" ? "nav-item active" : "nav-item"}
            onClick={() => { setActiveView("demands"); setMobileMenuOpen(false); }}
          >
            <Wrench size={19} /> Demandas
            <span className="nav-counter">{stats.open}</span>
          </button>
        </nav>

        <div className="sidebar-summary">
          <span>Fila crítica</span>
          <strong>{stats.critical}</strong>
          <small>{stats.overdue} demanda(s) atrasada(s)</small>
        </div>

        <div className="sidebar-footer">
          <span>Versão piloto</span>
          <small>Dados salvos neste navegador</small>
        </div>
      </aside>

      {mobileMenuOpen && <button className="sidebar-overlay" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <button className="mobile-menu" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}><Menu /></button>
            <div>
              <span>Central de Gestão Operacional</span>
              <h1>{activeView === "dashboard" ? "Visão geral" : "Gestão de demandas"}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="button button-ghost" onClick={exportCsv}><Download size={17} /> Exportar</button>
            <button className="button button-primary" onClick={openNewDemand}><Plus size={18} /> Nova demanda</button>
          </div>
        </header>

        <section className="content-area">
          <div className="notice">
            <CircleDot size={17} />
            <span><strong>Ambiente piloto:</strong> esta versão funciona sem banco de dados; as informações ficam salvas localmente no navegador.</span>
          </div>

          {activeView === "dashboard" ? (
            <>
              <section className="stat-grid">
                <StatCard label="Demandas abertas" value={stats.open} icon={<Wrench />} tone="neutral" detail="Exclui concluídas e canceladas" />
                <StatCard label="Prioridade crítica" value={stats.critical} icon={<AlertTriangle />} tone="danger" detail="Exigem atuação imediata" />
                <StatCard label="Atrasadas" value={stats.overdue} icon={<CalendarClock />} tone="warning" detail="Prazo vencido e ainda abertas" />
                <StatCard label="Aguardando fornecedor" value={stats.waiting} icon={<Clock3 />} tone="purple" detail="Dependência externa" />
                <StatCard label="Concluídas" value={stats.done} icon={<CheckCircle2 />} tone="success" detail="Histórico acumulado" />
              </section>

              <section className="dashboard-grid">
                <div className="panel panel-wide">
                  <div className="panel-header">
                    <div><span>Prioridade operacional</span><h2>Demandas que exigem atenção</h2></div>
                    <button className="text-button" onClick={() => setActiveView("demands")}>Ver todas</button>
                  </div>
                  <div className="attention-list">
                    {demands
                      .filter((demand) => isOpen(demand.status))
                      .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)))
                      .slice(0, 5)
                      .map((demand) => (
                        <button key={demand.id} className="attention-item" onClick={() => openEditDemand(demand)}>
                          <div className={`attention-marker ${priorityClass[demand.priority]}`} />
                          <div className="attention-main">
                            <div><span className="mono">{demand.id}</span><strong>{demand.title}</strong></div>
                            <small>{demand.branch} · {demand.supplier || "Fornecedor não definido"}</small>
                          </div>
                          <div className="attention-meta">
                            <span className={`badge ${statusClass[demand.status]}`}>{demand.status}</span>
                            <small className={isOverdue(demand) ? "overdue" : ""}>{isOverdue(demand) ? "Atrasada · " : ""}{formatDate(demand.dueDate)}</small>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header"><div><span>Distribuição</span><h2>Por status</h2></div><BarChart3 size={20} /></div>
                  <div className="bar-list">
                    {statusDistribution.map((item) => (
                      <div className="bar-row" key={item.status}>
                        <div><span>{item.status}</span><strong>{item.count}</strong></div>
                        <div className="bar-track"><span style={{ width: `${Math.max(8, (item.count / Math.max(1, demands.length)) * 100)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <div className="panel-header"><div><span>Volume</span><h2>Por filial</h2></div><Building2 size={20} /></div>
                  <div className="branch-list">
                    {branchDistribution.map((item, index) => (
                      <div className="branch-row" key={item.branch}>
                        <span className="rank">{String(index + 1).padStart(2, "0")}</span>
                        <span>{item.branch}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel panel-wide">
                  <div className="panel-header"><div><span>Últimas movimentações</span><h2>Atualizações recentes</h2></div><RefreshCcw size={19} /></div>
                  <div className="activity-list">
                    {[...demands]
                      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                      .slice(0, 5)
                      .map((demand) => (
                        <div className="activity-row" key={demand.id}>
                          <div className="activity-icon"><Truck size={18} /></div>
                          <div><strong>{demand.id} · {demand.title}</strong><span>{demand.nextAction || "Sem próxima ação registrada"}</span></div>
                          <small>{formatDateTime(demand.updatedAt)}</small>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <section className="demands-section">
              <div className="filter-panel">
                <div className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ID, veículo, fornecedor, responsável…" /></div>
                <FilterSelect label="Status" value={statusFilter} onChange={setStatusFilter} options={["Todos", ...statusOptions]} />
                <FilterSelect label="Prioridade" value={priorityFilter} onChange={setPriorityFilter} options={["Todas", ...priorityOptions]} />
                <FilterSelect label="Filial" value={branchFilter} onChange={setBranchFilter} options={["Todas", ...Array.from(new Set(demands.map((demand) => demand.branch)))]} />
                <button className="icon-button" title="Limpar filtros" onClick={clearFilters}><X size={18} /></button>
              </div>

              <div className="table-panel">
                <div className="table-heading">
                  <div><span>{filteredDemands.length} registro(s)</span><h2>Fila de trabalho</h2></div>
                  <button className="button button-ghost compact" onClick={resetDemo}><RefreshCcw size={16} /> Restaurar demonstração</button>
                </div>

                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Demanda</th>
                        <th>Filial / Frota</th>
                        <th>Fornecedor</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                        <th>Responsável</th>
                        <th>Prazo</th>
                        <th>Próxima ação</th>
                        <th aria-label="Ações" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDemands.map((demand) => (
                        <tr key={demand.id} className={isOverdue(demand) ? "row-overdue" : ""}>
                          <td><span className="mono">{demand.id}</span><strong className="table-title">{demand.title}</strong><small>{demand.type}</small></td>
                          <td><strong>{demand.branch}</strong><small>{demand.fleet || "Não informado"}</small></td>
                          <td>{demand.supplier || <span className="muted">Não definido</span>}</td>
                          <td><span className={`priority-pill ${priorityClass[demand.priority]}`}>{demand.priority}</span></td>
                          <td><span className={`badge ${statusClass[demand.status]}`}>{demand.status}</span></td>
                          <td><div className="owner"><span>{demand.owner ? demand.owner.slice(0, 1).toUpperCase() : "?"}</span>{demand.owner || "Não definido"}</div></td>
                          <td><span className={isOverdue(demand) ? "date overdue" : "date"}>{isOverdue(demand) && <AlertTriangle size={14} />}{formatDate(demand.dueDate)}</span></td>
                          <td><span className="next-action">{demand.nextAction || "Sem próxima ação"}</span></td>
                          <td>
                            <div className="row-actions">
                              <button title="Editar" onClick={() => openEditDemand(demand)}><Edit3 size={16} /></button>
                              <button title="Excluir" className="delete-action" onClick={() => deleteDemand(demand.id)}><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredDemands.length === 0 && (
                    <div className="empty-state"><Filter size={28} /><strong>Nenhuma demanda encontrada</strong><span>Revise os filtros ou cadastre uma nova demanda.</span></div>
                  )}
                </div>
              </div>
            </section>
          )}
        </section>
      </main>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-header">
              <div><span>{editingId ? editingId : "Novo registro"}</span><h2 id="modal-title">{editingId ? "Editar demanda" : "Cadastrar demanda"}</h2></div>
              <button className="icon-button" onClick={closeModal} aria-label="Fechar"><X /></button>
            </div>
            <form onSubmit={submitDemand}>
              <div className="form-grid">
                <label className="field field-full"><span>Título da demanda *</span><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ex.: Instalar rastreador no cavalo 2458" /></label>
                <label className="field"><span>Tipo de serviço *</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>{typeOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="field"><span>Filial *</span><select value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })}>{branchOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="field"><span>Fornecedor</span><input value={form.supplier} onChange={(event) => setForm({ ...form, supplier: event.target.value })} placeholder="Ex.: 3S Tecnologia" /></label>
                <label className="field"><span>Frota / Placa</span><input value={form.fleet} onChange={(event) => setForm({ ...form, fleet: event.target.value })} placeholder="Ex.: 2458 · ABC1D23" /></label>
                <label className="field"><span>Prioridade *</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}>{priorityOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="field"><span>Status *</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })}>{statusOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="field"><span>Responsável</span><input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Nome do responsável" /></label>
                <label className="field"><span>Prazo</span><input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} /></label>
                <label className="field field-full"><span>Próxima ação *</span><input required value={form.nextAction} onChange={(event) => setForm({ ...form, nextAction: event.target.value })} placeholder="Ação objetiva, responsável implícito e resultado esperado" /></label>
                <label className="field field-full"><span>Descrição / observação</span><textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Contexto essencial, dependências ou evidências…" /></label>
              </div>
              <div className="modal-footer"><button type="button" className="button button-ghost" onClick={closeModal}>Cancelar</button><button type="submit" className="button button-primary">{editingId ? "Salvar alterações" : "Criar demanda"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone, detail }: { label: string; value: number; icon: React.ReactNode; tone: string; detail: string }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-top"><span>{label}</span><div className="stat-icon">{icon}</div></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>
      <ChevronDown size={15} />
    </label>
  );
}
