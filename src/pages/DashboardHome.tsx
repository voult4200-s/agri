import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useDashboardNotifications } from "@/hooks/useDashboardNotifications";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot, CloudSun, TrendingUp, ShoppingCart, Warehouse, Handshake,
  Wheat, BarChart3, Sun, Wind, Droplets, CloudRain, GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading: notificationsLoading, clearNotifications } = useDashboardNotifications(user?.id);
  const firstName = user?.full_name?.split(" ")[0] || "Farmer";

  // Live data states
  const [farmCount, setFarmCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [storageCount, setStorageCount] = useState(0);

  // Fetch live data from Supabase
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    const sb = supabase as any; // Cast to any for tables not in schema

    const fetchCounts = async () => {
      try {
        // Fetch farms count
        const { count: farmsCount } = await sb
          .from("farms")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (isMounted) setFarmCount(farmsCount || 0);

        // Fetch orders count
        const { count: ordersCount } = await sb
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (isMounted) setOrderCount(ordersCount || 0);

        // Fetch storage bookings count
        const { count: storageCount } = await sb
          .from("storage_bookings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (isMounted) setStorageCount(storageCount || 0);
      } catch (error) {
        console.warn("Failed to fetch counts:", error);
      }
    };

    // Initial fetch
    fetchCounts();

    // Poll every 30 seconds, just like notifications (same as useDashboardNotifications)
    const interval = setInterval(() => {
      if (isMounted) fetchCounts();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  const quickStats = [
    { labelKey: "dashboard.stats.activeFarms", value: farmCount.toString(), icon: Wheat, changeKey: "dashboard.stats.newFarms", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30" },
    { labelKey: "dashboard.stats.activeOrders", value: orderCount.toString(), icon: ShoppingCart, changeKey: "dashboard.stats.pending", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
    { labelKey: "dashboard.stats.storageBookings", value: storageCount.toString(), icon: Warehouse, changeKey: "dashboard.stats.allActive", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
    { labelKey: "dashboard.stats.revenue", value: "₹0", icon: BarChart3, changeKey: "dashboard.stats.thisMonth", color: "text-green-600", bgColor: "bg-green-50 dark:bg-green-950/30" },
  ];

  const quickActions = [
    { labelKey: "dashboard.quickActions.aiAdvice", icon: Bot, path: "/dashboard/ai", color: "text-emerald-600", bgColor: "bg-emerald-50 dark:bg-emerald-950/30", borderColor: "border-emerald-200 dark:border-emerald-800" },
    { labelKey: "dashboard.quickActions.shopNow", icon: ShoppingCart, path: "/dashboard/shop", color: "text-blue-600", bgColor: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800" },
    { labelKey: "dashboard.quickActions.bookStorage", icon: Warehouse, path: "/dashboard/storage", color: "text-amber-600", bgColor: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-800" },
    { labelKey: "dashboard.quickActions.sellDirect", icon: Handshake, path: "/dashboard/sell", color: "text-purple-600", bgColor: "bg-purple-50 dark:bg-purple-950/30", borderColor: "border-purple-200 dark:border-purple-800" },
  ];

  const getNotificationStyle = (type: string) => {
    if (type === "community") {
      return {
        icon: TrendingUp,
        color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      };
    }
    return {
      icon: Warehouse,
      color: "bg-amber-500/10 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greetingMorning", { defaultValue: "Good morning" });
    if (hour < 17) return t("dashboard.greetingAfternoon", { defaultValue: "Good afternoon" });
    return t("dashboard.greetingEvening", { defaultValue: "Good evening" });
  };

  return (
    <div className="space-y-8">
      {/* Greeting Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="pt-4"
      >
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
          {getGreeting()}, {firstName}! 🌾
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          {t("dashboard.subtitle", { defaultValue: "Welcome back to your farming dashboard" })}
        </p>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, i) => (
          <motion.div 
            key={stat.labelKey} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg border border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {t(stat.changeKey, { defaultValue: "Today" })}
                  </span>
                </div>
                <p className="font-heading font-bold text-2xl text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{t(stat.labelKey)}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="h-full transition-all duration-300 hover:shadow-lg border border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-foreground">{t("dashboard.quickActions.title", { defaultValue: "Quick Actions" })}</CardTitle>
              <CardDescription className="text-xs">{t("dashboard.quickActions.desc", { defaultValue: "Access key features" })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={action.labelKey}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + idx * 0.08 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 border ${action.bgColor} ${action.borderColor} hover:shadow-md`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                      <action.icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-[11px] font-medium text-foreground text-center leading-tight">
                      {t(action.labelKey)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weather Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }}
          className="lg:col-span-1"
        >
          <Card 
            className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg border border-border/50 overflow-hidden"
            onClick={() => navigate("/dashboard/weather")}
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <CloudSun className="w-5 h-5 text-blue-600" />
                {t("dashboard.weather", { defaultValue: "Weather Today" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <motion.div 
                  animate={{ y: [0, -6, 0] }} 
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  ☀️
                </motion.div>
                <p className="font-heading font-bold text-3xl text-foreground">32°C</p>
                <p className="text-xs text-muted-foreground mt-1">{t("dashboard.weatherDesc", { defaultValue: "Partly cloudy" })}</p>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { icon: Sun, label: "30°", desc: "Max" },
                    { icon: CloudSun, label: "24°", desc: "Min" },
                    { icon: Wind, label: "12 km", desc: "Wind" },
                    { icon: Droplets, label: "65%", desc: "Rain" },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 p-2 rounded bg-card/50">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                      <span className="text-[8px] text-muted-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card className="h-full transition-all duration-300 hover:shadow-lg border border-border/50 flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{t("dashboard.notifications.history", { defaultValue: "Recent Activity" })}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  onClick={clearNotifications}
                >
                  {t("dashboard.actions.clear", { defaultValue: "Clear" })}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <div className="space-y-2 flex-1 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="text-xs text-muted-foreground text-center py-8">{t("common.loading", { defaultValue: "Loading..." })}</div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                    <GripVertical className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">{t("dashboard.noActivity", { defaultValue: "No activity yet" })}</p>
                  </div>
                ) : (
                  notifications.map((activity) => {
                    const style = getNotificationStyle(activity.type);
                    const Icon = style.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 2 }}
                        onClick={() => navigate(activity.href)}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 cursor-pointer border border-border/30"
                      >
                        <div className={`w-8 h-8 rounded-lg ${style.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground line-clamp-2">{activity.text}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}