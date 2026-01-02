import { useState } from "react";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "@/types/database";
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
import { FolderKanban, Plus, Trash2, Edit, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  is_team_project: boolean;
  github_url: string;
  demo_url: string;
  language: string;
  tags: string;
  image_url: string;
  selectedMembers: string[];
}

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  status: "active",
  is_team_project: false,
  github_url: "",
  demo_url: "",
  language: "",
  tags: "",
  image_url: "",
  selectedMembers: [],
};

export function AdminProjectsPanel() {
  const { data: projects, isLoading } = useProjects();
  const { data: profiles } = useProfiles();
  const { user } = useAuth();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  // Get current user's profile
  const currentUserProfile = profiles?.find((p) => p.user_id === user?.id);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingProject(null);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || "",
      status: project.status,
      is_team_project: project.is_team_project,
      github_url: project.github_url || "",
      demo_url: project.demo_url || "",
      language: project.language || "",
      tags: project.tags?.join(", ") || "",
      image_url: project.image_url || "",
      selectedMembers: project.members?.map((m) => m.id) || [],
    });
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    try {
      const projectData = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        is_team_project: formData.is_team_project,
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        image_url: formData.image_url || null,
        language: formData.language || null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : null,
        stars: 0,
        owner_id: !formData.is_team_project && currentUserProfile ? currentUserProfile.id : null,
      };
      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          updates: projectData,
          memberIds: formData.is_team_project ? formData.selectedMembers : undefined,
        });
        toast({ title: "Success", description: "Project updated" });
      } else {
        await createProject.mutateAsync({
          project: projectData,
          memberIds: formData.is_team_project ? formData.selectedMembers : undefined,
        });
        toast({ title: "Success", description: "Project created" });
      }

      setIsAddOpen(false);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject.mutateAsync(id);
      toast({ title: "Success", description: "Project deleted" });
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
          <FolderKanban className="w-5 h-5 text-secondary" />
          <h3 className="font-display font-bold text-foreground">Manage Projects</h3>
        </div>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="cyber" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30 max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProject ? "Edit Project" : "Add New Project"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Project Image (optional)</Label>
                <ImageUpload
                  currentUrl={formData.image_url}
                  onUpload={(url) => setFormData({ ...formData, image_url: url })}
                  folder="projects"
                  aspectRatio="video"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Project name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="classified">Classified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Language</Label>
                  <Input
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g. Python, Rust"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>GitHub URL</Label>
                  <Input
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <Label>Demo URL</Label>
                  <Input
                    value={formData.demo_url}
                    onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="security, automation, tool"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_team_project"
                  checked={formData.is_team_project}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_team_project: !!checked })
                  }
                />
                <Label htmlFor="is_team_project">Team Project</Label>
              </div>
              {formData.is_team_project && (
                <div>
                  <Label>Select Team Members</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {profiles?.map((profile) => (
                      <div key={profile.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`member-${profile.id}`}
                          checked={formData.selectedMembers.includes(profile.id)}
                          onCheckedChange={() => toggleMember(profile.id)}
                        />
                        <Label htmlFor={`member-${profile.id}`} className="text-sm">
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
                disabled={createProject.isPending || updateProject.isPending}
              >
                {editingProject ? "Update Project" : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading projects...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects?.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-semibold">{project.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.is_team_project ? (
                      <span className="flex items-center gap-1 text-secondary">
                        <Users className="w-3 h-3" /> Team
                      </span>
                    ) : (
                      "Individual"
                    )}
                  </TableCell>
                  <TableCell>
                    {project.members?.length || 0} members
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!projects || projects.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No projects found
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
