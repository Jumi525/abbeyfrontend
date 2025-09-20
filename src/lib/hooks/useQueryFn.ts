import {
  useInfiniteQuery,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";

interface UseInfiniteResourceOpts {
  queryKey: (string | unknown)[];
  endpoint: string;
  pageSize?: number;
  enabled?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
}

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.your-domain.com";

export function useInfiniteResource<T = any>({
  queryKey,
  endpoint,
  pageSize = 20,
  enabled = true,
  params = {},
}: UseInfiniteResourceOpts) {
  const { data: session } = useSession();
  return useInfiniteQuery({
    queryKey: [...queryKey, params],
    queryFn: async ({ pageParam = 0 }) => {
      const token = session?.accessToken;
      const searchParams = new URLSearchParams();

      searchParams.set("skip", String(pageParam));
      searchParams.set("take", String(pageSize));

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.set(key, String(value));
        }
      });

      const url = `${BASE_API_URL}${endpoint}?${searchParams.toString()}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");
      return res.json() as Promise<T>;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) =>
      lastPage?.hasMore ? lastPage.skip + lastPage.take : undefined,
    enabled,
  });
}

type UseResourceQueryOpts<T = any> = {
  queryKey: readonly unknown[];
  endpoint: string;
  enabled?: boolean;
  params?: Record<string, string | number | boolean | null | undefined>;
};

export function useResourceQuery<T = any>({
  queryKey,
  endpoint,
  enabled = true,
  params = {},
}: UseResourceQueryOpts<T>): UseQueryResult<T> {
  const { data: session } = useSession();
  return useQuery({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const token = session?.accessToken;
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.set(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = `${BASE_API_URL}${endpoint}${
        queryString ? `?${queryString}` : ""
      }`;

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
      return res.json() as Promise<T>;
    },
    enabled,
  });
}
