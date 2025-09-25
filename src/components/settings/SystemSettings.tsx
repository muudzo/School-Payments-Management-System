import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Settings,
  School,
  Bell,
  Mail,
  DollarSign,
  Shield,
  Download,
  Upload,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SystemSettingsProps {
  onBack?: () => void;
}

export function SystemSettings({ onBack }: SystemSettingsProps) {
  const [settings, setSettings] = useState({
    school: {
      name: 'Riverton Academy',
      address: '123 Education Street, Harare, Zimbabwe',
      phone: '+263 4 123 4567',
      email: 'admin@rivertonacademy.co.zw',
      website: 'www.rivertonacademy.co.zw',
      logo: null as File | null
    },
    notifications: {
      emailReminders: true,
      smsReminders: true,
      paymentConfirmations: true,
      overdueNotifications: true,
      reminderDays: 3,
      escalationDays: 7
    },
    payments: {
      currency: 'USD',
      lateFeeEnabled: true,
      lateFeeAmount: 10,
      lateFeeType: 'fixed' as 'fixed' | 'percentage',
      gracePeriodDays: 7,
      acceptedMethods: {
        cash: true,
        ecocash: true,
        bankTransfer: true,
        card: true
      }
    },
    system: {
      schoolYear: '2024',
      term: 'Term 1',
      backupEnabled: true,
      maintenanceMode: false,
      userSessionTimeout: 30
    }
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSettingChange = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedSettingChange = (category: string, subCategory: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [subCategory]: {
          ...(prev[category as keyof typeof prev] as any)[subCategory],
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      exportedBy: 'Admin'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riverton-academy-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              ← Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl text-gray-900">System Settings</h1>
            <p className="text-gray-600">Configure your payment management system</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Settings
          </Button>
          <Button 
            onClick={handleSaveSettings}
            disabled={saveStatus === 'saving'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveStatus === 'saving' ? (
              <>Saving...</>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {saveStatus === 'saved' && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Settings saved successfully!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="school" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="school">School Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* School Information */}
        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                School Information
              </CardTitle>
              <CardDescription>Basic information about your school</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school-name">School Name</Label>
                  <Input
                    id="school-name"
                    value={settings.school.name}
                    onChange={(e) => handleSettingChange('school', 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="school-phone">Phone Number</Label>
                  <Input
                    id="school-phone"
                    value={settings.school.phone}
                    onChange={(e) => handleSettingChange('school', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="school-email">Email Address</Label>
                  <Input
                    id="school-email"
                    type="email"
                    value={settings.school.email}
                    onChange={(e) => handleSettingChange('school', 'email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="school-website">Website</Label>
                  <Input
                    id="school-website"
                    value={settings.school.website}
                    onChange={(e) => handleSettingChange('school', 'website', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="school-address">Address</Label>
                <Textarea
                  id="school-address"
                  value={settings.school.address}
                  onChange={(e) => handleSettingChange('school', 'address', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="school-logo">School Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="school-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSettingChange('school', 'logo', e.target.files?.[0] || null)}
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure automatic notifications and reminders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Reminders</Label>
                    <p className="text-sm text-gray-600">Send payment reminders via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'emailReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Reminders</Label>
                    <p className="text-sm text-gray-600">Send payment reminders via SMS</p>
                  </div>
                  <Switch
                    checked={settings.notifications.smsReminders}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'smsReminders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-gray-600">Send confirmations when payments are received</p>
                  </div>
                  <Switch
                    checked={settings.notifications.paymentConfirmations}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'paymentConfirmations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Overdue Notifications</Label>
                    <p className="text-sm text-gray-600">Send notifications for overdue payments</p>
                  </div>
                  <Switch
                    checked={settings.notifications.overdueNotifications}
                    onCheckedChange={(checked) => handleSettingChange('notifications', 'overdueNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reminder-days">Reminder Days Before Due Date</Label>
                  <Input
                    id="reminder-days"
                    type="number"
                    value={settings.notifications.reminderDays}
                    onChange={(e) => handleSettingChange('notifications', 'reminderDays', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="escalation-days">Escalation Days After Due Date</Label>
                  <Input
                    id="escalation-days"
                    type="number"
                    value={settings.notifications.escalationDays}
                    onChange={(e) => handleSettingChange('notifications', 'escalationDays', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Configuration
              </CardTitle>
              <CardDescription>Configure payment methods and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.payments.currency} onValueChange={(value) => handleSettingChange('payments', 'currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="ZWL">Zimbabwe Dollar (ZWL)</SelectItem>
                      <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="grace-period">Grace Period (Days)</Label>
                  <Input
                    id="grace-period"
                    type="number"
                    value={settings.payments.gracePeriodDays}
                    onChange={(e) => handleSettingChange('payments', 'gracePeriodDays', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Late Fee Enabled</Label>
                    <p className="text-sm text-gray-600">Charge late fees for overdue payments</p>
                  </div>
                  <Switch
                    checked={settings.payments.lateFeeEnabled}
                    onCheckedChange={(checked) => handleSettingChange('payments', 'lateFeeEnabled', checked)}
                  />
                </div>

                {settings.payments.lateFeeEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="late-fee-type">Late Fee Type</Label>
                      <Select 
                        value={settings.payments.lateFeeType} 
                        onValueChange={(value: 'fixed' | 'percentage') => handleSettingChange('payments', 'lateFeeType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Amount</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="late-fee-amount">
                        Late Fee {settings.payments.lateFeeType === 'percentage' ? '(%)' : '($)'}
                      </Label>
                      <Input
                        id="late-fee-amount"
                        type="number"
                        value={settings.payments.lateFeeAmount}
                        onChange={(e) => handleSettingChange('payments', 'lateFeeAmount', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <Label>Accepted Payment Methods</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center justify-between">
                    <Label>Cash</Label>
                    <Switch
                      checked={settings.payments.acceptedMethods.cash}
                      onCheckedChange={(checked) => handleNestedSettingChange('payments', 'acceptedMethods', 'cash', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>EcoCash</Label>
                    <Switch
                      checked={settings.payments.acceptedMethods.ecocash}
                      onCheckedChange={(checked) => handleNestedSettingChange('payments', 'acceptedMethods', 'ecocash', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bank Transfer</Label>
                    <Switch
                      checked={settings.payments.acceptedMethods.bankTransfer}
                      onCheckedChange={(checked) => handleNestedSettingChange('payments', 'acceptedMethods', 'bankTransfer', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Credit/Debit Card</Label>
                    <Switch
                      checked={settings.payments.acceptedMethods.card}
                      onCheckedChange={(checked) => handleNestedSettingChange('payments', 'acceptedMethods', 'card', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>General system settings and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school-year">School Year</Label>
                  <Input
                    id="school-year"
                    value={settings.system.schoolYear}
                    onChange={(e) => handleSettingChange('system', 'schoolYear', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="term">Current Term</Label>
                  <Select value={settings.system.term} onValueChange={(value) => handleSettingChange('system', 'term', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Term 1">Term 1</SelectItem>
                      <SelectItem value="Term 2">Term 2</SelectItem>
                      <SelectItem value="Term 3">Term 3</SelectItem>
                      <SelectItem value="Term 4">Term 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="session-timeout">User Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.system.userSessionTimeout}
                  onChange={(e) => handleSettingChange('system', 'userSessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Backup</Label>
                    <p className="text-sm text-gray-600">Enable automatic daily backups</p>
                  </div>
                  <Switch
                    checked={settings.system.backupEnabled}
                    onCheckedChange={(checked) => handleSettingChange('system', 'backupEnabled', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">Put system in maintenance mode</p>
                  </div>
                  <Switch
                    checked={settings.system.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('system', 'maintenanceMode', checked)}
                  />
                </div>
              </div>

              {settings.system.maintenanceMode && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Maintenance mode is enabled. Only administrators can access the system.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}