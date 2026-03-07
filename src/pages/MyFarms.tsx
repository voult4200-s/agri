import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Wheat, MapPin, Droplets, Thermometer, Plus, Pencil, Trash2,
  Sprout, Calendar, BarChart3, Leaf, Sun, TrendingUp,
} from "lucide-react";

interface Farm {
  id: number;
  name: string;
  location: string;
  size: number;
  unit: string;
  soilType: string;
  irrigation: string;
  crops: { name: string; status: string; plantedDate: string; expectedHarvest: string; health: string }[];
}

const initialFarms: Farm[] = [
  {
    id: 1, name: "Green Valley Farm", location: "Nashik, Maharashtra", size: 5.5, unit: "Acres", soilType: "Black Cotton Soil", irrigation: "Drip Irrigation",
    crops: [
      { name: "Wheat", status: "Growing", plantedDate: "2025-11-15", expectedHarvest: "2026-03-20", health: "Healthy" },
      { name: "Onion", status: "Harvesting", plantedDate: "2025-09-01", expectedHarvest: "2026-01-15", health: "Good" },
    ],
  },
  {
    id: 2, name: "Sunrise Fields", location: "Pune, Maharashtra", size: 3.2, unit: "Acres", soilType: "Red Soil", irrigation: "Sprinkler",
    crops: [
      { name: "Tomato", status: "Growing", plantedDate: "2025-12-01", expectedHarvest: "2026-03-01", health: "Needs Attention" },
      { name: "Chilli", status: "Seedling", plantedDate: "2026-01-10", expectedHarvest: "2026-05-15", health: "Healthy" },
    ],
  },
  {
    id: 3, name: "Riverside Plot", location: "Kolhapur, Maharashtra", size: 8.0, unit: "Acres", soilType: "Alluvial Soil", irrigation: "Canal",
    crops: [
      { name: "Sugarcane", status: "Growing", plantedDate: "2025-06-15", expectedHarvest: "2026-06-15", health: "Healthy" },
    ],
  },
];

const healthColor: Record<string, string> = { Healthy: "bg-green-500/10 text-green-700", Good: "bg-blue-500/10 text-blue-700", "Needs Attention": "bg-yellow-500/10 text-yellow-700" };
const statusColor: Record<string, string> = { Growing: "bg-primary/10 text-primary", Harvesting: "bg-green-500/10 text-green-700", Seedling: "bg-blue-500/10 text-blue-700" };

export default function MyFarms() {
  const [farms, setFarms] = useState<Farm[]>(initialFarms);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newFarm, setNewFarm] = useState({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "" });

  const totalArea = farms.reduce((sum, f) => sum + f.size, 0);
  const totalCrops = farms.reduce((sum, f) => sum + f.crops.length, 0);

  const handleAddFarm = () => {
    if (!newFarm.name || !newFarm.location) return;
    setFarms([...farms, {
      id: Date.now(), name: newFarm.name, location: newFarm.location,
      size: parseFloat(newFarm.size) || 0, unit: newFarm.unit, soilType: newFarm.soilType, irrigation: newFarm.irrigation, crops: [],
    }]);
    setNewFarm({ name: "", location: "", size: "", unit: "Acres", soilType: "", irrigation: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: number) => setFarms(farms.filter((f) => f.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Farms</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your farm profiles, crops, and field details</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" />Add Farm</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Farm</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label>Farm Name</Label><Input placeholder="e.g. Green Valley Farm" value={newFarm.name} onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })} /></div>
              <div><Label>Location</Label><Input placeholder="e.g. Nashik, Maharashtra" value={newFarm.location} onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Size</Label><Input type="number" placeholder="5.5" value={newFarm.size} onChange={(e) => setNewFarm({ ...newFarm, size: e.target.value })} /></div>
                <div><Label>Unit</Label>
                  <Select value={newFarm.unit} onValueChange={(v) => setNewFarm({ ...newFarm, unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Acres">Acres</SelectItem><SelectItem value="Hectares">Hectares</SelectItem><SelectItem value="Bigha">Bigha</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Soil Type</Label><Input placeholder="e.g. Black Cotton Soil" value={newFarm.soilType} onChange={(e) => setNewFarm({ ...newFarm, soilType: e.target.value })} /></div>
              <div><Label>Irrigation Type</Label><Input placeholder="e.g. Drip Irrigation" value={newFarm.irrigation} onChange={(e) => setNewFarm({ ...newFarm, irrigation: e.target.value })} /></div>
              <Button className="w-full" onClick={handleAddFarm}>Add Farm</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Farms", value: farms.length, icon: Wheat, color: "text-primary" },
          { label: "Total Area", value: `${totalArea.toFixed(1)} Acres`, icon: MapPin, color: "text-green-600" },
          { label: "Active Crops", value: totalCrops, icon: Sprout, color: "text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
              <div><p className="text-xs text-muted-foreground">{stat.label}</p><p className="text-lg font-bold text-foreground">{stat.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Farm Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {farms.map((farm, i) => (
            <motion.div key={farm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{farm.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{farm.location}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedFarm(farm)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(farm.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground"><BarChart3 className="w-3.5 h-3.5" /><span>{farm.size} {farm.unit}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Leaf className="w-3.5 h-3.5" /><span>{farm.soilType}</span></div>
                    <div className="flex items-center gap-1.5 text-muted-foreground"><Droplets className="w-3.5 h-3.5" /><span>{farm.irrigation}</span></div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">ACTIVE CROPS</p>
                    <div className="space-y-2">
                      {farm.crops.map((crop) => (
                        <div key={crop.name} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Sprout className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-foreground">{crop.name}</span>
                            <Badge className={`text-xs ${statusColor[crop.status] || ""}`} variant="secondary">{crop.status}</Badge>
                          </div>
                          <Badge className={`text-xs ${healthColor[crop.health] || ""}`} variant="secondary">{crop.health}</Badge>
                        </div>
                      ))}
                      {farm.crops.length === 0 && <p className="text-xs text-muted-foreground italic">No crops added yet</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Farm Detail Dialog */}
      <Dialog open={!!selectedFarm} onOpenChange={() => setSelectedFarm(null)}>
        <DialogContent className="max-w-lg">
          {selectedFarm && (
            <>
              <DialogHeader><DialogTitle>{selectedFarm.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Location</span><p className="font-medium text-foreground">{selectedFarm.location}</p></div>
                  <div><span className="text-muted-foreground">Size</span><p className="font-medium text-foreground">{selectedFarm.size} {selectedFarm.unit}</p></div>
                  <div><span className="text-muted-foreground">Soil Type</span><p className="font-medium text-foreground">{selectedFarm.soilType}</p></div>
                  <div><span className="text-muted-foreground">Irrigation</span><p className="font-medium text-foreground">{selectedFarm.irrigation}</p></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Crop Details</p>
                  {selectedFarm.crops.map((crop) => (
                    <Card key={crop.name} className="mb-2">
                      <CardContent className="p-3 space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground">{crop.name}</span>
                          <Badge className={`${healthColor[crop.health] || ""}`} variant="secondary">{crop.health}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                          <span>Planted: {crop.plantedDate}</span>
                          <span>Harvest: {crop.expectedHarvest}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
