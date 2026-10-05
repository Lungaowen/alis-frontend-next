export class ModuleError extends Error { constructor(message:string, public code:string="MODULE_ERROR"){super(message);this.name="ModuleError";} }
export class AuthorizationError extends ModuleError { constructor(message="You are not authorized for this resource."){super(message,"FORBIDDEN");} }
export class NotFoundError extends ModuleError { constructor(message="Resource not found."){super(message,"NOT_FOUND");} }
