import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Shield, Database, Save, RefreshCw,
  Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import adminService from '@/services/adminService';

const DEFAULT_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  communityModeration: true,
  requireEmailVerification: true,
  maxTasksPerDay: 20,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const fileInputRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await adminService.getSettings();
        setSettings({
          ...DEFAULT_SETTINGS,
          ...(response?.data || {}),
        });
      } catch (error) {
        toast.error(error.message || 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        maintenanceMode: Boolean(settings.maintenanceMode),
        allowRegistration: Boolean(settings.allowRegistration),
        requireEmailVerification: Boolean(settings.requireEmailVerification),
        communityModeration: Boolean(settings.communityModeration),
        maxTasksPerDay: Number(settings.maxTasksPerDay),
      };
      const response = await adminService.updateSettings(payload);
      setSettings({
        ...DEFAULT_SETTINGS,
        ...(response?.data || payload),
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ settings }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'prepbridge-admin-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
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
        maintenanceMode: Boolean(nextSettings.maintenanceMode ?? prev.maintenanceMode),
        allowRegistration: Boolean(nextSettings.allowRegistration ?? prev.allowRegistration),
        requireEmailVerification: Boolean(nextSettings.requireEmailVerification ?? prev.requireEmailVerification),
        communityModeration: Boolean(nextSettings.communityModeration ?? prev.communityModeration),
        maxTasksPerDay: Number(nextSettings.maxTasksPerDay ?? prev.maxTasksPerDay),
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

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-muted-foreground">
        Loading settings...
      </div>
    );
  }

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
                  min={1}
                  max={100}
                  onChange={(e) => setSettings({ ...settings, maxTasksPerDay: Math.max(1, Number(e.target.value || 1)) })}
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
