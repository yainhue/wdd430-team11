export const instant = false;

import { SiteHeader } from "@/app/components/site-header";
import { ServiceDetail } from "@/app/components/service-detail";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <SiteHeader />
      <ServiceDetail id={id} />
    </div>
  );
}
