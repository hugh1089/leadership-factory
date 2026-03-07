import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminPanel } from "./admin-panel";

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect("/");
  if (session.user.role !== "admin") redirect("/dashboard");

  const [projects, users] = await Promise.all([
    prisma.project.findMany({
      include: {
        user: { select: { name: true, email: true } },
        stepStatus: true,
        learners: { select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { projects: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const projectData = projects.map((p) => ({
    id: p.id,
    name: p.name,
    org: p.org,
    status: p.status,
    owner: p.user.name || p.user.email,
    learnerCount: p.learners.length,
    progress: Math.round((p.stepStatus.filter((s) => s.status === "completed").length / 17) * 100),
    updatedAt: p.updatedAt.toISOString().slice(0, 10),
    createdAt: p.createdAt.toISOString().slice(0, 10),
  }));

  const userData = users.map((u) => ({
    id: u.id,
    name: u.name || "",
    email: u.email,
    role: u.role,
    projectCount: u._count.projects,
    createdAt: u.createdAt.toISOString().slice(0, 10),
  }));

  return <AdminPanel projects={projectData} users={userData} />;
}
