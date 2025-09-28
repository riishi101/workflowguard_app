export function retry({
  retries = 3,
  factor = 2,
  minTimeout = 1000,
  onRetry,
}: {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  onRetry?: (error: any, attempt: number) => void;
}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let lastError: any;
      for (let i = 0; i < retries; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          if (onRetry) {
            onRetry(error, i + 1);
          }
          const timeout = minTimeout * factor ** i;
          await new Promise((resolve) => setTimeout(resolve, timeout));
        }
      }
      throw lastError;
    };

    return descriptor;
  };
}