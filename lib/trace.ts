import {
  context,
  propagation,
  trace,
  SpanStatusCode,
  SpanKind,
  ROOT_CONTEXT,
  ContextAPI,
  Span,
  SpanOptions,
  Tracer,
  AttributeValue,
  TextMapGetter,
  createContextKey,
} from "@opentelemetry/api";

interface ITracer {
  getContext(): ContextAPI;

  /**
   * Returns currently activated span if current context is in the scope of the span.
   * Returns undefined otherwise.
   */
  getActiveScopeSpan(): Span | undefined;

  /**
   * Instruments a function by automatically creating a span activated on its
   * scope.
   *
   * The span will automatically be finished when one of these conditions is
   * met:
   *
   * * The function returns a promise, in which case the span will finish when
   * the promise is resolved or rejected.
   * * The function takes a callback as its second parameter, in which case the
   * span will finish when that callback is called.
   * * The function doesn't accept a callback and doesn't return a promise, in
   * which case the span will finish at the end of the function execution.
   *
   */
  trace<T>(
    name: string,
    fn: (span?: Span, done?: (error?: Error) => any) => Promise<T>
  ): Promise<T>;
}

let lastSpanId = 0;
const getSpanId = () => lastSpanId++;
const rootSpanIdKey = createContextKey("next-swa.rootSpanId");

class AppTracer implements ITracer {
  /**
   * Returns an instance to the trace with configured name.
   * Since wrap / trace can be defined in any place prior to actual trace subscriber initialization,
   * This should be lazily evaluated.
   */
  private getTracerInstance(): Tracer {
    return trace.getTracer("next-swa", "0.0.1");
  }

  public getContext(): ContextAPI {
    return context;
  }

  public getActiveScopeSpan(): Span | undefined {
    return trace.getSpan(context?.active());
  }

  // Trace, wrap implementation is inspired by datadog trace implementation
  // (https://datadoghq.dev/dd-trace-js/interfaces/tracer.html#trace).
  public trace<T>(
    spanName: string,
    fn: (span: Span, done?: (error?: Error) => any) => Promise<T>
  ): Promise<T> {
    const ctx = context.active();
    const spanId = getSpanId();

    return context.with(ctx.setValue(rootSpanIdKey, spanId), () =>
      this.getTracerInstance().startActiveSpan(spanName, (span) => {
        const result = fn(span);

        return result
          .then((res) => {
            return res;
          })
          .finally(() => {
            span.end();
          });
      })
    );
  }
}

const getTracer = (() => {
  const tracer = new AppTracer();

  return () => tracer;
})();

export { getTracer };
export type { ITracer };
