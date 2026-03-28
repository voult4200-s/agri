import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, MessageSquare, ThumbsUp, Share2, Search, Plus, X,
  TrendingUp, Leaf, Bug, CloudSun, Tractor, HelpCircle, Filter,
  Heart, MessageCircle, Eye, Clock, ChevronDown, LogIn,
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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  location?: string;
  category: string;
  title: string;
  content: string;
  image?: string;
  likes_count: number;
  comments: Comment[];
  views_count: number;
  created_at: string;
  tags: string[];
  liked_by_user: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_id: string;
}

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Fetch posts from Supabase
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("id, user_id, title, content, category, tags, likes_count, views_count, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // If no data, return empty (will show "No posts" message)
      if (!data) return [];

      // Fetch user full names separately
      const userIds = Array.from(new Set((data as any[]).map((p) => p.user_id)));
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const profileMap = new Map(profilesData?.map((p: any) => [p.user_id, p.full_name]) || []);

      return (data as any[]).map((post) => {
        const fullName = profileMap.get(post.user_id) || "Farmer";
        return {
          id: post.id,
          user_id: post.user_id,
          author: fullName,
          avatar: fullName[0].toUpperCase(),
          category: post.category,
          title: post.title,
          content: post.content,
          likes_count: post.likes_count || 0,
          comments: [],
          views_count: post.views_count || 0,
          created_at: post.created_at,
          tags: post.tags || [],
          liked_by_user: false,
        };
      });
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; category: string; tags: string[] }) => {
      const { data: post, error } = await supabase
        .from("community_posts")
        .insert([
          {
            user_id: user?.id,
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags,
          },
        ])
        .select();

      if (error) throw error;
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setNewTitle("");
      setNewContent("");
      setNewCategory("");
      setNewTags("");
      setShowCreateDialog(false);
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error: checkError } = await supabase
        .from("community_post_likes")
        .select()
        .eq("post_id", postId)
        .eq("user_id", user?.id)
        .maybeSingle();

      if (checkError) throw checkError;

      // For simplicity, we'll just toggle the like count
      const post = posts.find((p) => p.id === postId);
      const isLiked = post?.liked_by_user;

      if (isLiked) {
        const { error } = await supabase
          .from("community_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user?.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_post_likes")
          .insert([{ post_id: postId, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (data: { postId: string; content: string }) => {
      const { error } = await supabase
        .from("community_comments")
        .insert([
          {
            post_id: data.postId,
            user_id: user?.id,
            content: data.content,
          },
        ]);

      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  const filteredPosts = posts
    .filter((p) => activeCategory === "all" || p.category === activeCategory)
    .filter(
      (p) =>
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortBy === "popular") return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortBy === "mostViewed") return (b.views_count || 0) - (a.views_count || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newTitle.trim() || !newContent.trim() || !newCategory) return;
    createPostMutation.mutate({
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  const handleAddComment = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (!newComment.trim() || !selectedPost) return;
    addCommentMutation.mutate({
      postId: selectedPost.id,
      content: newComment,
    });
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    likePostMutation.mutate(postId);
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

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const seconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return postDate.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Community Forum</h1>
          <p className="text-sm text-muted-foreground">
            {isAuthenticated
              ? "Connect, share, and learn from fellow farmers"
              : "Sign in to join the conversation"}
          </p>
        </div>
        {isAuthenticated ? (
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Share your thoughts, questions, or tips..."
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <Input placeholder="Tags (comma-separated)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
                <Button
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending}
                  className="w-full gradient-warm text-secondary-foreground border-0"
                >
                  {createPostMutation.isPending ? "Publishing..." : "Publish Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button onClick={() => navigate("/auth")} className="gradient-warm text-secondary-foreground border-0 gap-2">
            <LogIn className="w-4 h-4" /> Sign In to Post
          </Button>
        )}
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
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-12 h-12 rounded-full gradient-hero animate-spin border-4 border-transparent border-t-primary mx-auto mb-3" />
            <p className="font-medium">Loading posts...</p>
          </div>
        ) : (
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
                      <span className="text-xs text-muted-foreground">· {getTimeAgo(post.created_at)}</span>
                    </div>
                    <h3 className="font-heading font-semibold text-foreground mb-2 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className={getCategoryColor(post.category)}>
                        {categories.find((c) => c.id === post.category)?.label}
                      </Badge>
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-5 mt-3 text-muted-foreground">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
                        }}
                        className={`flex items-center gap-1.5 text-xs hover:text-destructive transition-colors ${
                          post.liked_by_user ? "text-destructive" : ""
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.liked_by_user ? "fill-current" : ""}`} /> {post.likes_count}
                      </button>
                      <span className="flex items-center gap-1.5 text-xs">
                        <MessageCircle className="w-4 h-4" /> {post.comments.length}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <Eye className="w-4 h-4" /> {post.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!isLoading && filteredPosts.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No posts found</p>
            <p className="text-sm">
              {isAuthenticated
                ? "Try a different category or search term"
                : "Sign in to start posting and joining discussions"}
            </p>
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
                    <p className="text-xs text-muted-foreground">{getTimeAgo(selectedPost.created_at)}</p>
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
                    <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-5 text-muted-foreground border-y border-border py-3">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className={`flex items-center gap-1.5 text-sm hover:text-destructive transition-colors ${
                      selectedPost.liked_by_user ? "text-destructive" : ""
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${selectedPost.liked_by_user ? "fill-current" : ""}`} />{" "}
                    {selectedPost.likes_count} Likes
                  </button>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Eye className="w-4 h-4" /> {selectedPost.views_count} Views
                  </span>
                  <button className="flex items-center gap-1.5 text-sm hover:text-foreground transition-colors ml-auto">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Comments */}
                <div>
                  <h4 className="font-heading font-semibold text-sm mb-3">Comments ({selectedPost.comments.length})</h4>
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      {selectedPost.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 bg-muted/50 rounded-lg p-3">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-heading font-bold text-[10px] shrink-0">
                            {comment.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-xs">{comment.author}</span>
                              <span className="text-[10px] text-muted-foreground">{getTimeAgo(comment.created_at)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{comment.content}</p>
                            <button className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5 hover:text-foreground">
                              <ThumbsUp className="w-3 h-3" /> {comment.likes_count}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border border-border rounded-lg">
                      <p className="text-sm mb-3">Sign in to view and post comments</p>
                      <Button
                        onClick={() => navigate("/auth")}
                        className="gradient-warm text-secondary-foreground border-0 gap-2"
                      >
                        <LogIn className="w-4 h-4" /> Sign In
                      </Button>
                    </div>
                  )}
                </div>

                {/* Add Comment */}
                {isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <Textarea
                      placeholder="Write a reply..."
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={addCommentMutation.isPending}
                      className="self-end gradient-warm text-secondary-foreground border-0"
                    >
                      {addCommentMutation.isPending ? "..." : "Reply"}
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
