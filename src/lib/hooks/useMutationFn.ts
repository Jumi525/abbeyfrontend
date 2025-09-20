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

// @ts-ignore
export function useResourceMutation<TResponse = any>(
  endpoint: string,
  method: MutationMethod,
  options?: MutationOptions
) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    // @ts-ignore
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
        // @ts-ignore
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(
          errorBody?.error || errorBody?.message || `${method} failed`
        );
      }

      // @ts-ignore
      const body = await res.json().catch(() => ({}));
      // @ts-ignore
      return body as TResponse;
    },

    // @ts-ignore
    onMutate: async (payload: any) => {
      if (!options?.queryKey) return { previous: null };

      // @ts-ignore
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      // @ts-ignore
      const previous = queryClient.getQueryData(options.queryKey);

      // @ts-ignore
      if (options.isInfinite && previous) {
        // @ts-ignore
        queryClient.setQueryData(options.queryKey, (old: any) => {
          if (!old?.pages) return old;
          // @ts-ignore
          const newPages = old.pages.map((page: any) => {
            let events = page.events || [];

            if (method === "DELETE") {
              // @ts-ignore
              events = events.filter(
                (e: any) => String(e.id) !== String(payload)
              );
            } else if (method === "POST") {
              // @ts-ignore
              events = [{ ...payload, id: "temp-id" }, ...events];
            } else if (method === "PUT" || method === "PATCH") {
              // @ts-ignore
              events = events.map((e: any) =>
                // @ts-ignore
                String(e.id) === String(payload.id) ? { ...e, ...payload } : e
              );
            }

            return { ...page, events };
          });
          return { ...old, pages: newPages };
        });
      } else {
        // @ts-ignore
        queryClient.setQueryData(options.queryKey, (old: any) => {
          if (Array.isArray(old)) {
            if (method === "DELETE") {
              // @ts-ignore
              return old.filter((e) => String(e.id) !== String(payload));
            }
            if (method === "POST") {
              // @ts-ignore
              return [{ ...payload, id: "temp-id" }, ...old];
            }
            if (method === "PUT" || method === "PATCH") {
              // @ts-ignore
              return old.map((e) =>
                // @ts-ignore
                String(e.id) === String(payload.id) ? { ...e, ...payload } : e
              );
            }
          }

          if (old?.data && Array.isArray(old.data)) {
            if (method === "DELETE") {
              return {
                ...old,
                // @ts-ignore
                data: old.data.filter(
                  (e: any) => String(e.id) !== String(payload)
                ),
              };
            }
            if (method === "POST") {
              return {
                ...old,
                // @ts-ignore
                data: [{ ...payload, id: "temp-id" }, ...old.data],
              };
            }
            if (method === "PUT" || method === "PATCH") {
              return {
                ...old,
                // @ts-ignore
                data: old.data.map((e: any) =>
                  // @ts-ignore
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

    // @ts-ignore
    onError: (err, _payload, context: any) => {
      console.error("Mutation failed with message:", err.message);

      // @ts-ignore
      if (options?.queryKey && context?.previous) {
        // @ts-ignore
        queryClient.setQueryData(options.queryKey, context.previous);
      }

      // @ts-ignore
      options?.onError?.(err as Error);
    },

    // @ts-ignore
    onSettled: () => {
      // @ts-ignore
      if (options?.queryKey) {
        // @ts-ignore
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      }
      // @ts-ignore
      if (options?.extraKeys) {
        // @ts-ignore
        options.extraKeys.forEach((key) =>
          // @ts-ignore
          queryClient.invalidateQueries({ queryKey: key })
        );
      }
      options?.onSuccess?.();
    },
  });
}
