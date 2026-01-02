import { useState } from "react";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
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
import { FolderKanban, Plus, Trash2, Edit, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberProjectsPanelProps {
  profileId: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  status: string;
  github_url: string;
  demo_url: string;
  language: string;
  tags: string;
  image_url: string;
}

const initialFormData: ProjectFormData = {
  title: "",
  description: "",
  status: "active",
  github_url: "",
  demo_url: "",
  language: "",
  tags: "",
  image_url: "",
};

export function MemberProjectsPanel({ profileId }: MemberProjectsPanelProps) {
  const { data: allProjects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);

  // Filter to only show member's own projects
  const myProjects = allProjects?.filter(
    (p) => p.owner_id === profileId && !p.is_team_project
  );

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
      github_url: project.github_url || "",
      demo_url: project.demo_url || "",
      language: project.language || "",
      tags: project.tags?.join(", ") || "",
      image_url: project.image_url || "",
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
        is_team_project: false,
        github_url: formData.github_url || null,
        demo_url: formData.demo_url || null,
        image_url: formData.image_url || null,
        language: formData.language || null,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : null,
        stars: 0,
        owner_id: profileId,
      };

      if (editingProject) {
        await updateProject.mutateAsync({
          id: editingProject.id,
          updates: projectData,
        });
        toast({ title: "Success", description: "Project updated" });
      } else {
        await createProject.mutateAsync({ project: projectData });
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

  return (
    <CyberCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderKanban className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">My Projects</h3>
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
      ) : myProjects && myProjects.length > 0 ? (
        <div className="space-y-4">
          {myProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-primary/10"
            >
              <div className="flex items-center gap-4">
                {project.image_url && (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-foreground">{project.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {project.status}
                    </Badge>
                    {project.language && (
                      <span className="text-xs text-muted-foreground">
                        {project.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm text-center py-4">
          You haven't added any projects yet
        </p>
      )}
    </CyberCard>
  );
}
