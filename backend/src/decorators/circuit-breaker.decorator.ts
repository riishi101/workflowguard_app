import { HttpException, HttpStatus } from '@nestjs/common';

enum CircuitBreakerState {
  Closed,
  Open,
  HalfOpen,
}

export function circuitBreaker({
  failureThreshold = 3,
  successThreshold = 2,
  timeout = 10000, // 10 seconds
}: {
  failureThreshold?: number;
  successThreshold?: number;
  timeout?: number;
}) {
  let state = CircuitBreakerState.Closed;
  let failures = 0;
  let successes = 0;
  let lastFailureTime: number | null = null;

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      switch (state) {
        case CircuitBreakerState.Open:
          if (lastFailureTime && Date.now() - lastFailureTime > timeout) {
            state = CircuitBreakerState.HalfOpen;
            successes = 0;
          } else {
            throw new HttpException(
              'Service is currently unavailable. Please try again later.',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }
          break;
        case CircuitBreakerState.HalfOpen:
          // Allow a limited number of requests to pass through
          break;
        case CircuitBreakerState.Closed:
          // Allow requests to pass through
          break;
      }

      try {
        const result = await originalMethod.apply(this, args);
        successes++;
        if (state === CircuitBreakerState.HalfOpen && successes >= successThreshold) {
          state = CircuitBreakerState.Closed;
          failures = 0;
        }
        return result;
      } catch (error) {
        failures++;
        if (failures >= failureThreshold) {
          state = CircuitBreakerState.Open;
          lastFailureTime = Date.now();
        }
        throw error;
      }
    };

    return descriptor;
  };
}