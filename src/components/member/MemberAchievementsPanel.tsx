import { useState } from "react";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ImageUpload";
import {
  useAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
} from "@/hooks/useAchievements";
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
import { Trophy, Plus, Trash2, Edit, Star, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberAchievementsPanelProps {
  profileId: string;
}

interface AchievementFormData {
  title: string;
  description: string;
  achievement_type: string;
  achievement_date: string;
  icon: string;
  is_highlighted: boolean;
  image_url: string;
}

const initialFormData: AchievementFormData = {
  title: "",
  description: "",
  achievement_type: "competition",
  achievement_date: "",
  icon: "Trophy",
  is_highlighted: false,
  image_url: "",
};

const iconOptions = ["Trophy", "Award", "Target", "Flag", "Medal", "Star", "Shield"];
const typeOptions = ["competition", "recognition", "ranking", "discovery", "certification"];

export function MemberAchievementsPanel({ profileId }: MemberAchievementsPanelProps) {
  const { data: allAchievements, isLoading } = useAchievements();
  const createAchievement = useCreateAchievement();
  const updateAchievement = useUpdateAchievement();
  const deleteAchievement = useDeleteAchievement();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<AchievementFormData>(initialFormData);

  // Filter to only show member's own achievements
  const myAchievements = allAchievements?.filter(
    (a) => a.owner_id === profileId && !a.is_team_achievement
  );

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
      is_highlighted: achievement.is_highlighted,
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
        is_team_achievement: false,
        is_highlighted: formData.is_highlighted,
        owner_id: profileId,
        image_url: formData.image_url || null,
      };

      if (editingAchievement) {
        await updateAchievement.mutateAsync({
          id: editingAchievement.id,
          updates: achievementData,
        });
        toast({ title: "Success", description: "Achievement updated" });
      } else {
        await createAchievement.mutateAsync({ achievement: achievementData });
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

  return (
    <CyberCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold text-foreground">My Achievements</h3>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="cyber" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 max-w-lg max-h-[80vh] overflow-y-auto">
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, achievement_type: value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, achievement_date: e.target.value })
                  }
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
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_highlighted_member"
                  checked={formData.is_highlighted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_highlighted: !!checked })
                  }
                />
                <Label htmlFor="is_highlighted_member">Highlight this achievement</Label>
              </div>
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
      ) : myAchievements && myAchievements.length > 0 ? (
        <div className="space-y-4">
          {myAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-secondary/10"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{achievement.title}</h4>
                  {achievement.is_highlighted && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {achievement.achievement_type}
                  </Badge>
                  {achievement.achievement_date && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(achievement.achievement_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(achievement)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(achievement.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">
          You haven't added any achievements yet
        </p>
      )}
    </CyberCard>
  );
}
