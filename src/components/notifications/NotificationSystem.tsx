import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Send,
  MessageSquare,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  Users
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface NotificationSystemProps {
  onBack?: () => void;
}

export function NotificationSystem({ onBack }: NotificationSystemProps) {
  const { students } = useAppContext();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [notificationType, setNotificationType] = useState<'sms' | 'email' | 'both'>('email');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'pending'>('overdue');
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);

  const filteredStudents = students.filter(student => {
    if (filterType === 'all') return true;
    if (filterType === 'overdue') return student.status === 'overdue';
    if (filterType === 'pending') return student.status === 'pending';
    return true;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSendReminders = () => {
    const notifications = selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        id: `notif_${Date.now()}_${studentId}`,
        studentId,
        studentName: student?.name,
        guardianName: student?.guardianName,
        guardianEmail: student?.guardianEmail,
        guardianPhone: student?.guardianPhone,
        type: notificationType,
        subject,
        message,
        status: 'sent',
        sentAt: new Date().toISOString(),
        sentBy: 'Admin'
      };
    });

    setSentNotifications(prev => [...notifications, ...prev]);
    setSelectedStudents([]);
    setMessage('');
    setSubject('');
  };

  const getDefaultMessage = () => {
    if (filterType === 'overdue') {
      return `Dear Parent/Guardian,\n\nThis is a friendly reminder that payment for ${subject || 'school fees'} is now overdue for your child. Please make the payment at your earliest convenience to avoid any inconvenience.\n\nThank you for your cooperation.\n\nRiverton Academy`;
    } else {
      return `Dear Parent/Guardian,\n\nThis is a reminder that payment for ${subject || 'school fees'} is due soon for your child. Please make the payment before the due date.\n\nThank you.\n\nRiverton Academy`;
    }
  };

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
          <h1 className="text-2xl text-gray-900">Send Reminders</h1>
          <p className="text-gray-600">Send payment reminders to parents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Students
                  </CardTitle>
                  <CardDescription>Choose students to send reminders to</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="filter">Filter:</Label>
                  <Select value={filterType} onValueChange={(value: 'all' | 'overdue' | 'pending') => setFilterType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="overdue">Overdue Only</SelectItem>
                      <SelectItem value="pending">Pending Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  id="select-all"
                  checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all">Select All ({filteredStudents.length} students)</Label>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.class}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.guardianName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{student.guardianEmail}</p>
                            <p className="text-gray-600">{student.guardianPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={student.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                            ${student.balance}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            student.status === 'overdue' ? 'destructive' :
                            student.status === 'pending' ? 'outline' : 'default'
                          }>
                            {student.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No students found with {filterType} status.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Composer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Compose Message
              </CardTitle>
              <CardDescription>Create your reminder message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notification-type">Notification Type</Label>
                <Select value={notificationType} onValueChange={(value: 'sms' | 'email' | 'both') => setNotificationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Only
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        SMS Only
                      </div>
                    </SelectItem>
                    <SelectItem value="both">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Email & SMS
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(notificationType === 'email' || notificationType === 'both') && (
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Payment Reminder"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder={getDefaultMessage()}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                />
              </div>

              <Button
                onClick={() => setMessage(getDefaultMessage())}
                variant="outline"
                className="w-full"
              >
                Use Default Template
              </Button>

              <Button
                onClick={handleSendReminders}
                disabled={selectedStudents.length === 0 || !message}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to {selectedStudents.length} Recipients
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sent Notifications */}
      {sentNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Recently sent payment reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentNotifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{notification.studentName}</p>
                      <p className="text-sm text-gray-600">
                        Sent to {notification.guardianName} via {notification.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {notification.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}