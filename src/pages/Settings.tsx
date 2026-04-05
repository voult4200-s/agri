import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Wheat, Shield, Bell, CreditCard, Settings as SettingsIcon, Info,
  Loader2, Save, Camera, LogOut, Trash2, Eye, EyeOff, Lock,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
interface Profile {
  avatar_url: string;
  full_name: string;
  mobile_number: string;
  date_of_birth: string;
  gender: string;
  language_preference: string;
  state: string;
  district: string;
  village: string;
  pin_code: string;
  farm_size: number | null;
  farm_size_unit: string;
  soil_type: string;
  ph_level: number | null;
  irrigation_type: string;
  primary_crops: string[];
  bank_account_name: string;
  bank_name: string;
  account_number_last4: string;
  ifsc_code: string;
  upi_id: string;
  gstin: string;
  business_name: string;
  theme_preference: string;
  font_size: string;
  high_contrast: boolean;
  notify_weather: boolean;
  notify_price: boolean;
  notify_orders: boolean;
  notify_storage: boolean;
  notify_community: boolean;
  notify_marketing: boolean;
  notify_email_weekly: boolean;
  notify_email_orders: boolean;
  notify_sms_critical: boolean;
  notify_whatsapp: boolean;
}

const defaultProfile: Profile = {
  avatar_url: "",
  full_name: "", mobile_number: "", date_of_birth: "", gender: "", language_preference: "English",
  state: "", district: "", village: "", pin_code: "",
  farm_size: null, farm_size_unit: "Acres", soil_type: "", ph_level: null, irrigation_type: "", primary_crops: [],
  bank_account_name: "", bank_name: "", account_number_last4: "", ifsc_code: "", upi_id: "", gstin: "", business_name: "",
  theme_preference: "light", font_size: "normal", high_contrast: false,
  notify_weather: true, notify_price: true, notify_orders: true, notify_storage: true,
  notify_community: true, notify_marketing: false, notify_email_weekly: true, notify_email_orders: true,
  notify_sms_critical: true, notify_whatsapp: false,
};

const languagePreferenceOptions = [
  { value: "English", code: "en", labelKey: "language.english" },
  { value: "Hindi", code: "hi", labelKey: "language.hindi" },
  { value: "Bengali", code: "bn", labelKey: "language.bengali" },
] as const;

const languageNameToCode: Record<string, string> = {
  English: "en",
  Hindi: "hi",
  Bengali: "bn",
  বাংলা: "bn",
};

const languageCodeToName: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
};

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, signOut, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile({
          ...defaultProfile,
          ...Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== null)),
          date_of_birth: data.date_of_birth || "",
          primary_crops: data.primary_crops || [],
        });

        const preferredLanguage = languageNameToCode[data.language_preference || ""] || "en";
        void i18n.changeLanguage(preferredLanguage);

        const normalizedLanguageName = languageCodeToName[preferredLanguage] || "English";
        setProfile((prev) => ({ ...prev, language_preference: normalizedLanguageName }));
      }
      setLoading(false);
    })();
  }, [i18n, user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      avatar_url: profile.avatar_url || null,
      mobile_number: profile.mobile_number,
      date_of_birth: profile.date_of_birth || null,
      gender: profile.gender,
      language_preference: profile.language_preference,
      state: profile.state,
      district: profile.district,
      village: profile.village,
      pin_code: profile.pin_code,
      farm_size: profile.farm_size,
      farm_size_unit: profile.farm_size_unit,
      soil_type: profile.soil_type,
      ph_level: profile.ph_level,
      irrigation_type: profile.irrigation_type,
      primary_crops: profile.primary_crops,
      bank_account_name: profile.bank_account_name,
      bank_name: profile.bank_name,
      account_number_last4: profile.account_number_last4,
      ifsc_code: profile.ifsc_code,
      upi_id: profile.upi_id,
      gstin: profile.gstin,
      business_name: profile.business_name,
      theme_preference: profile.theme_preference,
      font_size: profile.font_size,
      high_contrast: profile.high_contrast,
      notify_weather: profile.notify_weather,
      notify_price: profile.notify_price,
      notify_orders: profile.notify_orders,
      notify_storage: profile.notify_storage,
      notify_community: profile.notify_community,
      notify_marketing: profile.notify_marketing,
      notify_email_weekly: profile.notify_email_weekly,
      notify_email_orders: profile.notify_email_orders,
      notify_sms_critical: profile.notify_sms_critical,
      notify_whatsapp: profile.notify_whatsapp,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      await refreshUserProfile();
      toast({ title: "Profile saved!" });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload JPG, PNG, or WEBP image.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max avatar size is 5MB.", variant: "destructive" });
      return;
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
    const bucketName = "profile-photos";

    setUploadingAvatar(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        const bucketMissing = /bucket.*not found/i.test(uploadError.message || "");
        if (!bucketMissing) {
          throw uploadError;
        }

        // Local fallback: save image directly as data URL when storage bucket is unavailable.
        const dataUrl = await fileToDataUrl(file);
        const { error: fallbackError } = await supabase
          .from("profiles")
          .update({ avatar_url: dataUrl })
          .eq("user_id", user.id);

        if (fallbackError) {
          throw fallbackError;
        }

        setProfile((prev) => ({ ...prev, avatar_url: dataUrl }));
        await refreshUserProfile();
        toast({ title: "Photo saved", description: "Bucket missing, so image was saved directly in profile." });
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (profileError) {
        throw profileError;
      }

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      await refreshUserProfile();
      toast({ title: "Profile photo updated!" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Could not upload profile photo.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }
  };

  const update = (key: keyof Profile, value: any) => setProfile((p) => ({ ...p, [key]: value }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">{t("settings.title")}</h1>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-1 h-auto p-1">
          <TabsTrigger value="profile" className="text-xs gap-1"><User className="w-3 h-3" /> Profile</TabsTrigger>
          <TabsTrigger value="farm" className="text-xs gap-1"><Wheat className="w-3 h-3" /> Farm</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Shield className="w-3 h-3" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="w-3 h-3" /> Alerts</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1"><CreditCard className="w-3 h-3" /> Payments</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs gap-1"><SettingsIcon className="w-3 h-3" /> Prefs</TabsTrigger>
          <TabsTrigger value="about" className="text-xs gap-1"><Info className="w-3 h-3" /> About</TabsTrigger>
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-heading text-xl font-bold">
                      {profile.full_name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">{profile.full_name || "Your Name"}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      {uploadingAvatar ? "Uploading..." : "Upload / Change Photo"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={profile.full_name} onChange={(e) => update("full_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input value={profile.mobile_number} onChange={(e) => update("mobile_number", e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={profile.date_of_birth} onChange={(e) => update("date_of_birth", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.gender} onChange={(e) => update("gender", e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.language")}</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={profile.language_preference}
                    onChange={(e) => {
                      const selectedLanguage = e.target.value;
                      update("language_preference", selectedLanguage);
                      void i18n.changeLanguage(languageNameToCode[selectedLanguage] || "en");
                    }}
                  >
                    {languagePreferenceOptions.map((language) => (
                      <option key={language.code} value={language.value}>
                        {t(language.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FARM TAB */}
        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle>Farm Information</CardTitle>
              <CardDescription>Details about your farm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>State</Label><Input value={profile.state} onChange={(e) => update("state", e.target.value)} /></div>
                <div className="space-y-2"><Label>District</Label><Input value={profile.district} onChange={(e) => update("district", e.target.value)} /></div>
                <div className="space-y-2"><Label>Village/Town</Label><Input value={profile.village} onChange={(e) => update("village", e.target.value)} /></div>
                <div className="space-y-2"><Label>PIN Code</Label><Input value={profile.pin_code} onChange={(e) => update("pin_code", e.target.value)} /></div>
                <div className="space-y-2"><Label>Farm Size</Label><Input type="number" value={profile.farm_size ?? ""} onChange={(e) => update("farm_size", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.farm_size_unit} onChange={(e) => update("farm_size_unit", e.target.value)}>
                    <option>Acres</option>
                    <option>Hectares</option>
                    <option>Bigha</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Soil Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.soil_type} onChange={(e) => update("soil_type", e.target.value)}>
                    <option value="">Select</option>
                    <option>Loamy</option>
                    <option>Clay</option>
                    <option>Sandy</option>
                    <option>Silt</option>
                    <option>Red</option>
                    <option>Black</option>
                  </select>
                </div>
                <div className="space-y-2"><Label>pH Level</Label><Input type="number" step="0.1" value={profile.ph_level ?? ""} onChange={(e) => update("ph_level", e.target.value ? Number(e.target.value) : null)} /></div>
                <div className="space-y-2">
                  <Label>Irrigation Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.irrigation_type} onChange={(e) => update("irrigation_type", e.target.value)}>
                    <option value="">Select</option>
                    <option>Drip</option>
                    <option>Sprinkler</option>
                    <option>Flood</option>
                    <option>Rain-fed</option>
                  </select>
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Farm Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showNewPassword ? "text" : "password"} className="pl-10 pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button onClick={handlePasswordChange} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what alerts you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3">Push Notifications</h3>
                <div className="space-y-3">
                  {([
                    ["notify_weather", "Weather Alerts"],
                    ["notify_price", "Price Alerts"],
                    ["notify_orders", "Order Updates"],
                    ["notify_storage", "Storage Alerts"],
                    ["notify_community", "Community Posts"],
                    ["notify_marketing", "Marketing Updates"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label>{label}</Label>
                      <Switch checked={profile[key]} onCheckedChange={(v) => update(key, v)} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  {([
                    ["notify_email_weekly", "Weekly Summary"],
                    ["notify_email_orders", "Order Confirmations"],
                  ] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label>{label}</Label>
                      <Switch checked={profile[key]} onCheckedChange={(v) => update(key, v)} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-3">SMS & WhatsApp</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Critical SMS Alerts</Label>
                    <Switch checked={profile.notify_sms_critical} onCheckedChange={(v) => update("notify_sms_critical", v)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>WhatsApp Updates</Label>
                    <Switch checked={profile.notify_whatsapp} onCheckedChange={(v) => update("notify_whatsapp", v)} />
                  </div>
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Bank account and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Account Holder Name</Label><Input value={profile.bank_account_name} onChange={(e) => update("bank_account_name", e.target.value)} /></div>
                <div className="space-y-2"><Label>Bank Name</Label><Input value={profile.bank_name} onChange={(e) => update("bank_name", e.target.value)} /></div>
                <div className="space-y-2"><Label>Account Number (last 4)</Label><Input value={profile.account_number_last4} onChange={(e) => update("account_number_last4", e.target.value.slice(0, 4))} maxLength={4} /></div>
                <div className="space-y-2"><Label>IFSC Code</Label><Input value={profile.ifsc_code} onChange={(e) => update("ifsc_code", e.target.value.toUpperCase())} /></div>
                <div className="space-y-2"><Label>UPI ID</Label><Input value={profile.upi_id} onChange={(e) => update("upi_id", e.target.value)} placeholder="yourname@paytm" /></div>
              </div>
              <div className="border-t border-border pt-5 mt-5">
                <h3 className="font-heading font-semibold text-foreground mb-3">GST Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>GSTIN</Label><Input value={profile.gstin} onChange={(e) => update("gstin", e.target.value.toUpperCase())} /></div>
                  <div className="space-y-2"><Label>Business Name</Label><Input value={profile.business_name} onChange={(e) => update("business_name", e.target.value)} /></div>
                </div>
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Payment Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.theme_preference} onChange={(e) => update("theme_preference", e.target.value)}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={profile.font_size} onChange={(e) => update("font_size", e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="large">Large</option>
                    <option value="extra-large">Extra Large</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between max-w-md">
                <Label>High Contrast Mode</Label>
                <Switch checked={profile.high_contrast} onCheckedChange={(v) => update("high_contrast", v)} />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT TAB */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About KrishiGrowAI</CardTitle>
              <CardDescription>Version 1.0.0 • Build 2025.02.10</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-muted-foreground">Smart Farming Solutions for Modern Farmers</p>
              <div className="space-y-2 text-sm">
                <p>📖 <a href="#" className="text-primary hover:underline">Help & Support</a></p>
                <p>📄 <a href="#" className="text-primary hover:underline">Terms & Conditions</a></p>
                <p>🔒 <a href="#" className="text-primary hover:underline">Privacy Policy</a></p>
                <p>📞 <a href="#" className="text-primary hover:underline">Contact Us</a></p>
              </div>
              <div className="border-t border-border pt-5 mt-5">
                <h3 className="font-heading font-semibold text-destructive mb-2">Danger Zone</h3>
                <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-muted-foreground hover:text-foreground" onClick={signOut}>
                        <LogOut className="w-4 h-4" /> Sign Out
                      </Button>
                    </AlertDialogTrigger>
                  </AlertDialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4" /> Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete My Account</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
