import {
  useAzureMonitor,
  AzureMonitorOpenTelemetryOptions,
} from "@azure/monitor-opentelemetry";

const connectionString = process.env["APPLICATIONINSIGHTS_CONNECTION_STRING"];

if (connectionString) {
  const options: AzureMonitorOpenTelemetryOptions = {
    azureMonitorExporterOptions: {
      connectionString,
    },
  };

  useAzureMonitor(options);
}
