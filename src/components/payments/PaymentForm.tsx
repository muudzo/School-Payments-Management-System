import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  DollarSign,
  User,
  Calendar,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  CheckCircle,
  FileText,
  Send
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface PaymentFormProps {
  onBack?: () => void;
}

export function PaymentForm({ onBack }: PaymentFormProps) {
  const { students, addPayment, generateReceipt } = useAppContext();
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentMethod: '',
    reference: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPayment, setGeneratedPayment] = useState<any>(null);

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: Banknote, description: 'Physical cash payment' },
    { id: 'ecocash', label: 'EcoCash', icon: Smartphone, description: 'Mobile money transfer' },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, description: 'Direct bank transfer' },
    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, description: 'Card payment' }
  ];

  const selectedStudent = students.find(s => s.id === formData.studentId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedStudent = students.find(s => s.id === formData.studentId);
    if (!selectedStudent) return;

    // Add payment to the system
    const payment = addPayment({
      studentId: formData.studentId,
      studentName: selectedStudent.name,
      amount: parseFloat(formData.amount),
      paymentMethod: formData.paymentMethod as any,
      reference: formData.reference || undefined,
      description: formData.description,
      date: formData.date,
      recordedBy: 'Admin', // In real app, this would be the current user
      status: 'completed'
    });

    // Generate receipt immediately
    const receipt = generateReceipt(payment.id);
    setGeneratedPayment({ payment, receipt });
    setShowSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setGeneratedPayment(null);
      setFormData({
        studentId: '',
        amount: '',
        paymentMethod: '',
        reference: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }, 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (showSuccess) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <Card className="border-green-200">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl text-green-900 mb-2">Payment Recorded Successfully!</h2>
              <p className="text-green-700 mb-6">
                Payment of ${formData.amount} has been recorded for {selectedStudent?.name}
                {generatedPayment && (
                  <><br />Receipt #{generatedPayment.receipt.receiptNumber} has been generated</>
                )}
              </p>
              
              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Receipt
                </Button>
                <Button variant="outline" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Send to Parent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl text-gray-900">Record Payment</h1>
          <p className="text-gray-600">Add a new payment to the system</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
              <CardDescription>Select the student for this payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="student">Select Student</Label>
                <Select value={formData.studentId} onValueChange={(value) => handleInputChange('studentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{student.name} - {student.class}</span>
                          <span className="text-red-600 ml-4">Balance: ${student.balance}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <Alert className="bg-blue-50 border-blue-200">
                  <User className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Current outstanding balance for {selectedStudent.name}: ${selectedStudent.balance}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Enter payment amount and details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="date">Payment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., School Fees - February 2024"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Select how the payment was received</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <Button
                      key={method.id}
                      type="button"
                      variant={formData.paymentMethod === method.id ? 'default' : 'outline'}
                      className="h-16 justify-start"
                      onClick={() => handleInputChange('paymentMethod', method.id)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div>{method.label}</div>
                        <div className="text-xs opacity-70">{method.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>

              {formData.paymentMethod && formData.paymentMethod !== 'cash' && (
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Enter transaction reference"
                    value={formData.reference}
                    onChange={(e) => handleInputChange('reference', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!formData.studentId || !formData.amount || !formData.paymentMethod}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}