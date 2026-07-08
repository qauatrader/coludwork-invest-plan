import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not found" });
});

// Global error handler (Express 5 forwards rejected async handler promises here)
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, url: req.url, method: req.method }, "Unhandled request error");
  if (res.headersSent) return;
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({
    error: status === 500 ? "Internal server error" : (err?.message ?? "Request failed"),
  });
});

export default app;
