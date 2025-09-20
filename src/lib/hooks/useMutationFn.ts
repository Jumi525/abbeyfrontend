"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://api.your-domain.com";

type MutationMethod = "POST" | "PUT" | "PATCH" | "DELETE";

type MutationOptions = {
  queryKey?: readonly unknown[];
  extraKeys?: readonly unknown[][];
  isInfinite?: boolean;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
};

export function useResourceMutation<TResponse = any>(
  endpoint: string,
  method: MutationMethod,
  options?: MutationOptions
) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: any) => {
      let url = `${BASE_API_URL}${endpoint}`;
      const isFormData = payload instanceof FormData;

      if (
        method === "DELETE" &&
        (typeof payload === "string" || typeof payload === "number")
      ) {
        url += `?id=${payload}`;
      }

      const token = session?.accessToken;

      const res = await fetch(url, {
        method,
        body:
          method !== "DELETE"
            ? isFormData
              ? payload
              : JSON.stringify(payload)
            : undefined,
        headers: isFormData
          ? undefined
          : {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          errorBody?.error || errorBody?.message || `${method} failed`
        );
      }

      const body = await res.json().catch(() => ({}));
      return body as TResponse;
    },

    onMutate: async (payload: any) => {
      if (!options?.queryKey) return { previous: null };

      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previous = queryClient.getQueryData(options.queryKey);

      if (options.isInfinite && previous) {
        queryClient.setQueryData(options.queryKey, (old: any) => {
          if (!old?.pages) return old;
          const newPages = old.pages.map((page: any) => {
            let events = page.events || [];

            if (method === "DELETE") {
              events = events.filter(
                (e: any) => String(e.id) !== String(payload)
              );
            } else if (method === "POST") {
              events = [{ ...payload, id: "temp-id" }, ...events];
            } else if (method === "PUT" || method === "PATCH") {
              events = events.map((e: any) =>
                String(e.id) === String(payload.id) ? { ...e, ...payload } : e
              );
            }

            return { ...page, events };
          });
          return { ...old, pages: newPages };
        });
      } else {
        queryClient.setQueryData(options.queryKey, (old: any) => {
          if (Array.isArray(old)) {
            if (method === "DELETE") {
              return old.filter((e) => String(e.id) !== String(payload));
            }
            if (method === "POST") {
              return [{ ...payload, id: "temp-id" }, ...old];
            }
            if (method === "PUT" || method === "PATCH") {
              return old.map((e) =>
                String(e.id) === String(payload.id) ? { ...e, ...payload } : e
              );
            }
          }

          if (old?.data && Array.isArray(old.data)) {
            if (method === "DELETE") {
              return {
                ...old,
                data: old.data.filter(
                  (e: any) => String(e.id) !== String(payload)
                ),
              };
            }
            if (method === "POST") {
              return {
                ...old,
                data: [{ ...payload, id: "temp-id" }, ...old.data],
              };
            }
            if (method === "PUT" || method === "PATCH") {
              return {
                ...old,
                data: old.data.map((e: any) =>
                  String(e.id) === String(payload.id) ? { ...e, ...payload } : e
                ),
              };
            }
          }

          return old;
        });
      }

      return { previous };
    },

    onError: (err, _payload, context: any) => {
      console.error("Mutation failed with message:", err.message);

      if (options?.queryKey && context?.previous) {
        queryClient.setQueryData(options.queryKey, context.previous);
      }

      options?.onError?.(err as Error);
    },

    onSettled: () => {
      if (options?.queryKey) {
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      }
      if (options?.extraKeys) {
        options.extraKeys.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        );
      }
      options?.onSuccess?.();
    },
  });
}
