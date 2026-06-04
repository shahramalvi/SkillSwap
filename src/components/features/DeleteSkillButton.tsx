import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSkills } from "../../hooks/useSkills";
import { isDemoSkill } from "../../lib/dashboardDemoData";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface DeleteSkillButtonProps {
  skillId: string;
  skillTitle: string;
  fullWidth?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function DeleteSkillButton({
  skillId,
  skillTitle,
  fullWidth = false,
  size = "sm",
  className,
}: DeleteSkillButtonProps) {
  const { deleteSkill } = useSkills();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (isDemoSkill(skillId)) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteSkill(skillId);
      toast.success("Skill removed");
      setOpen(false);
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete skill");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={size}
        fullWidth={fullWidth}
        className={className}
        onClick={() => setOpen(true)}
      >
        <Trash2 size={13} className="mr-1 inline" /> Delete
      </Button>

      <Modal open={open} onClose={() => !deleting && setOpen(false)} title="Remove skill offer?">
        <p className="text-sm text-muted leading-relaxed">
          <span className="font-semibold text-navy">&ldquo;{skillTitle}&rdquo;</span> will be removed
          from the jobs board and your profile. This cannot be undone.
        </p>
        <p className="text-xs text-muted mt-3">
          Open exchange requests for this skill are not deleted automatically.
        </p>
        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
          <Button
            type="button"
            variant="ghost"
            size="md"
            fullWidth
            disabled={deleting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            fullWidth
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? "Removing…" : "Remove skill"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
