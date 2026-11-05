/** Translate only legacy Java paths with a known Spring API equivalent. */
export function toJavaApiPath(path: string): string {
  if (path.startsWith("/api/v1/")) return path;
  const aliases: Array<[string,string]> = [["/api/auth/","/api/v1/auth/"],["/api/client/profile","/api/v1/client/profile"]];
  for (const [legacy,current] of aliases) if (path === legacy || path.startsWith(legacy)) return current + path.slice(legacy.length);
  return path;
}
export function getAiGatewayBaseUrl(apiBaseUrl: string): string { return `${apiBaseUrl.replace(/\/+$/, "")}/ai`; }
