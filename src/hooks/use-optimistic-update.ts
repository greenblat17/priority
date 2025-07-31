import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

interface OptimisticUpdateOptions<TData, TVariables, TContext = unknown> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: string[]
  updateFn: (oldData: any, variables: TVariables) => any
  successMessage?: string
  errorMessage?: string
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables, context?: TContext) => void
}

export function useOptimisticUpdate<TData = unknown, TVariables = unknown, TContext = unknown>({
  mutationFn,
  queryKey,
  updateFn,
  successMessage,
  errorMessage = 'Action failed. Please try again.',
  onSuccess,
  onError,
}: OptimisticUpdateOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables, { previousData: any }>({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey })

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey)

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (oldData: any) => {
        return updateFn(oldData, variables)
      })

      // Return a context object with the snapshotted value
      return { previousData }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      
      toast.error(errorMessage)
      onError?.(error, variables, context as TContext)
    },
    onSuccess: (data, variables) => {
      if (successMessage) {
        toast.success(successMessage)
      }
      onSuccess?.(data, variables)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// Specialized hook for delete operations with undo
interface OptimisticDeleteOptions<TData, TVariables> extends Omit<OptimisticUpdateOptions<TData, TVariables>, 'updateFn'> {
  filterFn: (oldData: any, variables: TVariables) => any
  undoDuration?: number
}

export function useOptimisticDelete<TData = unknown, TVariables = unknown>({
  mutationFn,
  queryKey,
  filterFn,
  successMessage = 'Item deleted',
  errorMessage = 'Failed to delete item',
  undoDuration = 5000,
  onSuccess,
  onError,
}: OptimisticDeleteOptions<TData, TVariables>) {
  const queryClient = useQueryClient()
  let undoTimeout: NodeJS.Timeout

  return useMutation<TData, Error, TVariables, { previousData: any; undoFn?: () => void }>({
    mutationFn: async (variables) => {
      // Create a promise that can be cancelled
      return new Promise<TData>((resolve, reject) => {
        const undoFn = () => {
          clearTimeout(undoTimeout)
          reject(new Error('Undo'))
        }

        // Show undo toast
        toast.success(successMessage, {
          action: {
            label: 'Undo',
            onClick: undoFn,
          },
          duration: undoDuration,
        })

        // Set timeout to execute deletion
        undoTimeout = setTimeout(async () => {
          try {
            const result = await mutationFn(variables)
            resolve(result)
          } catch (error) {
            reject(error)
          }
        }, undoDuration)
      })
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData(queryKey)

      queryClient.setQueryData(queryKey, (oldData: any) => {
        return filterFn(oldData, variables)
      })

      return { previousData }
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      
      if (error.message !== 'Undo') {
        toast.error(errorMessage)
        onError?.(error, variables, context)
      }
    },
    onSuccess: (data, variables) => {
      onSuccess?.(data, variables)
    },
    onSettled: (data, error) => {
      if (error?.message !== 'Undo') {
        queryClient.invalidateQueries({ queryKey })
      }
    },
  })
}