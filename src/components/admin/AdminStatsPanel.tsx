import { useState } from "react";
import { CyberCard } from "@/components/cyber/CyberCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSiteStats, useCreateSiteStat, useUpdateSiteStat, useDeleteSiteStat } from "@/hooks/useSiteStats";
import { SiteStat } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Plus, Trash2, Edit, Save } from "lucide-react";

export function AdminStatsPanel() {
  const { data: stats, isLoading } = useSiteStats();
  const createStat = useCreateSiteStat();
  const updateStat = useUpdateSiteStat();
  const deleteStat = useDeleteSiteStat();
  const { toast } = useToast();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [newStat, setNewStat] = useState({
    stat_key: "",
    stat_label: "",
    stat_value: 0,
    display_order: 0,
  });

  const handleCreate = async () => {
    if (!newStat.stat_key || !newStat.stat_label) {
      toast({ title: "Error", description: "Key and label are required", variant: "destructive" });
      return;
    }

    try {
      await createStat.mutateAsync(newStat);
      toast({ title: "Success", description: "Stat created" });
      setNewStat({ stat_key: "", stat_label: "", stat_value: 0, display_order: stats?.length || 0 });
      setIsAddOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleUpdateValue = async (stat: SiteStat) => {
    try {
      await updateStat.mutateAsync({ id: stat.id, updates: { stat_value: editValue } });
      toast({ title: "Success", description: "Stat updated" });
      setEditingId(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteStat.mutateAsync(id);
      toast({ title: "Success", description: "Stat deleted" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const startEdit = (stat: SiteStat) => {
    setEditingId(stat.id);
    setEditValue(stat.stat_value);
  };

  return (
    <CyberCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-foreground">Homepage Stats</h3>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button variant="cyber" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Stat
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-primary/30">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Stat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Key (unique identifier)</Label>
                <Input
                  value={newStat.stat_key}
                  onChange={(e) => setNewStat({ ...newStat, stat_key: e.target.value })}
                  placeholder="e.g. total_hacks"
                />
              </div>
              <div>
                <Label>Label (display name)</Label>
                <Input
                  value={newStat.stat_label}
                  onChange={(e) => setNewStat({ ...newStat, stat_label: e.target.value })}
                  placeholder="e.g. Total Hacks"
                />
              </div>
              <div>
                <Label>Value</Label>
                <Input
                  type="number"
                  value={newStat.stat_value}
                  onChange={(e) => setNewStat({ ...newStat, stat_value: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={newStat.display_order}
                  onChange={(e) => setNewStat({ ...newStat, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button
                variant="cyber"
                className="w-full"
                onClick={handleCreate}
                disabled={createStat.isPending}
              >
                Create Stat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading stats...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-semibold">{stat.stat_label}</TableCell>
                  <TableCell className="font-mono text-muted-foreground">{stat.stat_key}</TableCell>
                  <TableCell>
                    {editingId === stat.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-24 h-8"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateValue(stat)}
                        >
                          <Save className="w-4 h-4 text-secondary" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{stat.stat_value}</span>
                    )}
                  </TableCell>
                  <TableCell>{stat.display_order}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(stat)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(stat.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!stats || stats.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No stats found
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
