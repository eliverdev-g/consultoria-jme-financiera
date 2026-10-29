export type UserRole = 'Administrador' | 'Gestor de Cobro' | 'Supervisor' | 'Consultor' | 'Consulta';

export type ModuleName = 
  | 'Dashboard' 
  | 'Gestión de clientes' 
  | 'Convenios de pago' 
  | 'Reportes de cartera vencida' 
  | 'Seguimiento de gestores de cobro'
  | 'Usuarios y permisos';

export interface ModulePermission {
  module: ModuleName;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  lastAccess: string;
  avatar?: string;
  permissions: ModulePermission[];
}

export interface ClientManagementLog {
  id: string;
  date: string;
  type: string;
  notes: string;
  result: string;
  user: string;
  amountNegotiated?: number;
  nextFollowUp?: string;
}

export interface Client {
  id: string;
  code: string; // e.g., CU-000125
  name: string;
  nit: string;
  phone: string;
  email: string;
  address: string;
  overdueBalance: number; // in Quetzales Q
  daysOverdue: number; // Días de mora
  status: 'En gestión' | 'Convenio vigente' | 'Demanda judicial' | 'Castigada' | 'Al día';
  segment: 'Consumo' | 'PYME' | 'Tarjeta de crédito' | 'Microcréditos' | 'Hipotecario';
  lastPaymentDate: string;
  lastPaymentAmount: number;
  assignedManager: string;
  clientSince: string;
  // Predictive metrics for automated collection
  riskScore: number; // 0 - 100
  recoveryProbability: number; // 0 - 100 (%)
  predictedDefaultRisk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  recommendedChannel: 'WhatsApp' | 'Llamada' | 'Correo' | 'Visita';
  recommendedBestHour: string;
  suggestedAction: string;
  history: ClientManagementLog[];
}

export interface Installment {
  number: number;
  dueDate: string;
  amount: number;
  status: 'Pagado' | 'Pendiente' | 'Atrasado';
  paidDate?: string;
}

export interface PaymentAgreement {
  id: string;
  code: string; // e.g. COV-2025-0012
  clientId: string;
  clientName: string;
  clientNit: string;
  totalDebt: number;
  agreedAmount: number;
  initialBalance: number;
  installmentsCount: number;
  frequency: 'Mensual' | 'Quincenal' | 'Semanal';
  startDate: string;
  nextPaymentDate: string;
  responsibleManager: string;
  amountPaid: number;
  amountPending: number;
  status: 'Activo' | 'Al día' | 'Atrasado' | 'Liquidado' | 'Incumplido';
  installments: Installment[];
  observations: string;
  createdAt: string;
  createdBy: string;
}

export interface CollectorActivity {
  id: string;
  refCode: string; // e.g. REF-10023
  date: string;
  time: string;
  collectorId: string;
  collectorName: string;
  clientId: string;
  clientName: string;
  clientCode: string;
  debtAmount: number;
  type: 'Llamada telefónica' | 'Mensaje WhatsApp' | 'Visita de campo' | 'Correo electrónico';
  result: 'Promesa de pago' | 'Contacto sin acuerdo' | 'No contesta' | 'Convenio acordado' | 'Número equivocado';
  notes: string;
  nextActionDate: string;
  nextActionTime?: string;
  nextActionNote: string;
  status: 'Completada' | 'Pendiente' | 'En seguimiento';
  amountPromised?: number;
  history: Array<{
    date: string;
    channel: string;
    summary: string;
    agent: string;
  }>;
}

export interface PredictiveAlert {
  id: string;
  clientId: string;
  clientCode: string;
  clientName: string;
  amount: number;
  daysOverdue: number;
  severity: 'Crítico' | 'Alto' | 'Medio';
  alertType: 'Riesgo de Demanda' | 'Incumplimiento Inminente' | 'Ventana Óptima de Cobro' | 'Promesa Vencida';
  title: string;
  description: string;
  predictedProbability: number; // e.g. 84% de probabilidad de impago
  suggestedAction: string;
  recommendedChannel: 'WhatsApp' | 'Llamada' | 'Correo';
  bestContactWindow: string;
  status: 'Nueva' | 'En proceso' | 'Resuelta';
  createdAt: string;
}

export interface PortfolioSegmentSummary {
  segment: 'Consumo' | 'PYME' | 'Tarjeta de crédito' | 'Microcréditos' | 'Hipotecario';
  clientsCount: number;
  totalBalance: number;
  recoveredAmount: number;
  recoveryPercentage: number;
  defaultRate: number;
}
