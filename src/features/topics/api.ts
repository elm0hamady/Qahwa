import { apiClient } from "@/lib/apiClient";
import type { Paginated, Topic } from "@/types/api";

export interface TopicListParams {
  search?: string;
  category?: string;
}

export async function fetchTopics(params: TopicListParams = {}): Promise<Paginated<Topic>> {
  const { data } = await apiClient.get<Paginated<Topic>>("/topics/", { params });
  return data;
}
