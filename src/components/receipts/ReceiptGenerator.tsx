import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Search,
  FileText,
  Download,
  Send,
  Printer,
  CheckCircle,
  Calendar,
  DollarSign,
  User,
  GraduationCap
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ReceiptGeneratorProps {
  onBack?: () => void;
}

export function ReceiptGenerator({ onBack }: ReceiptGeneratorProps) {
  const { payments, students, receipts, generateReceipt, loading, error } = useAppContext();
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedReceipt, setGeneratedReceipt] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredPayments = payments?.filter(payment =>
    payment && payment.studentName && payment.receiptNumber &&
    (payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleGenerateReceipt = async () => {
    if (selectedPayment) {
      setIsGenerating(true);
      try {
        const receipt = await generateReceipt(selectedPayment);
        setGeneratedReceipt(receipt);
      } catch (err) {
        console.error('Failed to generate receipt:', err);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleDownloadReceipt = () => {
    if (generatedReceipt) {
      // Create receipt content
      const receiptContent = generateReceiptHTML(generatedReceipt);
      
      // Create blob and download
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt_${generatedReceipt.receiptNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleEmailReceipt = () => {
    if (generatedReceipt) {
      // In a real app, this would integrate with an email service
      alert(`Receipt ${generatedReceipt.receiptNumber} would be emailed to ${generatedReceipt.parentEmail}`);
    }
  };

  const generateReceiptHTML = (receipt: any) => {
    const payment = payments?.find(p => p && p.id === receipt.paymentId);
    const student = students?.find(s => s && s.name === receipt.studentName);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Payment Receipt</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .school-name { font-size: 28px; font-weight: bold; margin: 10px 0; }
        .receipt-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .amount { font-size: 32px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e2e8f0; }
        th { background: #f1f5f9; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">🎓</div>
        <div class="school-name">Riverton Academy</div>
        <div>Payment Management System</div>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <h2>PAYMENT RECEIPT</h2>
        <div style="font-size: 18px; color: #64748b;">Receipt #${receipt.receiptNumber}</div>
    </div>
    
    <div class="receipt-details">
        <table>
            <tr><th>Student Name:</th><td>${receipt.studentName}</td></tr>
            <tr><th>Class:</th><td>${student?.class || 'N/A'}</td></tr>
            <tr><th>Guardian:</th><td>${student?.guardianName || 'N/A'}</td></tr>
            <tr><th>Payment Date:</th><td>${new Date(receipt.date).toLocaleDateString()}</td></tr>
            <tr><th>Description:</th><td>${receipt.description}</td></tr>
            <tr><th>Payment Method:</th><td>${formatPaymentMethod(receipt.paymentMethod)}</td></tr>
            ${payment?.reference ? `<tr><th>Reference:</th><td>${payment.reference}</td></tr>` : ''}
            <tr><th>Issued By:</th><td>${receipt.issuedBy}</td></tr>
        </table>
    </div>
    
    <div class="amount">
        Amount Paid: $${receipt.amount.toLocaleString()}
    </div>
    
    <div style="text-align: center; background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <div style="color: #166534; font-weight: bold;">✓ PAYMENT CONFIRMED</div>
        <div style="color: #15803d; margin-top: 5px;">This receipt serves as proof of payment</div>
    </div>
    
    <div class="footer">
        <div>Riverton Academy</div>
        <div>Payment Management System</div>
        <div>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
    </div>
</body>
</html>`;
  };

  const formatPaymentMethod = (method: string) => {
    const methods = {
      cash: 'Cash',
      ecocash: 'EcoCash',
      bank_transfer: 'Bank Transfer',
      card: 'Credit/Debit Card'
    };
    return methods[method as keyof typeof methods] || method;
  };

  if (generatedReceipt) {
    return <ReceiptPreview receipt={generatedReceipt} onDownload={handleDownloadReceipt} onEmail={handleEmailReceipt} onBack={() => setGeneratedReceipt(null)} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl text-gray-900">Receipt Management</h1>
            <p className="text-gray-600">Loading payment data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl text-gray-900">Receipt Management</h1>
            <p className="text-gray-600">Error loading data</p>
          </div>
        </div>
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
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
          <h1 className="text-2xl text-gray-900">Receipt Management</h1>
          <p className="text-gray-600">Generate and manage payment receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generate New Receipt
            </CardTitle>
            <CardDescription>Select a payment to generate receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search">Search Payments</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by student name or receipt number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="payment">Select Payment</Label>
              <Select value={selectedPayment} onValueChange={setSelectedPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a payment..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPayments?.filter(payment => payment && payment.id).map((payment) => (
                    <SelectItem key={payment.id} value={payment.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span>{payment.studentName}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ${payment.amount} • {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleGenerateReceipt}
              disabled={!selectedPayment || isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Receipt
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>Recently generated receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {receipts?.filter(receipt => receipt && receipt.id).slice(-5).reverse().map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{receipt.receiptNumber}</p>
                      <p className="text-sm text-gray-600">{receipt.studentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">${receipt.amount}</span>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!receipts || receipts.length === 0) && (
                <p className="text-center text-gray-500 py-4">No receipts generated yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>Complete list of payments that can generate receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments?.filter(payment => payment && payment.id).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.receiptNumber}</TableCell>
                    <TableCell>{payment.studentName}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatPaymentMethod(payment.paymentMethod)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPayment(payment.id);
                            handleGenerateReceipt();
                          }}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReceiptPreview({ receipt, onDownload, onEmail, onBack }: { 
  receipt: any; 
  onDownload: () => void; 
  onEmail: () => void; 
  onBack: () => void; 
}) {
  const { payments, students } = useAppContext();
  const payment = payments?.find(p => p && p.id === receipt.paymentId);
  const student = students?.find(s => s && s.name === receipt.studentName);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl text-gray-900">Receipt Preview</h1>
            <p className="text-gray-600">Receipt #{receipt.receiptNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button onClick={onEmail} variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Email to Parent
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Receipt Preview */}
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl text-blue-900 mb-2">Riverton Academy</h1>
              <p className="text-blue-700">Payment Management System</p>
            </div>

            {/* Receipt Title */}
            <div className="text-center mb-8">
              <h2 className="text-xl mb-2">PAYMENT RECEIPT</h2>
              <p className="text-lg text-gray-600">Receipt #{receipt.receiptNumber}</p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student Name</Label>
                  <p className="font-medium">{receipt.studentName}</p>
                </div>
                <div>
                  <Label>Class</Label>
                  <p className="font-medium">{student?.class || 'N/A'}</p>
                </div>
                <div>
                  <Label>Guardian</Label>
                  <p className="font-medium">{student?.guardianName || 'N/A'}</p>
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <p className="font-medium">{new Date(receipt.date).toLocaleDateString()}</p>
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="font-medium">{receipt.description}</p>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <p className="font-medium">{receipt.paymentMethod.replace('_', ' ').toUpperCase()}</p>
                </div>
                {payment?.reference && (
                  <div>
                    <Label>Reference</Label>
                    <p className="font-medium">{payment.reference}</p>
                  </div>
                )}
                <div>
                  <Label>Issued By</Label>
                  <p className="font-medium">{receipt.issuedBy}</p>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-3xl text-green-600 mb-2">
                Amount Paid: ${receipt.amount.toLocaleString()}
              </p>
            </div>

            {/* Confirmation */}
            <Alert className="bg-green-50 border-green-200 mb-6">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>PAYMENT CONFIRMED</strong> - This receipt serves as proof of payment
              </AlertDescription>
            </Alert>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>Riverton Academy Payment Management System</p>
              <p>Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}