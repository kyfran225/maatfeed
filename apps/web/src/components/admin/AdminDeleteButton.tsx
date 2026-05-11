import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { deleteContent } from "../../services/adminService";
import { useToast } from "../../hooks/useToast";

interface AdminDeleteButtonProps {
  contentId: string;
  title: string;
  onDeleteSuccess?: (contentId: string) => void;
}

export function AdminDeleteButton({ contentId, title, onDeleteSuccess }: AdminDeleteButtonProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isAdmin = profile?.role === "admin";

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!isAdmin) return;
    
    setIsDeleting(true);
    try {
      await deleteContent({
        contentId,
        reason: "admin_deleted"
      });
      
      setShowDeleteDialog(false);
      showToast("Contenu supprimé avec succès", "success");
      
      // Notifier le parent que le contenu a été supprimé
      onDeleteSuccess?.(contentId);
      
    } catch (error) {
      console.error("Failed to delete content:", error);
      
      // Vérifier si l'erreur est due au fait que le contenu est déjà supprimé
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('already deleted') || errorMessage.includes('not found') || errorMessage.includes('already marked as deleted')) {
        showToast("Ce contenu est déjà supprimé", "info");
        // Informer le parent quand même pour retirer l'élément de l'UI
        onDeleteSuccess?.(contentId);
      } else {
        showToast("Échec de la suppression du contenu", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        className="inline-flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
        title="Supprimer le contenu (admin)"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Suppr
      </button>
      
      {showDeleteDialog && createPortal(
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDelete}
          title={title}
          description={`Êtes-vous sûr de vouloir supprimer "${title}" ? Cette action masquera le contenu aux utilisateurs mais le conservera dans la base de données.`}
          isLoading={isDeleting}
        />,
        document.body
      )}
    </>
  );
}
