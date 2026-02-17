import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Database, Mail, Save, RefreshCw,
  Download, Upload, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  communityModeration: true,
  autoApproveUsers: true,
  requireEmailVerification: true,
  maxTasksPerDay: 20,
  streakResetTime: '00:00',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const fileInputRef = useRef(null);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success('Settings saved successfully!');
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const nextSettings = parsed?.settings ?? parsed;

      if (!nextSettings || typeof nextSettings !== 'object') {
        throw new Error('Invalid settings format');
      }

      setSettings((prev) => ({
        ...prev,
        ...nextSettings,
      }));
      toast.success('Settings imported successfully');
    } catch (error) {
      toast.error('Failed to import settings. Please upload a valid JSON file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearCache = () => {
    toast.success('Cache cleared successfully!');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Admin Settings
        </h1>
        <p className="text-muted-foreground">Configure platform settings and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Disable access for regular users</p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Registrations</Label>
                  <p className="text-sm text-muted-foreground">Let new users sign up</p>
                </div>
                <Switch
                  checked={settings.allowRegistration}
                  onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Max Tasks Per Day</Label>
                <Input
                  type="number"
                  value={settings.maxTasksPerDay}
                  onChange={(e) => setSettings({ ...settings, maxTasksPerDay: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Streak Reset Time (UTC)</Label>
                <Input
                  type="time"
                  value={settings.streakResetTime}
                  onChange={(e) => setSettings({ ...settings, streakResetTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Authentication
              </CardTitle>
              <CardDescription>User authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Approve New Users</Label>
                  <p className="text-sm text-muted-foreground">Skip manual approval for signups</p>
                </div>
                <Switch
                  checked={settings.autoApproveUsers}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoApproveUsers: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email to access</p>
                </div>
                <Switch
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Community Moderation</Label>
                  <p className="text-sm text-muted-foreground">Enable post reporting & moderation</p>
                </div>
                <Switch
                  checked={settings.communityModeration}
                  onCheckedChange={(checked) => setSettings({ ...settings, communityModeration: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Email and push notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Send email alerts to admin</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input type="email" placeholder="admin@prepbridge.com" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Management */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Export, import, and manage data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFileChange}
                className="hidden"
              />
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={handleImportData}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
              <Separator />
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={handleClearCache}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Save Button */}
      <motion.div variants={itemVariants} className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
              </motion.div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
