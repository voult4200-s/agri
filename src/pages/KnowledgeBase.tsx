import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, BookOpen, PlayCircle, FileText, Sprout, Bug, Droplets,
  Sun, Tractor, Leaf, ChevronRight, Clock, Eye, ThumbsUp, Filter,
} from "lucide-react";

const categories = ["All", "Crop Management", "Pest Control", "Irrigation", "Soil Health", "Equipment", "Organic Farming"];

const articles = [
  { id: 1, title: "Complete Guide to Wheat Cultivation in India", category: "Crop Management", type: "guide", readTime: "12 min", views: 2340, likes: 187, icon: Sprout, tags: ["wheat", "rabi", "cultivation"], excerpt: "Learn best practices for wheat farming from seed selection to harvesting techniques." },
  { id: 2, title: "Identifying and Managing Common Rice Pests", category: "Pest Control", type: "article", readTime: "8 min", views: 1890, likes: 145, icon: Bug, tags: ["rice", "pests", "IPM"], excerpt: "A comprehensive guide to identifying rice pests and implementing integrated pest management." },
  { id: 3, title: "Drip Irrigation Setup for Small Farms", category: "Irrigation", type: "tutorial", readTime: "15 min", views: 3120, likes: 256, icon: Droplets, tags: ["drip", "water-saving", "setup"], excerpt: "Step-by-step tutorial for installing cost-effective drip irrigation on small holdings." },
  { id: 4, title: "Understanding Soil pH and Nutrient Management", category: "Soil Health", type: "guide", readTime: "10 min", views: 1650, likes: 132, icon: Leaf, tags: ["soil", "pH", "nutrients"], excerpt: "How soil pH affects crop growth and practical methods for soil amendment." },
  { id: 5, title: "Tractor Maintenance: Seasonal Checklist", category: "Equipment", type: "article", readTime: "6 min", views: 980, likes: 89, icon: Tractor, tags: ["tractor", "maintenance"], excerpt: "Keep your tractor running efficiently with this seasonal maintenance checklist." },
  { id: 6, title: "Getting Started with Organic Farming", category: "Organic Farming", type: "guide", readTime: "20 min", views: 4200, likes: 378, icon: Sun, tags: ["organic", "certification", "natural"], excerpt: "Everything you need to know about transitioning to organic farming practices." },
  { id: 7, title: "Video: Pruning Techniques for Fruit Trees", category: "Crop Management", type: "video", readTime: "18 min", views: 5600, likes: 420, icon: Sprout, tags: ["pruning", "fruits", "video"], excerpt: "Watch expert demonstrations of proper pruning techniques for mango, guava, and citrus trees." },
  { id: 8, title: "Natural Pest Repellents You Can Make at Home", category: "Pest Control", type: "tutorial", readTime: "7 min", views: 2800, likes: 210, icon: Bug, tags: ["natural", "DIY", "organic"], excerpt: "Create effective pest repellents using neem, garlic, and other natural ingredients." },
  { id: 9, title: "Rainwater Harvesting for Agriculture", category: "Irrigation", type: "guide", readTime: "14 min", views: 1920, likes: 165, icon: Droplets, tags: ["rainwater", "harvesting", "conservation"], excerpt: "Design and implement rainwater harvesting systems to supplement irrigation needs." },
];

const typeIcon = { guide: BookOpen, tutorial: FileText, article: FileText, video: PlayCircle };

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Knowledge Base</h1>
        <p className="text-muted-foreground text-sm mt-1">Farming guides, tutorials, and articles to help you grow better</p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search articles, guides, tutorials..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
            {cat}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="guide">Guides</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
          <TabsTrigger value="video">Videos</TabsTrigger>
        </TabsList>

        {["all", "guide", "tutorial", "video"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filtered
                .filter((a) => tab === "all" || a.type === tab)
                .map((article, i) => {
                  const TypeIcon = typeIcon[article.type as keyof typeof typeIcon] || FileText;
                  return (
                    <motion.div key={article.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-5 flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <article.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs gap-1">
                                <TypeIcon className="w-3 h-3" />
                                {article.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{article.category}</Badge>
                            </div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.readTime}</span>
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views.toLocaleString()}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{article.likes}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-2" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
            {filtered.filter((a) => tab === "all" || a.type === tab).length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No articles found matching your search.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
