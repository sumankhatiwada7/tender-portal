import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

declare module "swagger-jsdoc";

function toSwaggerGlob(...segments: string[]) {
  return path.resolve(__dirname, ...segments).replace(/\\/g, "/");
}

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tender API",
      version: "1.0.0",
      description: "API documentation for the queue and tender management backend",
    },
    tags: [
      { name: "System", description: "Health and documentation endpoints" },
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Tender", description: "Tender management endpoints" },
      { name: "Bid", description: "Bid management endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ApiResponse: {
          type: "object",
          required: ["message", "sucess"],
          properties: {
            message: {
              type: "string",
            },
            sucess: {
              type: "boolean",
            },
          },
        },
        ValidationErrorItem: {
          type: "object",
          required: ["message"],
          properties: {
            field: {
              type: "string",
            },
            message: {
              type: "string",
            },
          },
        },
        ValidationErrorResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ValidationErrorItem",
                  },
                },
              },
            },
          ],
        },
        User: {
          type: "object",
          required: ["id", "name", "email", "role"],
          properties: {
            id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            role: {
              type: "string",
              enum: ["admin", "government", "business"],
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
            },
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
            role: {
              type: "string",
              enum: ["government", "business"],
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
            },
          },
        },
        AuthResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["user"],
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          ],
        },
        LoginResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["token", "user"],
              properties: {
                token: {
                  type: "string",
                },
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          ],
        },
        Tender: {
          type: "object",
          required: ["id", "title", "description", "deadline", "budget", "createdBy", "status"],
          properties: {
            id: {
              type: "string",
            },
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            deadline: {
              type: "string",
              format: "date-time",
            },
            budget: {
              type: "number",
            },
            createdBy: {
              type: "string",
            },
            status: {
              type: "string",
              enum: ["open", "closed", "awarded"],
            },
            awardedto: {
              type: "string",
            },
          },
        },
        CreateTenderRequest: {
          type: "object",
          required: ["title", "description", "deadline", "budget"],
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            deadline: {
              type: "string",
              format: "date-time",
            },
            budget: {
              type: "number",
            },
          },
        },
        UpdateTenderRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: "string",
            },
            deadline: {
              type: "string",
              format: "date-time",
            },
            budget: {
              type: "number",
            },
            status: {
              type: "string",
              enum: ["open", "closed"],
            },
          },
        },
        TenderResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["tender"],
              properties: {
                tender: {
                  $ref: "#/components/schemas/Tender",
                },
              },
            },
          ],
        },
        TenderListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["tenders"],
              properties: {
                tenders: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Tender",
                  },
                },
              },
            },
          ],
        },
        Bid: {
          type: "object",
          required: ["id", "tenderId", "businessId", "proposal", "amount", "status"],
          properties: {
            id: {
              type: "string",
            },
            tenderId: {
              type: "string",
            },
            businessId: {
              type: "string",
            },
            proposal: {
              type: "string",
            },
            amount: {
              type: "number",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
            },
          },
        },
        CreateBidRequest: {
          type: "object",
          required: ["proposal", "amount"],
          properties: {
            proposal: {
              type: "string",
            },
            amount: {
              type: "number",
            },
          },
        },
        BidResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["bid"],
              properties: {
                bid: {
                  $ref: "#/components/schemas/Bid",
                },
              },
            },
          ],
        },
        BidListResponse: {
          allOf: [
            {
              $ref: "#/components/schemas/ApiResponse",
            },
            {
              type: "object",
              required: ["bids"],
              properties: {
                bids: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Bid",
                  },
                },
              },
            },
          ],
        },
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    paths: {
      "/": {
        get: {
          summary: "Health check",
          tags: ["System"],
          responses: {
            200: {
              description: "Backend is running",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api-docs.json": {
        get: {
          summary: "Get the generated OpenAPI specification",
          tags: ["System"],
          responses: {
            200: {
              description: "OpenAPI JSON document",
            },
          },
        },
      },
      "/api/v1/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AuthResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/auth/login": {
        post: {
          summary: "Log in a user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
            401: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tender/create": {
        post: {
          summary: "Create a tender",
          tags: ["Tender"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateTenderRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Tender created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TenderResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tender": {
        get: {
          summary: "Get all tenders",
          tags: ["Tender"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Tenders found successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TenderListResponse",
                  },
                },
              },
            },
            404: {
              description: "No tenders found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tender/{id}": {
        get: {
          summary: "Get a tender by id",
          tags: ["Tender"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Tender found successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TenderResponse",
                  },
                },
              },
            },
            404: {
              description: "Tender not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tender/update/{id}": {
        put: {
          summary: "Update a tender",
          tags: ["Tender"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpdateTenderRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Tender updated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TenderResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            404: {
              description: "Tender not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/tender/delete/{id}": {
        post: {
          summary: "Delete a tender",
          tags: ["Tender"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Tender deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
            404: {
              description: "Tender not found",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/bid/create/{tenderid}": {
        post: {
          summary: "Create a bid for a tender",
          tags: ["Bid"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "tenderid",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateBidRequest",
                },
              },
            },
          },
          responses: {
            201: {
              description: "Bid created successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BidResponse",
                  },
                },
              },
            },
            400: {
              description: "Validation failed or duplicate bid",
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      {
                        $ref: "#/components/schemas/ValidationErrorResponse",
                      },
                      {
                        $ref: "#/components/schemas/ApiResponse",
                      },
                    ],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/bid/tender/{tenderid}": {
        get: {
          summary: "Get all bids for a tender",
          tags: ["Bid"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "tenderid",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Bids retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BidListResponse",
                  },
                },
              },
            },
            404: {
              description: "No bids found for this tender",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/api/v1/bid/tender/{tenderid}/{bidid}": {
        get: {
          summary: "Get one bid for a tender",
          tags: ["Bid"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "tenderid",
              required: true,
              schema: {
                type: "string",
              },
            },
            {
              in: "path",
              name: "bidid",
              required: true,
              schema: {
                type: "string",
              },
            },
          ],
          responses: {
            200: {
              description: "Bid retrieved successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/BidResponse",
                  },
                },
              },
            },
            404: {
              description: "Bid not found for this tender",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ApiResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    toSwaggerGlob("../../index.ts"),
    toSwaggerGlob("../../modules/**/*.ts"),
    toSwaggerGlob("../../../src/index.ts"),
    toSwaggerGlob("../../../src/modules/**/*.ts"),
    toSwaggerGlob("../../index.js"),
    toSwaggerGlob("../../modules/**/*.js"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
