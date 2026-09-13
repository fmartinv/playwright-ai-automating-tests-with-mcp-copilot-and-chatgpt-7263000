import type { APIRequestContext } from "@playwright/test";

export interface SeededBug {
  id: number;
  title: string;
  severity: string;
  owner: string;
  description: string;
  state?: string;
}

export async function createBugViaApi(
  request: APIRequestContext,
  data: Partial<Omit<SeededBug, "id">> & Pick<SeededBug, "title">
): Promise<SeededBug> {
  const response = await request.post("/api/bugs", {
    data: {
      title: data.title,
      severity: data.severity ?? "mid",
      owner: data.owner ?? "coverage-tester",
      description: data.description ?? "Created for coverage testing",
    },
  });
  if (!response.ok()) {
    throw new Error(`Failed to create bug: ${response.status()}`);
  }
  return (await response.json()) as SeededBug;
}

export async function deleteBugViaApi(request: APIRequestContext, id: number) {
  await request.delete(`/api/bugs/${id}`);
}

export async function deleteBugsViaApi(
  request: APIRequestContext,
  bugs: SeededBug[]
) {
  for (const bug of bugs) {
    await deleteBugViaApi(request, bug.id);
  }
}
