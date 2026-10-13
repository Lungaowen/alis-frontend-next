import { MatterPageClient } from "@/components/matter-page-client";

const matterIds = ["MAT-1042", "MAT-1037", "MAT-1029", "MAT-1023", "MAT-1014"];

export function generateStaticParams() {
  return matterIds.map((id) => ({ id }));
}

export default async function MatterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MatterPageClient id={id} />;
}
