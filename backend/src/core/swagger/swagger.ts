import path from "path";
import swaggerJsdoc from "swagger-jsdoc";

declare module "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tender API",
      version: "1.0.0",
      description: "API documentation for Tender System",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: [path.resolve(__dirname, "../../modules/**/*.ts")],
};

export const swaggerSpec = swaggerJsdoc(options);
