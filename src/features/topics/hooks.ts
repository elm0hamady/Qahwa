import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import type { Paginated, Topic } from "@/types/api";
import type { TopicListParams } from "./api";

async function fetchAllTopics(params: TopicListParams): Promise<Topic[]> {
  const all: Topic[] = [];
  let url: string | null = "/topics/";
  let query: Record<string, string> | undefined = {
    ...(params.search ? { search: params.search } : {}),
    ...(params.category ? { category: params.category } : {}),
  };

  // Follow DRF pagination links until exhausted. Ready-topic lists are small
  // (gameplay requires >=4 usable topics), so this stays cheap.
  while (url) {
    const { data }: { data: Paginated<Topic> } = await apiClient.get(url, { params: query });
    all.push(...data.results);
    url = data.next;
    query = undefined; // `next` already contains the querystring
  }
  return all;
}

export function useTopics(params: TopicListParams = {}) {
  return useQuery({
    queryKey: ["topics", params],
    queryFn: () => fetchAllTopics(params),
    staleTime: 1000 * 60 * 5,
  });
}
