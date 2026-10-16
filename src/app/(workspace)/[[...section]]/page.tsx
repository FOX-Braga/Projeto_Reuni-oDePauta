import { WorkspaceView } from "@/features/workspace/view";
export default async function Page({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section = [] } = await params;
  return <WorkspaceView section={section} />;
}
