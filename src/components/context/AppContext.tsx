import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { studentsAPI, paymentsAPI, receiptsAPI, notificationsAPI } from '../../utils/api';

export interface Student {
  id: string;
  name: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  balance: number;
  lastPayment: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'cash' | 'ecocash' | 'bank_transfer' | 'card';
  reference?: string;
  description: string;
  date: string;
  recordedBy: string;
  receiptNumber: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface Receipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  studentName: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  issuedBy: string;
  parentEmail?: string;
}

interface AppContextType {
  students: Student[];
  payments: Payment[];
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  addPayment: (payment: Omit<Payment, 'id' | 'receiptNumber'>) => Promise<Payment>;
  updateStudentBalance: (studentId: string, newBalance: number) => Promise<void>;
  generateReceipt: (paymentId: string) => Promise<Receipt>;
  getStudentPayments: (studentId: string) => Payment[];
  getPaymentStats: () => Promise<{
    today: { amount: number; count: number };
    thisWeek: { amount: number; count: number };
    thisMonth: { amount: number; count: number };
  }>;
  sendReminder: (studentId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load students and payments from backend
      const [studentsData, paymentsData] = await Promise.all([
        studentsAPI.getAll(),
        paymentsAPI.getAll()
      ]);
      
      setStudents(studentsData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<Payment, 'id' | 'receiptNumber'>) => {
    try {
      setError(null);
      const newPayment = await paymentsAPI.create(paymentData);
      
      // Refresh data to get updated student balances
      await refreshData();
      
      return newPayment;
    } catch (err) {
      console.error('Failed to add payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add payment');
      throw err;
    }
  };

  const updateStudentBalance = async (studentId: string, newBalance: number) => {
    try {
      setError(null);
      await studentsAPI.update(studentId, { balance: newBalance });
      
      // Update local state
      setStudents(prev => prev.map(student => {
        if (student.id === studentId) {
          const status = newBalance === 0 ? 'paid' : 
                        newBalance > 0 ? 'pending' : 'pending';
          return {
            ...student,
            balance: newBalance,
            status,
            lastPayment: new Date().toISOString().split('T')[0]
          };
        }
        return student;
      }));
    } catch (err) {
      console.error('Failed to update student balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to update balance');
      throw err;
    }
  };

  const generateReceipt = async (paymentId: string) => {
    try {
      setError(null);
      const receipt = await receiptsAPI.generate(paymentId);
      setReceipts(prev => [...prev, receipt]);
      return receipt;
    } catch (err) {
      console.error('Failed to generate receipt:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
      throw err;
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      setError(null);
      await studentsAPI.create(studentData);
      await refreshData(); // Refresh to get the new student
    } catch (err) {
      console.error('Failed to add student:', err);
      setError(err instanceof Error ? err.message : 'Failed to add student');
      throw err;
    }
  };

  const getStudentPayments = (studentId: string) => {
    return payments.filter(p => p.studentId === studentId);
  };

  const getPaymentStats = async () => {
    try {
      setError(null);
      return await paymentsAPI.getStats();
    } catch (err) {
      console.error('Failed to get payment stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to get payment stats');
      
      // Fallback to local calculation
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayPayments = payments.filter(p => p.date === today && p.status === 'completed');
      const weekPayments = payments.filter(p => 
        new Date(p.date) >= weekStart && p.status === 'completed'
      );
      const monthPayments = payments.filter(p => 
        new Date(p.date) >= monthStart && p.status === 'completed'
      );

      return {
        today: {
          amount: todayPayments.reduce((sum, p) => sum + p.amount, 0),
          count: todayPayments.length
        },
        thisWeek: {
          amount: weekPayments.reduce((sum, p) => sum + p.amount, 0),
          count: weekPayments.length
        },
        thisMonth: {
          amount: monthPayments.reduce((sum, p) => sum + p.amount, 0),
          count: monthPayments.length
        }
      };
    }
  };

  const sendReminder = async (studentId: string) => {
    try {
      setError(null);
      await notificationsAPI.sendReminder(studentId);
      console.log(`Reminder sent for student ${studentId}`);
    } catch (err) {
      console.error('Failed to send reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      students,
      payments,
      receipts,
      loading,
      error,
      addPayment,
      updateStudentBalance,
      generateReceipt,
      getStudentPayments,
      getPaymentStats,
      sendReminder,
      refreshData,
      addStudent
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}