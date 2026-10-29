import React, { createContext, useContext, useState } from 'react';
import { 
  Client, 
  PaymentAgreement, 
  CollectorActivity, 
  User, 
  PredictiveAlert,
  PortfolioSegmentSummary
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_AGREEMENTS, 
  INITIAL_COLLECTOR_ACTIVITIES, 
  INITIAL_USERS, 
  INITIAL_PREDICTIVE_ALERTS,
  PORTFOLIO_SEGMENTS
} from '../data/mockData';

interface DataContextType {
  clients: Client[];
  agreements: PaymentAgreement[];
  activities: CollectorActivity[];
  users: User[];
  alerts: PredictiveAlert[];
  segments: PortfolioSegmentSummary[];
  addClient: (client: Omit<Client, 'id' | 'code' | 'history' | 'riskScore' | 'recoveryProbability' | 'predictedDefaultRisk' | 'recommendedChannel' | 'recommendedBestHour' | 'suggestedAction'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addAgreement: (agreement: Omit<PaymentAgreement, 'id' | 'code' | 'createdAt' | 'amountPaid' | 'amountPending'>) => PaymentAgreement;
  addActivity: (activity: Omit<CollectorActivity, 'id' | 'refCode' | 'history'>) => CollectorActivity;
  addUser: (user: Omit<User, 'id' | 'lastAccess'>) => User;
  updateUserPermissions: (userId: string, permissions: User['permissions']) => void;
  resolveAlert: (alertId: string) => void;
  triggerPredictiveBatch: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [agreements, setAgreements] = useState<PaymentAgreement[]>(INITIAL_AGREEMENTS);
  const [activities, setActivities] = useState<CollectorActivity[]>(INITIAL_COLLECTOR_ACTIVITIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>(INITIAL_PREDICTIVE_ALERTS);
  const [segments] = useState<PortfolioSegmentSummary[]>(PORTFOLIO_SEGMENTS);

  const addClient = (clientData: any): Client => {
    const nextNum = clients.length + 125;
    const newClient: Client = {
      ...clientData,
      id: `c-${Date.now()}`,
      code: `CLI-000${nextNum}`,
      riskScore: Math.floor(Math.random() * 40) + 30,
      recoveryProbability: Math.floor(Math.random() * 40) + 50,
      predictedDefaultRisk: 'Medio',
      recommendedChannel: 'WhatsApp',
      recommendedBestHour: '10:00 AM - 12:00 PM',
      suggestedAction: 'Contacto inicial y propuesta de reestructuración',
      history: []
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addAgreement = (agreementData: any): PaymentAgreement => {
    const nextCodeNum = agreements.length + 12;
    const initialPaid = 0;
    const amountPending = agreementData.agreedAmount;

    // Generate calculated installments automatically
    const installments = [];
    const installmentAmount = +(agreementData.agreedAmount / agreementData.installmentsCount).toFixed(2);
    
    for (let i = 1; i <= agreementData.installmentsCount; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() + i);
      const dueDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
      installments.push({
        number: i,
        dueDate,
        amount: installmentAmount,
        status: 'Pendiente' as const
      });
    }

    const newAgreement: PaymentAgreement = {
      ...agreementData,
      id: `cov-${Date.now()}`,
      code: `COV-2025-00${nextCodeNum}`,
      amountPaid: initialPaid,
      amountPending: amountPending,
      status: 'Al día',
      createdAt: new Date().toLocaleDateString('es-GT') + ' ' + new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      installments
    };

    setAgreements(prev => [newAgreement, ...prev]);

    // Also update client status if matched
    if (agreementData.clientId) {
      updateClient(agreementData.clientId, { status: 'Convenio vigente' });
    }

    return newAgreement;
  };

  const addActivity = (actData: any): CollectorActivity => {
    const nextRef = 10023 + activities.length;
    const newAct: CollectorActivity = {
      ...actData,
      id: `act-${Date.now()}`,
      refCode: `REF-${nextRef}`,
      history: [
        {
          date: `${actData.date} ${actData.time}`,
          channel: actData.type,
          summary: actData.notes,
          agent: actData.collectorName
        }
      ]
    };

    setActivities(prev => [newAct, ...prev]);

    // Also append to client's history
    if (actData.clientId) {
      setClients(prev => prev.map(c => {
        if (c.id === actData.clientId || c.name === actData.clientName) {
          return {
            ...c,
            history: [
              {
                id: `h-${Date.now()}`,
                date: `${actData.date} ${actData.time}`,
                type: actData.type,
                notes: actData.notes,
                result: actData.result,
                user: actData.collectorName,
                amountNegotiated: actData.amountPromised,
                nextFollowUp: actData.nextActionDate
              },
              ...c.history
            ]
          };
        }
        return c;
      }));
    }

    return newAct;
  };

  const addUser = (userData: any): User => {
    const newUser: User = {
      ...userData,
      id: `u-${Date.now()}`,
      lastAccess: 'Nunca'
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUserPermissions = (userId: string, permissions: User['permissions']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'Resuelta' } : a));
  };

  const triggerPredictiveBatch = () => {
    // Generate fresh predictive intelligence for demonstration
    const newAlert: PredictiveAlert = {
      id: `pred-${Date.now()}`,
      clientId: 'c-1',
      clientCode: 'CLI-000125',
      clientName: 'Andrea Morales',
      amount: 18750.00,
      daysOverdue: 45,
      severity: 'Alto',
      alertType: 'Incumplimiento Inminente',
      title: 'Disparo preventivo programado para mañana 10:30 AM',
      description: 'El algoritmo predictivo calculó un incremento del 24% en efectividad de cobro si se contacta por WhatsApp antes del mediodía.',
      predictedProbability: 76,
      suggestedAction: 'Enviar recordatorio con enlace de pago bancario rápido',
      recommendedChannel: 'WhatsApp',
      bestContactWindow: '10:30 AM - 11:45 AM',
      status: 'Nueva',
      createdAt: 'Ahora mismo'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        agreements,
        activities,
        users,
        alerts,
        segments,
        addClient,
        updateClient,
        addAgreement,
        addActivity,
        addUser,
        updateUserPermissions,
        resolveAlert,
        triggerPredictiveBatch,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
