import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Plus,
  FileText,
  Send,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

export function AdminDashboard({ onViewChange }: AdminDashboardProps) {
  const { students, getPaymentStats, loading, error, refreshData } = useAppContext();
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const paymentStats = await getPaymentStats();
      setStats(paymentStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshData(), loadStats()]);
  };
  
  const outstandingBalances = students
    .filter(student => {
      // Ensure balance fallback to 0 if null/undefined
      const balance = student && typeof student.balance === 'number' ? student.balance : 0;
      return balance > 0;
    })
    .slice(0, 4)
    .map(student => ({
      student: student.name,
      class: student.class,
      amount: typeof student.balance === 'number' ? student.balance : 0,
      overdue: student.status === 'overdue'
    }));

  const weeklyData = [
    { day: 'Mon', amount: 8500 },
    { day: 'Tue', amount: 12300 },
    { day: 'Wed', amount: 9800 },
    { day: 'Thu', amount: 15600 },
    { day: 'Fri', amount: 11200 },
    { day: 'Sat', amount: 6800 },
    { day: 'Sun', amount: 4200 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Payment overview and quick actions</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => onViewChange('payments')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Payment
          </Button>
          <Button variant="outline" onClick={() => onViewChange('receipts')}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Receipt
          </Button>
          <Button variant="outline" onClick={() => onViewChange('notifications')}>
            <Send className="w-4 h-4 mr-2" />
            Send Reminder
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Today's Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl text-green-600">${stats?.today?.amount?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                `${stats?.today?.count || 0} payments received`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl text-blue-600">${stats?.thisWeek?.amount?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                `${stats?.thisWeek?.count || 0} payments received`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <div className="text-2xl text-purple-600">${stats?.thisMonth?.amount?.toLocaleString() || '0'}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {statsLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                `${stats?.thisMonth?.count || 0} payments received`
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Payment Trends</CardTitle>
            <CardDescription>Daily payment collections this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#2563eb" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balances */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Outstanding Balances</CardTitle>
              <CardDescription>Students with pending payments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onViewChange('students')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {outstandingBalances.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{student.student}</p>
                      <p className="text-sm text-gray-600">{student.class}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${student.amount}</span>
                    {student.overdue && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}