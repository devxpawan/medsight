import { Link } from "react-router-dom";
import { Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedicineCardProps {
  id: string;
  name: string | null;
  illness: string;
  imageUrl?: string;
}

export const MedicineCard = ({ id, name, illness, imageUrl }: MedicineCardProps) => {
  return (
    <Link
      to={`/medicine/${id}`}
      className="group block overflow-hidden rounded-2xl bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name || illness}
            loading="lazy"
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-soft">
            <Pill className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-medium text-card-foreground">
          {name || "Unnamed medicine"}
        </h3>
        <Badge variant="secondary" className="bg-primary-soft text-primary hover:bg-primary-soft">
          {illness}
        </Badge>
      </div>
    </Link>
  );
};
