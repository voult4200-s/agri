import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, MessageSquare, ThumbsUp, Share2, Search, Plus, X,
  TrendingUp, Leaf, Bug, CloudSun, Tractor, HelpCircle, Filter,
  Heart, MessageCircle, Eye, Clock, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const categories = [
  { id: "all", label: "All Topics", icon: Users },
  { id: "crops", label: "Crop Tips", icon: Leaf },
  { id: "pests", label: "Pest & Disease", icon: Bug },
  { id: "weather", label: "Weather Talk", icon: CloudSun },
  { id: "equipment", label: "Equipment", icon: Tractor },
  { id: "market", label: "Market Trends", icon: TrendingUp },
  { id: "help", label: "Ask for Help", icon: HelpCircle },
];

interface Post {
  id: number;
  author: string;
  avatar: string;
  location: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: Comment[];
  views: number;
  timeAgo: string;
  tags: string[];
  liked: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timeAgo: string;
  likes: number;
}

const initialPosts: Post[] = [
  {
    id: 1, author: "Ramesh Patel", avatar: "RP", location: "Gujarat",
    category: "crops", title: "Best organic fertilizer for wheat this Rabi season?",
    content: "I've been using vermicompost for the last 2 years but yields aren't improving. My soil is clay-loamy with pH around 7.2. Any suggestions for organic alternatives that work well for wheat in Gujarat's climate?",
    likes: 24, views: 156, timeAgo: "2 hours ago", tags: ["wheat", "organic", "rabi"],
    liked: false,
    comments: [
      { id: 1, author: "Suresh Kumar", avatar: "SK", content: "Try neem cake mixed with vermicompost in 1:3 ratio. Worked wonders for my wheat crop last season!", timeAgo: "1 hour ago", likes: 8 },
      { id: 2, author: "Anita Devi", avatar: "AD", content: "Have you tested your soil micronutrients? Sometimes it's zinc deficiency, not fertilizer issue.", timeAgo: "45 min ago", likes: 5 },
    ],
  },
  {
    id: 2, author: "Lakshmi Naidu", avatar: "LN", location: "Andhra Pradesh",
    category: "pests", title: "Yellow mosaic virus spotted on my moong dal crop 🚨",
    content: "Found yellow patches on leaves spreading fast. Already sprayed neem oil but no improvement. The whitefly population is very high this year. Need urgent advice before it spreads to the entire 3-acre field!",
    likes: 42, views: 289, timeAgo: "5 hours ago", tags: ["pest-alert", "moong", "urgent"],
    liked: false,
    comments: [
      { id: 3, author: "Dr. Sharma", avatar: "DS", content: "Use Imidacloprid 17.8% SL @ 0.3ml/L to control whitefly first. Remove and burn heavily infected plants immediately.", timeAgo: "4 hours ago", likes: 15 },
    ],
  },
  {
    id: 3, author: "Harpreet Singh", avatar: "HS", location: "Punjab",
    category: "equipment", title: "Review: New solar-powered drip irrigation system",
    content: "Installed a 5HP solar pump with micro-drip system last month for my 8-acre sugarcane field. Electricity bill dropped by 70% and water usage reduced by 40%. Total cost was ₹3.2 lakh with 40% government subsidy. Happy to answer questions!",
    likes: 87, views: 512, timeAgo: "1 day ago", tags: ["solar", "irrigation", "review"],
    liked: false,
    comments: [
      { id: 4, author: "Rajesh Meena", avatar: "RM", content: "Which brand did you go with? I'm planning the same for my farm.", timeAgo: "20 hours ago", likes: 3 },
      { id: 5, author: "Vikram Joshi", avatar: "VJ", content: "Great investment! I've been using solar pump for 2 years now. Maintenance is minimal.", timeAgo: "18 hours ago", likes: 6 },
      { id: 6, author: "Harpreet Singh", avatar: "HS", content: "I used Tata Solar panels with Kirloskar pump. Very reliable so far.", timeAgo: "16 hours ago", likes: 4 },
    ],
  },
  {
    id: 4, author: "Meena Kumari", avatar: "MK", location: "Rajasthan",
    category: "market", title: "Cumin prices expected to rise — hold your stock!",
    content: "According to NCDEX futures and current demand from export markets, cumin (jeera) prices are likely to increase by 15-20% in the next 2 months. Current mandi rate in Unjha is ₹52,000/quintal. Consider holding if you have good storage facilities.",
    likes: 63, views: 445, timeAgo: "1 day ago", tags: ["cumin", "price-forecast", "market"],
    liked: false,
    comments: [],
  },
  {
    id: 5, author: "Amit Yadav", avatar: "AY", location: "Uttar Pradesh",
    category: "weather", title: "Late frost warning for North India — protect your crops!",
    content: "IMD has predicted unexpected frost in parts of UP, Bihar, and MP this week. If you have standing mustard or potato crop, consider light irrigation in the evening to protect from frost damage. Cover nursery beds with plastic sheets.",
    likes: 91, views: 678, timeAgo: "3 hours ago", tags: ["frost", "weather-alert", "north-india"],
    liked: false,
    comments: [
      { id: 7, author: "Sita Ram", avatar: "SR", content: "Thanks for the warning! Just irrigated my potato field.", timeAgo: "2 hours ago", likes: 12 },
    ],
  },
  {
    id: 6, author: "Priya Sharma", avatar: "PS", location: "Madhya Pradesh",
    category: "help", title: "First time growing strawberries — need guidance",
    content: "I want to try strawberry cultivation on 1 acre. I'm in Bhopal region with black soil. Can anyone guide me on variety selection, planting time, and expected investment? Is polyhouse necessary or can I grow in open field?",
    likes: 18, views: 134, timeAgo: "6 hours ago", tags: ["strawberry", "beginner", "guidance"],
    liked: false,
    comments: [
      { id: 8, author: "Kisan Expert", avatar: "KE", content: "Go with Camarosa or Winter Dawn variety. Best planting time is October. Open field is possible but polyhouse gives 3x better yield.", timeAgo: "5 hours ago", likes: 9 },
    ],
  },
];

export default function Community() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  // New post form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newTags, setNewTags] = useState("");

  const filteredPosts = posts
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter(
      (p) =>
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "popular") return b.likes - a.likes;
      if (sortBy === "mostViewed") return b.views - a.views;
      return b.id - a.id;
    });

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    if (selectedPost?.id === postId) {
      setSelectedPost((prev) =>
        prev ? { ...prev, liked: !prev.liked, likes: prev.liked ? prev.likes - 1 : prev.likes + 1 } : prev
      );
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost) return;
    const comment: Comment = {
      id: Date.now(), author: "You", avatar: "YO",
      content: newComment, timeAgo: "Just now", likes: 0,
    };
    const updated = posts.map((p) =>
      p.id === selectedPost.id ? { ...p, comments: [...p.comments, comment] } : p
    );
    setPosts(updated);
    setSelectedPost((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
    setNewComment("");
  };

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim() || !newCategory) return;
    const post: Post = {
      id: Date.now(), author: "You", avatar: "YO", location: "Your Location",
      category: newCategory, title: newTitle, content: newContent,
      likes: 0, views: 0, timeAgo: "Just now",
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      liked: false, comments: [],
    };
    setPosts([post, ...posts]);
    setNewTitle(""); setNewContent(""); setNewCategory(""); setNewTags("");
    setShowCreateDialog(false);
  };

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      crops: "bg-success/15 text-success border-success/20",
      pests: "bg-destructive/15 text-destructive border-destructive/20",
      weather: "bg-info/15 text-info border-info/20",
      equipment: "bg-commerce/15 text-commerce border-commerce/20",
      market: "bg-warning/15 text-warning border-warning/20",
      help: "bg-accent/15 text-accent-foreground border-accent/20",
    };
    return map[cat] || "bg-muted text-muted-foreground border-border";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Community Forum</h1>
          <p className="text-sm text-muted-foreground">Connect, share, and learn from fellow farmers</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gradient-warm text-secondary-foreground border-0 hover:opacity-90 gap-2">
              <Plus className="w-4 h-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Create a Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Post title..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea placeholder="Share your thoughts, questions, or tips..." rows={5} value={newContent} onChange={(e) => setNewContent(e.target.value)} />
              <Input placeholder="Tags (comma-separated)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
              <Button onClick={handleCreatePost} className="w-full gradient-warm text-secondary-foreground border-0">
                Publish Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, tags..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="popular">Most Liked</SelectItem>
            <SelectItem value="mostViewed">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <cat.icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-[var(--shadow-card)] transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs shrink-0">
                  {post.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm text-foreground">{post.author}</span>
                    <span className="text-xs text-muted-foreground">· {post.location}</span>
                    <span className="text-xs text-muted-foreground">· {post.timeAgo}</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-1">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className={getCategoryColor(post.category)}>
                      {categories.find((c) => c.id === post.category)?.label}
                    </Badge>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-5 mt-3 text-muted-foreground">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                      className={`flex items-center gap-1.5 text-xs hover:text-destructive transition-colors ${post.liked ? "text-destructive" : ""}`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} /> {post.likes}
                    </button>
                    <span className="flex items-center gap-1.5 text-xs"><MessageCircle className="w-4 h-4" /> {post.comments.length}</span>
                    <span className="flex items-center gap-1.5 text-xs"><Eye className="w-4 h-4" /> {post.views}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No posts found</p>
            <p className="text-sm">Try a different category or search term</p>
          </div>
        )}
      </div>

      {/* Post Detail Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-heading font-bold text-xs">
                    {selectedPost.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selectedPost.author}</p>
                    <p className="text-xs text-muted-foreground">{selectedPost.location} · {selectedPost.timeAgo}</p>
                  </div>
                </div>
                <DialogTitle className="font-heading text-lg">{selectedPost.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getCategoryColor(selectedPost.category)}>
                    {categories.find((c) => c.id === selectedPost.category)?.label}
                  </Badge>
                  {selectedPost.tags.map((tag) => (
                    <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-5 text-muted-foreground border-y border-border py-3">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center gap-1.5 text-sm hover:text-destructive transition-colors ${selectedPost.liked ? "text-destructive" : ""}`}
                  >
                    <Heart className={`w-4 h-4 ${selectedPost.liked ? "fill-current" : ""}`} /> {selectedPost.likes} Likes
                  </button>
                  <span className="flex items-center gap-1.5 text-sm"><Eye className="w-4 h-4" /> {selectedPost.views} Views</span>
                  <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-heading font-semibold text-sm mb-3">Comments ({selectedPost.comments.length})</h4>
                  <div className="space-y-3">
                    {selectedPost.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 bg-muted/50 rounded-lg p-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-heading font-bold text-[10px] shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">{comment.author}</span>
                            <span className="text-[10px] text-muted-foreground">{comment.timeAgo}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                          <button className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 hover:text-foreground">
                            <ThumbsUp className="w-3 h-3" /> {comment.likes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Comment */}
                <div className="flex gap-2 pt-2">
                  <Textarea
                    placeholder="Write a reply..."
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                  />
                  <Button onClick={handleAddComment} className="self-end gradient-warm text-secondary-foreground border-0">
                    Reply
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
