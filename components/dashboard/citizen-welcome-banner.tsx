"use client";

import Image from "next/image";
import Link from "next/link";
import { FilePlus2, MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CitizenWelcomeBanner() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-card border border-border p-5 sm:p-6">
      {/* Avatar */}
      {user?.avatar && (
        <div className="shrink-0 size-14 rounded-full overflow-hidden bg-accent ring-2 ring-border">
          <Image src={user.avatar} alt={user.name ?? "User"} width={56} height={56} className="object-cover" />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="text-2xl font-display truncate">Selamat datang, {firstName}</h2>
        {user?.area && (
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="size-3.5 text-muted-foreground shrink-0" />
            <Badge variant="secondary" className="text-xs">
              {user.area}
            </Badge>
          </div>
        )}
      </div>

      {/* CTA */}
      <Button asChild size="sm" className="hidden sm:flex shrink-0">
        <Link href="/report">
          <FilePlus2 className="size-4" />
          Report Issue
        </Link>
      </Button>
    </div>
  );
}
