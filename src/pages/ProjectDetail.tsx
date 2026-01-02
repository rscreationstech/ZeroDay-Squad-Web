import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import {
  Code,
  ExternalLink,
  GitBranch,
  Star,
  Lock,
  Terminal,
  Users,
  ArrowLeft,
  Calendar,
} from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-secondary/20 text-secondary border-secondary/50",
  development: "bg-primary/20 text-primary border-primary/50",
  completed: "bg-green-500/20 text-green-500 border-green-500/50",
  classified: "bg-destructive/20 text-destructive border-destructive/50",
};

const languageColors: Record<string, string> = {
  Python: "bg-yellow-500",
  Rust: "bg-orange-500",
  Go: "bg-cyan-500",
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Java: "bg-red-500",
  "C++": "bg-purple-500",
  C: "bg-gray-500",
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { data: projects, isLoading } = useProjects();

  const project = projects?.find((p) => p.id === id);

  if (isLoading) {
    return (
      <Layout>
        <section className="min-h-[85vh] flex items-center justify-center">
          <div className="text-center">
            <Terminal className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground font-mono">Loading project...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <section className="min-h-[85vh] flex items-center justify-center px-4">
          <CyberCard variant="terminal" className="text-center p-12 max-w-md">
            <Terminal className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Project Not Found
            </h2>
            <p className="text-muted-foreground font-mono mb-6">
              The project you're looking for doesn't exist.
            </p>
            <Link to="/projects">
              <Button variant="cyber">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </Link>
          </CyberCard>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Link to="/projects" className="inline-block mb-8">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>

          {/* Project Image */}
          {project.image_url && (
            <div className="mb-8 rounded-lg overflow-hidden border border-primary/20">
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          {/* Header */}
          <CyberCard variant="glow" className="p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-primary" />
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {project.title}
                </h1>
              </div>
              {project.status === "classified" ? (
                <Lock className="w-6 h-6 text-destructive" />
              ) : (
                <Badge
                  variant="outline"
                  className={statusColors[project.status] || statusColors.active}
                >
                  {project.status}
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground text-lg mb-6">
              {project.description || "No description provided"}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mb-6">
              {project.language && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      languageColors[project.language] || "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-mono text-muted-foreground">
                    {project.language}
                  </span>
                </div>
              )}
              {project.stars !== null && project.stars > 0 && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-mono">{project.stars}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-mono">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="font-mono border-primary/30 text-muted-foreground"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Team Members or Owner */}
            {project.is_team_project &&
              project.members &&
              project.members.length > 0 ? (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-secondary" />
                    <span className="text-sm font-semibold text-foreground">
                      Team Members
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <Link
                        key={member.id}
                        to={`/member/${member.id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/30 rounded-full hover:bg-secondary/20 transition-colors"
                      >
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.username || "Member"}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-secondary/30" />
                        )}
                        <span className="text-sm text-secondary">
                          @{member.username || member.email?.split("@")[0]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                project.owner && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-semibold text-foreground">
                        Owner
                      </span>
                    </div>
                    <Link
                      to={`/member/${project.owner.id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/30 rounded-full hover:bg-secondary/20 transition-colors"
                    >
                      {project.owner.avatar_url ? (
                        <img
                          src={project.owner.avatar_url}
                          alt={project.owner.username || "Owner"}
                          className="w-5 h-5 rounded-full"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-secondary/30" />
                      )}
                      <span className="text-sm text-secondary">
                        @{project.owner.username || project.owner.email?.split("@")[0]}
                      </span>
                    </Link>
                  </div>
                )
              )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="cyber">
                    <Code className="w-4 h-4 mr-2" />
                    View on GitHub
                  </Button>
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="cyber-secondary">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
          </CyberCard>
        </div>
      </section>
    </Layout>
  );
}
