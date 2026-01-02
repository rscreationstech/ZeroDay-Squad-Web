import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { GlitchText } from "@/components/cyber/GlitchText";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminMembersPanel } from "@/components/admin/AdminMembersPanel";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { AdminAchievementsPanel } from "@/components/admin/AdminAchievementsPanel";
import { AdminStatsPanel } from "@/components/admin/AdminStatsPanel";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import {
  Crown,
  LogOut,
  Terminal,
  Users,
  FolderKanban,
  Trophy,
  Activity,
  Edit,
} from "lucide-react";

export default function AdminDashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate("/auth");
    }
  }, [user, role, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <section className="min-h-[85vh] flex items-center justify-center">
          <div className="text-center">
            <Terminal className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground font-mono">Loading admin terminal...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!user || role !== "admin") {
    return null;
  }

  return (
    <Layout>
      <section className="min-h-[85vh] px-4 py-20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-yellow-500" />
                <GlitchText
                  text="Admin Control Center"
                  className="text-3xl md:text-4xl font-display font-bold"
                />
              </div>
              <p className="text-muted-foreground font-mono text-sm">
                <span className="text-secondary">$</span> root@zerodaysquad ~# sudo access granted
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="cyber"
                onClick={() => setIsProfileEditOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="cyber-secondary"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs for management */}
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-card/50 border border-primary/20">
              <TabsTrigger value="members" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2 data-[state=active]:bg-secondary/20">
                <FolderKanban className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2 data-[state=active]:bg-yellow-500/20">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Achievements</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-primary/20">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <AdminMembersPanel />
            </TabsContent>
            <TabsContent value="projects">
              <AdminProjectsPanel />
            </TabsContent>
            <TabsContent value="achievements">
              <AdminAchievementsPanel />
            </TabsContent>
            <TabsContent value="stats">
              <AdminStatsPanel />
            </TabsContent>
          </Tabs>

          {/* Profile Edit Dialog */}
          {user && (
            <ProfileEditDialog
              open={isProfileEditOpen}
              onOpenChange={setIsProfileEditOpen}
              userId={user.id}
            />
          )}
        </div>
      </section>
    </Layout>
  );
}
