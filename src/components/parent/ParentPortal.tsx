import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  User,
  DollarSign,
  Calendar,
  Download,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ParentPortalProps {
  user: any;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function ParentPortal({ user, currentView, onViewChange }: ParentPortalProps) {
  const { students, getStudentPayments } = useAppContext();
  const [selectedChild, setSelectedChild] = useState(0);

  // Find the parent's children from the students data
  const children = user.children || students.filter(student => 
    student.guardianName === user.name
  ).map(student => ({
    ...student,
    nextPaymentDue: '2024-02-15', // This would be calculated based on school calendar
    recentPayments: getStudentPayments(student.id).map(payment => ({
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      method: payment.paymentMethod === 'ecocash' ? 'EcoCash' : 
              payment.paymentMethod === 'bank_transfer' ? 'Bank Transfer' :
              payment.paymentMethod === 'card' ? 'Card' : 'Cash',
      status: payment.status,
      description: payment.description
    }))
  }));

  const child = children[selectedChild];

  if (currentView === 'payments') {
    return <PaymentForm child={child} onBack={() => onViewChange('overview')} />;
  }

  if (currentView === 'history') {
    return <PaymentHistory child={child} onBack={() => onViewChange('overview')} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl text-gray-900">Parent Portal</h1>
        <p className="text-gray-600">Welcome back, {user.name}</p>
      </div>

      {/* Child Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>{child.name}</CardTitle>
                <CardDescription>{child.class}</CardDescription>
              </div>
            </div>
            <Badge variant={child.balance > 0 ? "destructive" : "default"}>
              {child.balance > 0 ? 'Outstanding Balance' : 'Paid Up'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-900">Outstanding Balance</span>
              </div>
              <p className="text-2xl text-red-600">${child.balance}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900">Next Payment Due</span>
              </div>
              <p className="text-blue-600">{new Date(child.nextPaymentDue).toLocaleDateString()}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Last Payment</span>
              </div>
              <p className="text-green-600">${child.recentPayments[0]?.amount || 0}</p>
            </div>
          </div>

          {child.balance > 0 && (
            <Alert className="mt-4 border-amber-200 bg-amber-50">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Payment due by {new Date(child.nextPaymentDue).toLocaleDateString()}. 
                Make a payment to avoid late fees.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={() => onViewChange('payments')} 
          className="h-16 bg-green-600 hover:bg-green-700"
          disabled={child.balance <= 0}
        >
          <CreditCard className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div>Make Payment</div>
            <div className="text-sm opacity-90">Pay outstanding balance</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          onClick={() => onViewChange('history')}
          className="h-16"
        >
          <Clock className="w-6 h-6 mr-3" />
          <div className="text-left">
            <div>Payment History</div>
            <div className="text-sm text-muted-foreground">View all payments</div>
          </div>
        </Button>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Your latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {child.recentPayments.slice(0, 3).map((payment, index) => (
              <div key={payment.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${payment.amount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < child.recentPayments.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentForm({ child, onBack }: { child: any; onBack: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState('ecocash');
  const [amount, setAmount] = useState(child.balance.toString());

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div>
          <h1 className="text-2xl text-gray-900">Make Payment</h1>
          <p className="text-gray-600">Pay for {child.name}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Choose payment method and amount</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm">Amount to Pay</label>
              <div className="text-2xl text-green-600 mt-1">${amount}</div>
            </div>

            <Separator />

            <div className="space-y-3">
              <label className="text-sm">Payment Method</label>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant={paymentMethod === 'ecocash' ? 'default' : 'outline'}
                  className="justify-start h-12"
                  onClick={() => setPaymentMethod('ecocash')}
                >
                  <Smartphone className="w-5 h-5 mr-3" />
                  EcoCash Mobile Money
                </Button>
                <Button
                  variant={paymentMethod === 'bank' ? 'default' : 'outline'}
                  className="justify-start h-12"
                  onClick={() => setPaymentMethod('bank')}
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Bank Transfer
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="justify-start h-12"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  Credit/Debit Card
                </Button>
              </div>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              Proceed to Pay ${amount}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PaymentHistory({ child, onBack }: { child: any; onBack: () => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          ← Back
        </Button>
        <div>
          <h1 className="text-2xl text-gray-900">Payment History</h1>
          <p className="text-gray-600">All payments for {child.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Complete payment record for {child.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {child.recentPayments.map((payment, index) => (
              <div key={payment.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(payment.date).toLocaleDateString()} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-600">
                      {payment.status}
                    </Badge>
                    <span className="font-medium">${payment.amount}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {index < child.recentPayments.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}