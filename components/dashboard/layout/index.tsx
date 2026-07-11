import React from "react";

interface DashboardPageLayoutProps {
  children: React.ReactNode;

  header: {
    title: string;
    description?: string;
    icon: React.ElementType;
  };
}

export default function DashboardPageLayout({
  children,
  header,
}: DashboardPageLayoutProps) {
  return (
    <div className="flex flex-col relative w-full gap-1 min-h-full">
      {/* Page header */}
      <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 lg:pt-7 ring-2 ring-pop sticky top-header-mobile lg:top-0 bg-background z-10">
        <div className="flex shrink-0 size-8 md:size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <header.icon className="size-4 md:size-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl lg:text-4xl font-display leading-none">
            {header.title}
          </h1>
          {header.description && (
            <span className="text-sm text-muted-foreground mt-0.5">
              {header.description}
            </span>
          )}
        </div>
      </div>

      {/* Page content */}
      <div className="min-h-full flex-1 flex flex-col gap-6 md:gap-10 px-4 lg:px-6 py-6 md:py-8 ring-2 ring-pop bg-background">
        {children}
      </div>
    </div>
  );
}
