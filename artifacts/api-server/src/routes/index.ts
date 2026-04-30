import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import salesRouter from "./sales";
import reportsRouter from "./reports";
import expensesRouter from "./expenses";
import backupRouter from "./backup";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(salesRouter);
router.use(reportsRouter);
router.use(expensesRouter);
router.use(backupRouter);

export default router;
