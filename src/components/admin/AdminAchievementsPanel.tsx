import { useState } from "react";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import { useAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement } from "@/hooks/useAchievements";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { Achievement } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, Plus, Trash2, Edit, Users, Star, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AchievementFormData {
  title: string;
  description: string;
  achievement_type: string;
  achievement_date: string;
  icon: string;
  is_team_achievement: boolean;
  is_highlighted: boolean;
  selectedMembers: string[];
  image_url: string;
}

const initialFormData: AchievementFormData = {
  title: "",
  description: "",
  achievement_type: "competition",
  achievement_date: "",
  icon: "Trophy",
  is_team_achievement: false,
  is_highlighted: false,
  selectedMembers: [],
  image_url: "",
};

const iconOptions = ["Trophy", "Award", "Target", "Flag", "Medal", "Star", "Shield"];
const typeOptions = ["competition", "recognition", "ranking", "discovery", "certification"];

export function AdminAchievementsPanel() {
  const { data: achievements, isLoading } = useAchievements();
  const { data: profiles } = useProfiles();
  const { user } = useAuth();
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>(initialFormData);

  // Get current user's profile
  const currentUserProfile = profiles?.find((p) => p.user_id === user?.id);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingAchievement(null);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || "",
      achievement_type: achievement.achievement_type,
      achievement_date: achievement.achievement_date || "",
      icon: achievement.icon || "Trophy",
      is_team_achievement: achievement.is_team_achievement,
      is_highlighted: achievement.is_highlighted,
      selectedMembers: achievement.members?.map((m) => m.id) || [],
      image_url: (achievement as any).image_url || "",
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      const achievementData = {
        title: formData.title,
        description: formData.description || null,
        achievement_type: formData.achievement_type,
        achievement_date: formData.achievement_date || null,
        icon: formData.icon || null,
        is_team_achievement: formData.is_team_achievement,
        is_highlighted: formData.is_highlighted,
        owner_id: !formData.is_team_achievement && currentUserProfile ? currentUserProfile.id : null,
        image_url: formData.image_url || null,
      };

      if (editingAchievement) {
        await updateAchievement.mutateAsync({
          id: editingAchievement.id,
          updates: achievementData,
          memberIds: formData.is_team_achievement ? formData.selectedMembers : undefined,
        });
        toast({ title: "Success", description: "Achievement updated" });
      } else {
        await createAchievement.mutateAsync({
          achievement: achievementData,
          memberIds: formData.is_team_achievement ? formData.selectedMembers : undefined,
        });
        toast({ title: "Success", description: "Achievement created" });
      }

      setIsAddOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAchievement.mutateAsync(id);
      toast({ title: "Success", description: "Achievement deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const toggleMember = (profileId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(profileId)
        ? prev.selectedMembers.filter((id) => id !== profileId)
        : [...prev.selectedMembers, profileId],
    }));
  };

  return (
    <CyberCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="font-display font-bold text-foreground">Manage Achievements</h3>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="cyber" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingAchievement ? "Edit Achievement" : "Add New Achievement"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Achievement title"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Achievement description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.achievement_type}
                    onValueChange={(value) => setFormData({ ...formData, achievement_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Icon</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.achievement_date}
                  onChange={(e) => setFormData({ ...formData, achievement_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Achievement Image
                </Label>
                <ImageUpload
                  currentUrl={formData.image_url}
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  folder="achievements"
                  aspectRatio="video"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_team_achievement"
                    checked={formData.is_team_achievement}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_team_achievement: !!checked })
                    }
                  />
                  <Label htmlFor="is_team_achievement">Team Achievement</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_highlighted"
                    checked={formData.is_highlighted}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_highlighted: !!checked })
                    }
                  />
                  <Label htmlFor="is_highlighted">Highlight (Featured)</Label>
                </div>
              </div>
              {formData.is_team_achievement && (
                <div>
                  <Label>Select Team Members</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {profiles?.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`ach-member-${profile.id}`}
                          checked={formData.selectedMembers.includes(profile.id)}
                          onCheckedChange={() => toggleMember(profile.id)}
                        />
                        <Label htmlFor={`ach-member-${profile.id}`} className="text-sm">
                          @{profile.username || profile.email}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                variant="cyber"
                className="w-full"
                onClick={handleSubmit}
                disabled={createAchievement.isPending || updateAchievement.isPending}
              >
                {editingAchievement ? "Update Achievement" : "Create Achievement"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading achievements...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements?.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell className="font-semibold flex items-center gap-2">
                    {achievement.title}
                    {achievement.is_team_achievement && (
                      <Users className="w-3 h-3 text-secondary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {achievement.achievement_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {achievement.achievement_date
                      ? new Date(achievement.achievement_date).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {achievement.is_highlighted && <Star className="w-4 h-4 text-yellow-500" />}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(achievement)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(achievement.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!achievements || achievements.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No achievements found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </CyberCard>
  );
}
