import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import plansRouter from "./plans";
import walletRouter from "./wallet";
import referralRouter from "./referral";
import tasksRouter from "./tasks";
import notificationsRouter from "./notifications";
import profileRouter from "./profile";
import supportRouter from "./support";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/plans", plansRouter);
router.use("/wallet", walletRouter);
router.use("/referral", referralRouter);
router.use("/tasks", tasksRouter);
router.use("/notifications", notificationsRouter);
router.use("/profile", profileRouter);
router.use("/support", supportRouter);
router.use("/admin", adminRouter);

export default router;
