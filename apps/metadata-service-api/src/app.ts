import express, { json, urlencoded, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";
import { ZodError } from "zod";
import { RegisterRoutes } from "openapi/routes";
import SwaggerSpec from "openapi/swagger.json";
import logger from "./utils/logger";

export function initApp() {
  const app = express();
  const router = express();
  app.use(json());
  app.use(
    urlencoded({
      extended: true,
    })
  );
  app.use(cors());

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(SwaggerSpec));

  app.use(router);
  RegisterRoutes(router);

  app.use((req, res) => {
    res.status(404).json({ message: `Not found` });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // res.status(500).json({ message: `Internal error: ${err.message}` });
    if (err instanceof ValidateError) {
      logger.warn(`Caught Validation Error for ${req.path}:`, err.fields);
      res.status(422).json({
        message: "Validation Failed",
        details: err?.fields,
      });
    } else if (err instanceof ZodError) {
      logger.warn(`Caught Validation Error for ${req.path}:`, {
        issues: err.issues,
      });
      res.status(422).json({
        message: "Validation Failed",
        details: err.toString(),
      });
    } else if (err instanceof Error) {
      logger.error(`Caught Internal Server Error for ${req.path}:`, err);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  });

  return app;
}

// Use body parser to read sent json payloads
// app.use(
//   urlencoded({
//     extended: true,
//   })
// );
// app.use(json());

// app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
//   return res.send(
//     swaggerUi.generateHTML(await import("tsoa/swagger.json"))
//   );
// });
